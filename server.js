const express = require('express');
const cors = require('cors');
const haversine = require('haversine-distance');
const path = require('path');
const { loadResidentData } = require('./loader');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const residents = loadResidentData(); // Load once on boot

function findClosestAddress(inputLat, inputLng, rows) {
  const inputPoint = { latitude: inputLat, longitude: inputLng };
  let closest = null;
  let shortest = Infinity;

  for (const row of rows) {
    if (!row.lat || !row.lng) continue;
    const point = { latitude: row.lat, longitude: row.lng };
    const dist = haversine(inputPoint, point);
    if (dist < shortest) {
      shortest = dist;
      closest = row;
    }
  }

  return shortest < 100 ? closest : null;
}

app.get('/match-location', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat/lng' });
  }

  const match = findClosestAddress(lat, lng, residents);
  res.json({ match });
});

app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
app.get('/search-addresses', (req, res) => {
  const query = (req.query.query || '').toLowerCase();
  if (!query) return res.json([]);

  const matches = residents.filter(row =>
    row.address.toLowerCase().includes(query)
  ).slice(0, 10); // limit results

  res.json(matches);
});
