const express = require("express");
const pool = require("../configure");
 
const router = express.Router();
 
function isInt(v) {
  return /^\d+$/.test(String(v).trim());
}
 
router.get("/", async (req, res) => {
  const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;
  const limit = req.query.limit ?? 20;
  const offset = req.query.offset ?? 0;
 
  // validation
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
 
  // 
  const conditions = [];
  const values = [];
 
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
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`,
      values
    );
 
    const [rows] = await pool.query(
      `SELECT
         id,
         L_ListingID   AS listingId,
         L_Address     AS address,
         L_City        AS city,
         L_Zip         AS zipcode,
         L_SystemPrice AS price,
         L_Keyword2    AS beds,
         LM_Dec_3      AS baths
       FROM rets_property
       ${whereClause}
       ORDER BY id
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
 
module.exports = router;
