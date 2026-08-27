const request = require("supertest");
const express = require("express");

// Mock the pool BEFORE requiring the router, since the router captures
// a reference to `pool` at require-time via `require("../configure")`.
// jest.mock hoists this above the require calls below, so the router
// gets the mocked module instead of a real mysql2 connection.
jest.mock("../../configure", () => ({
  query: jest.fn(),
}));

const pool = require("../../configure");
const propertiesRouter = require("../properties");

function buildApp() {
  const app = express();
  app.use("/api/properties", propertiesRouter);
  return app;
}

describe("GET /api/properties", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
  });

  test("returns paginated results on success", async () => {
    // First call is the COUNT query, second is the SELECT — the route
    // issues them in that order, so the mock must resolve in that order.
    pool.query
      .mockResolvedValueOnce([[{ total: 2 }]])
      .mockResolvedValueOnce([
        [
          { id: 1, listingId: "111", address: "1 Main St", price: 500000 },
          { id: 2, listingId: "222", address: "2 Main St", price: 600000 },
        ],
      ]);

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.limit).toBe(20);
    expect(res.body.offset).toBe(0);
  });

  test("applies custom limit and offset", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 50 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties?limit=5&offset=10");

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(5);
    expect(res.body.offset).toBe(10);
    // Confirm the LIMIT/OFFSET values were actually passed to the SQL call,
    // not just echoed back in the JSON response.
    const selectCallArgs = pool.query.mock.calls[1];
    expect(selectCallArgs[1]).toEqual(expect.arrayContaining([5, 10]));
  });

  test("filters by city", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, city: "Beverly Hills" }]]);

    const res = await request(app).get("/api/properties?city=Beverly Hills");

    expect(res.status).toBe(200);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toMatch(/L_City/);
    expect(values).toContain("Beverly Hills");
  });

  test("filters by zipcode", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, zipcode: "90210" }]]);

    const res = await request(app).get("/api/properties?zipcode=90210");

    expect(res.status).toBe(200);
    const [, values] = pool.query.mock.calls[0];
    expect(values).toContain("90210");
  });

  test("filters by minPrice and maxPrice", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, price: 750000 }]]);

    const res = await request(app).get(
      "/api/properties?minPrice=500000&maxPrice=1000000"
    );

    expect(res.status).toBe(200);
    const [, values] = pool.query.mock.calls[0];
    expect(values).toEqual(expect.arrayContaining([500000, 1000000]));
  });

  test("filters by beds", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, beds: 3 }]]);

    const res = await request(app).get("/api/properties?beds=3");

    expect(res.status).toBe(200);
    const [, values] = pool.query.mock.calls[0];
    expect(values).toContain(3);
  });

  test("filters by baths", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([[{ id: 1, baths: 2.5 }]]);

    const res = await request(app).get("/api/properties?baths=2.5");

    expect(res.status).toBe(200);
    const [, values] = pool.query.mock.calls[0];
    expect(values).toContain(2.5);
  });

  test("rejects limit above 100", async () => {
    const res = await request(app).get("/api/properties?limit=500");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/limit/i);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("rejects limit below 1", async () => {
    const res = await request(app).get("/api/properties?limit=0");
    expect(res.status).toBe(400);
  });

  test("rejects non-integer limit", async () => {
    const res = await request(app).get("/api/properties?limit=abc");
    expect(res.status).toBe(400);
  });

  test("rejects negative offset", async () => {
    const res = await request(app).get("/api/properties?offset=-5");
    expect(res.status).toBe(400);
  });

  test("rejects non-integer minPrice", async () => {
    const res = await request(app).get("/api/properties?minPrice=cheap");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/minPrice/i);
  });

  test("rejects non-integer maxPrice", async () => {
    const res = await request(app).get("/api/properties?maxPrice=expensive");
    expect(res.status).toBe(400);
  });

  test("rejects non-integer beds", async () => {
    const res = await request(app).get("/api/properties?beds=many");
    expect(res.status).toBe(400);
  });

  test("rejects non-numeric baths", async () => {
    const res = await request(app).get("/api/properties?baths=lots");
    expect(res.status).toBe(400);
  });

  test("returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});

describe("GET /api/properties/:id", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
  });

  test("returns a property by id", async () => {
    pool.query.mockResolvedValueOnce([
      [{ id: 1, listingId: "1234567890", address: "1 Main St" }],
    ]);

    const res = await request(app).get("/api/properties/1234567890");

    expect(res.status).toBe(200);
    expect(res.body.listingId).toBe("1234567890");
  });

  test("returns 404 when property not found", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/9999999999");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No property found/);
  });

  test("returns 400 for a non-numeric id", async () => {
    const res = await request(app).get("/api/properties/not-a-number");
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 400 for an id that is too long", async () => {
    const res = await request(app).get("/api/properties/1234567890123456");
    expect(res.status).toBe(400);
  });

  test("returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).get("/api/properties/1234567890");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    pool.query.mockReset();
  });

  test("returns open houses for a valid property", async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1 }]]) // property existence check
      .mockResolvedValueOnce([
        [{ id: 1, listingId: "1234567890", date: "2026-09-01" }],
      ]);

    const res = await request(app).get(
      "/api/properties/1234567890/openhouses"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("returns an empty array when property has no open houses", async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1 }]]) // property exists
      .mockResolvedValueOnce([[]]); // but no open houses

    const res = await request(app).get(
      "/api/properties/1234567890/openhouses"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 404 when the property itself does not exist", async () => {
    pool.query.mockResolvedValueOnce([[]]); // property lookup finds nothing

    const res = await request(app).get(
      "/api/properties/9999999999/openhouses"
    );

    expect(res.status).toBe(404);
    // Second query (open houses) should never run if the property lookup
    // already failed -- confirms the short-circuit behavior in the route.
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("returns 400 for an invalid id", async () => {
    const res = await request(app).get(
      "/api/properties/not-valid/openhouses"
    );
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("db error"));

    const res = await request(app).get(
      "/api/properties/1234567890/openhouses"
    );

    expect(res.status).toBe(500);
  });
});
