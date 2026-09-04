const express = require("express");
const pool = require("../configure");

const router = express.Router();

function isInt(v) {
  return /^\d+$/.test(String(v).trim());
}

// Whitelist: keys are the sortBy values the API accepts, values are the
// actual SQL column names in rets_property. sortBy is never interpolated
// directly into the SQL string -- it's only ever used as a lookup key into
// this object, and only the mapped column name (never the raw user input)
// reaches the query. This matters because column/identifier names can't be
// parameterized with `?` placeholders the way values can, so a whitelist
// like this is the only safe way to accept a sort column from a client.
const SORT_COLUMNS = {
  price: "L_SystemPrice",
  dateListed: "ListingContractDate",
  sqft: "LotSizeSquareFeet",
  beds: "L_Keyword2",
};

function isValidSortOrder(v) {
  return v === "asc" || v === "desc";
}

router.get("/", async (req, res) => {
  const { city, zipcode, minPrice, maxPrice, beds, baths, sortBy, sortOrder } = req.query;
  const limit = req.query.limit ?? 20;
  const offset = req.query.offset ?? 0;

  if (!isInt(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: "limit must be an integer between 1 and 100" });
  }
  if (!isInt(offset) || offset < 0) {
    return res.status(400).json({ error: "offset must be a non-negative integer" });
  }
  if (minPrice !== undefined && !isInt(minPrice)) {
    return res.status(400).json({ error: "minPrice must be an integer" });
  }
  if (maxPrice !== undefined && !isInt(maxPrice)) {
    return res.status(400).json({ error: "maxPrice must be an integer" });
  }
  if (beds !== undefined && !isInt(beds)) {
    return res.status(400).json({ error: "beds must be an integer" });
  }
  if (baths !== undefined && isNaN(parseFloat(baths))) {
    return res.status(400).json({ error: "baths must be a number" });
  }

  // Build the ORDER BY clause from the whitelist above. Default to
  // ordering by id, which is stable and cheap (primary key), so pagination
  // never skips or repeats rows between requests when no sort is requested.
  let orderClause = "ORDER BY id";
  if (sortBy !== undefined) {
    if (!Object.prototype.hasOwnProperty.call(SORT_COLUMNS, sortBy)) {
      return res.status(400).json({
        error: `sortBy must be one of: ${Object.keys(SORT_COLUMNS).join(", ")}`,
      });
    }
    const order = sortOrder !== undefined ? String(sortOrder).toLowerCase() : "asc";
    if (!isValidSortOrder(order)) {
      return res.status(400).json({ error: "sortOrder must be 'asc' or 'desc'" });
    }
    const column = SORT_COLUMNS[sortBy];
    const dir = order.toUpperCase();
    // Secondary sort by id breaks ties deterministically -- without it,
    // rows with an equal sort value (e.g. many properties at the same
    // price) could appear in a different order on different pages,
    // causing duplicates or gaps as the user paginates.
    orderClause = `ORDER BY ${column} ${dir}, id ${dir}`;
  }

  const conditions = [];
  const values = [];

  // city is matched case-insensitively and trimmed on both sides, since
  // the source MLS data isn't consistently cased or whitespace-clean.
  if (city !== undefined) {
    conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
    values.push(city);
  }
  if (zipcode !== undefined) {
    conditions.push("L_Zip = ?");
    values.push(zipcode);
  }
  if (minPrice !== undefined) {
    conditions.push("L_SystemPrice >= ?");
    values.push(parseInt(minPrice, 10));
  }
  if (maxPrice !== undefined) {
    conditions.push("L_SystemPrice <= ?");
    values.push(parseInt(maxPrice, 10));
  }
  if (beds !== undefined) {
    conditions.push("L_Keyword2 = ?");
    values.push(parseInt(beds, 10));
  }
  if (baths !== undefined) {
    conditions.push("LM_Dec_3 = ?");
    values.push(parseFloat(baths));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    // Two separate queries: one for the total count (used for pagination
    // math on the frontend) and one for the actual page of rows. Running
    // COUNT(*) and SELECT ... LIMIT separately, rather than trying to get
    // both from one query, keeps the LIMIT/OFFSET logic simple and lets
    // MySQL use the same WHERE-clause index for both.
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`,
      values
    );

    const [rows] = await pool.query(
      `SELECT
         id,
         L_ListingID       AS listingId,
         L_Address         AS address,
         L_City            AS city,
         L_State           AS state,
         L_Zip             AS zipcode,
         L_SystemPrice     AS price,
         L_Keyword2        AS beds,
         LM_Dec_3          AS baths,
         LotSizeSquareFeet AS sqft,
         ListingContractDate AS dateListed,
         L_Photos
       FROM rets_property
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...values, parseInt(limit, 10), parseInt(offset, 10)]
    );

    res.json({
      total: countRows[0].total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      results: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function isValidId(v) {
  const s = String(v).trim();
  return /^\d+$/.test(s) && s.length <= 15;
}

router.get("/:id/openhouses", async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "id must be a valid integer listing ID" });
  }

  try {
    const listingId = id.trim();

    // Check the property exists before querying its open houses, so a
    // request for a nonexistent listing returns a clear 404 instead of a
    // confusing empty array that looks the same as "exists but no open
    // houses scheduled".
    const [propertyRows] = await pool.query(
      "SELECT id FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      [listingId]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({ error: `No property found with id ${listingId}` });
    }

    const [openHouseRows] = await pool.query(
      `SELECT
         id,
         L_ListingID   AS listingId,
         OpenHouseDate AS date,
         OH_StartTime  AS startTime,
         OH_EndTime    AS endTime,
         all_data      AS allData
       FROM rets_openhouse
       WHERE L_ListingID = ?
       ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
      [listingId]
    );

    res.json(openHouseRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "id must be a valid integer listing ID" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         L_ListingID       AS listingId,
         L_Address         AS address,
         L_City            AS city,
         L_State           AS state,
         L_Zip             AS zipcode,
         L_SystemPrice     AS price,
         L_Keyword2        AS beds,
         LM_Dec_3          AS baths,
         LotSizeSquareFeet AS sqft,
         L_Photos
       FROM rets_property
       WHERE L_ListingID = ?
       LIMIT 1`,
      [id.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No property found with id ${id}` });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
