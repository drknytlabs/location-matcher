const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'addresses.db');
const db = new sqlite3.Database(dbPath);

function getAllAddresses() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM addresses", (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { getAllAddresses };
