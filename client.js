const BASE_URL = "/api/properties";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) {
        message = body.error;
      }
    } catch {
      // response body wasn't JSON; fall back to generic message
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}

/**
 * @param {Object} params - query params (city, zipcode, minPrice, maxPrice, beds, baths, limit, offset)
 */
export async function fetchProperties(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const url = query.toString() ? `${BASE_URL}?${query.toString()}` : BASE_URL;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new ApiError("Unable to reach the server. Please check your connection.", 0);
  }

  return handleResponse(res);
}

/**
 * Fetches a single property by listing ID.
 * @param {string|number} id
 */
export async function fetchPropertyDetail(id) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/${id}`);
  } catch (err) {
    throw new ApiError("Unable to reach the server. Please check your connection.", 0);
  }

  return handleResponse(res);
}

/**
 * Fetches open houses for a given listing ID.
 * @param {string|number} id
 */
export async function fetchPropertyOpenHouses(id) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/${id}/openhouses`);
  } catch (err) {
    throw new ApiError("Unable to reach the server. Please check your connection.", 0);
  }

  return handleResponse(res);
}

export { ApiError };
