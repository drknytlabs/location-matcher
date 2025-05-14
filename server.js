const express = require('express');
const cors = require('cors');
const haversine = require('haversine-distance');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


const app = express();
app.use(cors()); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

const addressPoints = [
  {
    address: '123 Meadowbrook Ln',
    lat: 38.123456,
    lng: -85.456789,
    deed: 'meadowbrook_hills_3.pdf',
    resident: 'Andrew Buck'
  },
  {
    address: '456 Rolling Hills Dr',
    lat: 38.124111,
    lng: -85.455000,
    deed: 'meadowbrook_hills_1.pdf',
    resident: 'Tina Miller'
  }
];

function findClosest(lat, lng) {
  const inputPoint = { latitude: lat, longitude: lng };
  let closest = null;
  let shortest = Infinity;

  for (const entry of addressPoints) {
    const dist = haversine(inputPoint, { latitude: entry.lat, longitude: entry.lng });
    if (dist < shortest) {
      shortest = dist;
      closest = entry;
    }
  }

  return shortest < 100 ? closest : null; // 100 meters threshold
}

app.get('/match-location', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat/lng' });
  }

  const match = findClosest(lat, lng);
  res.json({ match });
});

app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
