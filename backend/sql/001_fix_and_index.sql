SET SESSION sql_mode = (SELECT REPLACE(REPLACE(@@sql_mode, 'STRICT_TRANS_TABLES', ''), 'NO_ZERO_DATE', ''));

UPDATE rets_property SET active_check = CURRENT_TIMESTAMP WHERE active_check = '0000-00-00 00:00:00';
ALTER TABLE rets_property MODIFY COLUMN active_check TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_price ON rets_property (L_SystemPrice);
CREATE INDEX idx_beds ON rets_property (L_Keyword2);
CREATE INDEX idx_baths ON rets_property (LM_Dec_3);
CREATE INDEX idx_city_price ON rets_property (L_City, L_SystemPrice);
CREATE INDEX idx_city_lower ON rets_property ((LOWER(TRIM(L_City))));

SHOW INDEXES FROM rets_property;