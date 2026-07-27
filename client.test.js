import { fetchProperties, fetchPropertyDetail, ApiError } from "./client";


beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("fetchProperties", () => {
  test("builds a request with no query string when no params are given", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, limit: 20, offset: 0, results: [] }),
    });

    await fetchProperties();

    expect(global.fetch).toHaveBeenCalledWith("/api/properties");
  });

  test("includes provided filters in the query string and omits empty values", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 1, limit: 20, offset: 0, results: [] }),
    });

    await fetchProperties({ city: "Beverly Hills", zipcode: "", minPrice: 100000 });

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain("city=Beverly+Hills");
    expect(calledUrl).toContain("minPrice=100000");
    expect(calledUrl).not.toContain("zipcode=");
  });

  test("returns parsed JSON on a successful response", async () => {
    const mockData = { total: 41199, limit: 20, offset: 0, results: [{ id: 1 }] };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const data = await fetchProperties({ city: "Alhambra" });

    expect(data).toEqual(mockData);
  });

  test("throws an ApiError with the server's message on a non-ok response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "limit must be an integer between 1 and 100" }),
    });

    await expect(fetchProperties({ limit: 999 })).rejects.toThrow(
      "limit must be an integer between 1 and 100"
    );
  });

  test("throws an ApiError when the network request itself fails", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    let caughtError;
    try {
      await fetchProperties();
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(ApiError);
    expect(caughtError.message).toMatch(/unable to reach the server/i);
  });
});

describe("fetchPropertyDetail", () => {
  test("requests the correct URL for a given id", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 18, listingId: "1137580937" }),
    });

    await fetchPropertyDetail("1137580937");

    expect(global.fetch).toHaveBeenCalledWith("/api/properties/1137580937");
  });

  test("throws on a 404 response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "No property found with id 999999999" }),
    });

    await expect(fetchPropertyDetail("999999999")).rejects.toThrow(
      "No property found with id 999999999"
    );
  });
});
