-- Run this using the sqlite3 CLI
CREATE TABLE addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT,
  resident TEXT,
  deed TEXT,
  lat REAL,
  lng REAL
);

-- Sample data
INSERT INTO addresses (address, resident, deed, lat, lng)
VALUES 
('123 Meadowbrook Ln', 'Andrew Buck', 'meadowbrook_hills_3.pdf', 38.123456, -85.456789),
('456 Rolling Hills Dr', 'Tina Miller', 'meadowbrook_hills_1.pdf', 38.124111, -85.455000);
