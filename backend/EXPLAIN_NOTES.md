# EXPLAIN Analysis — Week 9 Part B

## Query 1: Combined filter (city + price range + beds + baths)

```sql
EXPLAIN SELECT id, L_ListingID, L_Address, L_City, L_State, L_Zip, L_SystemPrice,
  L_Keyword2, LM_Dec_3, LotSizeSquareFeet, L_Photos
FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Beverly Hills'))
  AND L_SystemPrice >= 500000 AND L_SystemPrice <= 2000000
  AND L_Keyword2 = 4 AND LM_Dec_3 = 3.0
ORDER BY id LIMIT 20 OFFSET 0;
```

| Column | Value | Meaning |
|---|---|---|
| select_type | SIMPLE | No subqueries or unions — a plain single-table query |
| table | rets_property | The table being scanned |
| type | ref | MySQL used a non-unique index to find matching rows (better than a full table scan, worse than a unique lookup) |
| possible_keys | idx_price, idx_beds, idx_baths, idx_city_lower | All the indexes MySQL considered before picking one |
| key | idx_city_lower | The index MySQL actually chose — city was the most selective filter |
| key_len | 203 | Bytes of the index actually used (the full city column) |
| rows | 249 | Estimated rows MySQL had to examine after using the index |
| filtered | 8.92% | Of those 249 rows, only ~9% pass the remaining WHERE conditions (price/beds/baths), filtered in memory after the index lookup |
| Extra | Using where | Extra filtering happened after the index scan, in memory |

**Interpretation:** MySQL scans via `idx_city_lower` to get 249 candidate rows, then
checks price/beds/baths against each in memory. This is expected and correct —
city alone is selective enough (249 of 41,199 rows) that the optimizer decided a
wider composite index wasn't worth using, since fewer than 25 rows actually
matter post-filter either way. Added `idx_city_price_beds_baths` regardless, as
it may be chosen by the optimizer for other filter combinations or as the
dataset grows.

## Query 2: City filter + sort by date listed

```sql
EXPLAIN SELECT id, L_ListingID, L_Address, L_City, L_SystemPrice
FROM rets_property
WHERE L_City = 'Beverly Hills'
ORDER BY ListingContractDate DESC, id DESC
LIMIT 20 OFFSET 0;
```

### Before adding an index

| Column | Value | Meaning |
|---|---|---|
| type | ref | Non-unique index lookup |
| key | idx_L_City | Used the existing city index |
| rows | 249 | Rows examined |
| filtered | 100.00% | All 249 rows pass the WHERE clause (no other filters) |
| Extra | **Using filesort** | MySQL had to sort the 249 matching rows in a temporary buffer because no index covers the ORDER BY column (ListingContractDate) |

### After adding `idx_city_datelisted (L_City, ListingContractDate)`

| Column | Value | Meaning |
|---|---|---|
| type | ref | Still a non-unique index lookup |
| key | idx_city_datelisted | New composite index — covers both the WHERE (city) and ORDER BY (date) |
| rows | 249 | Same estimated row count |
| filtered | 100.00% | Same — no other filters |
| Extra | **Backward index scan** | MySQL walks the composite index in reverse (since sort is DESC) instead of sorting in memory — no filesort needed |

**Measured runtime after indexing:** ~1.6ms (0.00157925s) for the full query on
41,199 total rows — filesort eliminated entirely for this access pattern.

## Indexes added

```sql
CREATE INDEX idx_city_price_beds_baths ON rets_property (L_City, L_SystemPrice, L_Keyword2, LM_Dec_3);
CREATE INDEX idx_city_datelisted ON rets_property (L_City, ListingContractDate);
```

## Key takeaway

Composite indexes only help when their **column order matches the query's
access pattern** — city first (equality filter), then the sort/range column.
The `idx_city_datelisted` index eliminated a filesort entirely for city-scoped
date sorting. The `idx_city_price_beds_baths` index didn't change the plan for
this specific query since MySQL's optimizer correctly judged the existing city
index was already selective enough, but it's available for the optimizer to
use on other filter combinations.
