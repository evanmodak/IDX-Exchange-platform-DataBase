# IDX Exchange — Real Estate Listings Platform

A full-stack property search application: browse, filter, sort, and view
detailed listings (photos, map, open houses) backed by a MySQL database of
~41,000 real estate records.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18.3.1 |
| Frontend | React Router | 6.30.6 |
| Frontend | Create React App (react-scripts) | 5.0.1 |
| Backend | Node.js | 18.20.8 |
| Backend | Express | 5.2.1 |
| Backend | mysql2 | 3.22.5 |
| Database | MySQL | 8.4.10 |
| Testing (backend) | Jest + Supertest | 30.4.2 / 7.2.2 |
| Testing (frontend) | Jest + React Testing Library | bundled with react-scripts |
| Maps | Google Maps Embed API | n/a |

## Local Setup

These steps take you from a fresh clone to a running app. Tested on macOS;
Linux steps are equivalent, Windows users should run these in WSL.

### 1. Prerequisites

- Node.js 18.x (check with `node -v`) — install via [nvm](https://github.com/nvm-sh/nvm) if you don't have it
- Docker Desktop (for MySQL) — or a local MySQL 8.x install if you prefer
- A Google Maps API key with the Maps Embed API enabled (see step 5)

### 2. Clone and install dependencies

```bash
git clone https://github.com/evanmodak/IDX-Exchange-platform-DataBase.git
cd IDX-Exchange-platform-DataBase

cd backend && npm install
cd ../frontend && npm install
```

### 3. Set up MySQL

Run a MySQL 8 container:

```bash
docker run --name rets-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -d mysql:8
```

Create the database and import the schema/data dump (not included in this
repo, see Known Issues below):

```bash
docker exec -it rets-mysql mysql -u root -proot -e "CREATE DATABASE rets;"
docker exec -i rets-mysql mysql -u root -proot rets < path/to/rets_property.sql
```

### 4. Configure environment variables

Copy the example env files and fill in real values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DB_PASSWORD` to match what you used in step 3.

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` and set `REACT_APP_GOOGLE_MAPS_API_KEY` (see step 5).

### 5. Get a Google Maps API key

1. Go to console.cloud.google.com and sign in
2. Create a new project
3. Under APIs and Services, Library, enable the Maps Embed API
4. Under APIs and Services, Credentials, create an API key
5. Restrict the key to localhost:3000 and the Maps Embed API only
6. Paste the key into frontend/.env as REACT_APP_GOOGLE_MAPS_API_KEY

## Running the App

You need two terminal tabs, both left running.

Tab 1, backend:

```bash
cd backend
npm run dev
```

Wait for "Server running on port 5000".

Tab 2, frontend:

```bash
cd frontend
npm start
```

Wait for "Compiled successfully!". The app opens at http://localhost:3000.

Confirm the backend is reachable:

```bash
curl http://localhost:5000/api/health
```

## Running Tests

Backend, Jest and Supertest, mocked database:

```bash
cd backend
npm test
```

Frontend, Jest and React Testing Library:

```bash
cd frontend
CI=true npm test -- --coverage --watchAll=false
```

Both should report all suites passing. Coverage reports are written to
backend/coverage/ and frontend/coverage/, both gitignored.

## Architecture

Browser (React SPA, port 3000) talks over HTTP to an Express API server
(port 5000), which talks over SQL to a MySQL database (port 3306).

### Backend layout

- server.js: app entrypoint, health check, middleware wiring
- configure.js: mysql2 connection pool, env-driven
- middleware/requestLogger.js: logs method, path, status, duration per request
- routes/properties.js: all property-related endpoints
- routes/__tests__/properties.test.js: backend test suite

### Frontend layout

- api/client.js: fetch wrapper, ApiError class, backend calls
- pages/ListingsPage.jsx: search, grid, pagination, sort
- pages/PropertyDetailPage.jsx: single-property view
- components/: reusable UI pieces (PropertyCard, PropertyImageCarousel,
  PropertyImageGallery, PropertyMap, PropertyOpenHouses, PropertyFilters,
  SortControls, Pagination, ErrorBoundary)
- utils/parsePhotos.js: safe JSON parsing of the L_Photos field
- hooks/: reserved for future custom hooks

### Routing

App.js wraps two routes in a BrowserRouter, both inside an ErrorBoundary so
a render crash anywhere shows a recovery UI instead of a blank page.

- / goes to ListingsPage
- /property/:id goes to PropertyDetailPage

## API Reference

Base URL: http://localhost:5000/api

### GET /health

Checks database connectivity.

Example request:

```bash
curl http://localhost:5000/api/health
```

Example response, 200:

```json
{
  "success": true,
  "database": "connected",
  "result": { "status": 1 }
}
```

### GET /properties

Paginated, filtered property search.

Query parameters, all optional except pagination defaults:

- city: string, case-insensitive trimmed exact match
- zipcode: string, exact match
- minPrice: integer, inclusive lower bound
- maxPrice: integer, inclusive upper bound
- beds: integer, exact match
- baths: number, exact match
- limit: integer, 1 to 100, default 20
- offset: integer, 0 or more, default 0

Example request:

```bash
curl "http://localhost:5000/api/properties?city=Beverly%20Hills&minPrice=1000000&limit=2"
```

Example response, 200:

```json
{
  "total": 41199,
  "limit": 2,
  "offset": 0,
  "results": [
    {
      "id": 1,
      "listingId": "1234567890",
      "address": "2468 Coldwater Canyon Drive",
      "city": "Beverly Hills",
      "state": "CA",
      "zipcode": "90210",
      "price": 6395000,
      "beds": 4,
      "baths": "6.0",
      "sqft": "24844.00",
      "L_Photos": "[\"https://example.com/1.jpg\"]"
    }
  ]
}
```

Error response, 400, invalid input:

```json
{ "error": "limit must be an integer between 1 and 100" }
```

### GET /properties/:id

Fetch a single property by its L_ListingID.

Example request:

```bash
curl http://localhost:5000/api/properties/1234567890
```

Example response, 200:

```json
{
  "id": 1,
  "listingId": "1234567890",
  "address": "2468 Coldwater Canyon Drive",
  "city": "Beverly Hills",
  "state": "CA",
  "zipcode": "90210",
  "price": 6395000,
  "beds": 4,
  "baths": "6.0",
  "sqft": "24844.00",
  "L_Photos": "[\"https://example.com/1.jpg\"]"
}
```

Error response, 404:

```json
{ "error": "No property found with id 1234567890" }
```

Error response, 400, malformed id:

```json
{ "error": "id must be a valid integer listing ID" }
```

### GET /properties/:id/openhouses

Lists open houses for a property, ordered by date and time ascending.

Example request:

```bash
curl http://localhost:5000/api/properties/1234567890/openhouses
```

Example response, 200:

```json
[
  {
    "id": 5,
    "listingId": "1234567890",
    "date": "2026-09-06",
    "startTime": "13:00:00",
    "endTime": "16:00:00",
    "allData": "{\"OpenHouseRemarks\":\"Refreshments provided\"}"
  }
]
```

Returns an empty array with status 200 if the property exists but has no
open houses. Returns 404 if the property itself does not exist.

## Database Schema

Two tables, both keyed on L_ListingID, a string listing identifier, not the
MySQL id auto-increment primary key.

### rets_property

The main listings table, about 140 columns imported from an MLS feed. Only
the columns the API actually uses are listed here.

- id: int, primary key, auto_increment, internal row id
- L_ListingID: varchar(255), indexed, public listing id used in URLs
- L_Address: varchar(100), street address
- L_City: varchar(50), indexed, queried case-insensitively
- L_State: varchar(50)
- L_Zip: varchar(20), indexed
- L_SystemPrice: int, indexed, listing price
- L_Keyword2: int, indexed, bedroom count
- LM_Dec_3: decimal(4,1), indexed, bathroom count
- LotSizeSquareFeet: decimal(14,2)
- YearBuilt: int
- L_Remarks: mediumtext, listing description
- L_Photos: longtext, JSON-stringified array of photo URLs
- LMD_MP_Latitude and LMD_MP_Longitude: decimal, map coordinates
- ListingContractDate: date, used for sort by date listed

Indexes added for query performance, see backend/EXPLAIN_NOTES.md for the
full before and after EXPLAIN analysis:

- idx_city_price_beds_baths on (L_City, L_SystemPrice, L_Keyword2, LM_Dec_3)
- idx_city_datelisted on (L_City, ListingContractDate)

### rets_openhouse

- id: int, primary key, auto_increment
- L_ListingID: varchar(255), indexed, references rets_property.L_ListingID
- OpenHouseDate: date
- OH_StartTime and OH_EndTime: time
- all_data: longtext, JSON blob; OpenHouseRemarks is parsed out of this
  client-side

Relationship: one property in rets_property can have many open houses in
rets_openhouse, joined on L_ListingID. There is no formal foreign key
constraint in the schema, the relationship is enforced at the application
level, the API checks the property exists before querying its open houses.

## Known Issues and Future Improvements

### Known issues

- No SQL dump is included in the repo. The full rets_property data dump is
  too large for GitHub and is gitignored. Anyone setting up the project
  needs their own copy of the data or a script to generate sample data.
- No docker-compose.yml. MySQL setup currently requires manually running
  docker run with the right flags, documented above. A compose file would
  make this more reproducible.
- Backend sortBy and sortOrder query parameters were built and tested
  during development and are documented in EXPLAIN_NOTES.md, but are not
  present in the current backend/routes/properties.js on develop, a
  merge or commit issue during development dropped this file's edits.
  This needs to be re-added.
- Frontend test coverage is strong on PropertyCard, PropertyFilters,
  Pagination, and client.js, but low on PropertyMap, PropertyOpenHouses,
  PropertyImageGallery, SortControls, ListingsPage, and
  PropertyDetailPage. These were out of scope for the current testing
  pass and are good candidates for follow-up tests.
- Some property records in the sample dataset have implausible prices,
  for example under $1,000, that appear to be rental listings or bad
  source data mixed into the sale price field.

### Future improvements

- User accounts, saved searches, and a favorites feature
- An open house calendar view across all properties
- Natural language search, parsing a free text query into filters
- A caching layer in front of MySQL for frequently filtered queries
- Formal foreign key constraints between rets_property and rets_openhouse
- A CI pipeline to run npm test and npm run lint automatically on every
  pull request
