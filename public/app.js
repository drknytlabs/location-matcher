const apiUrl = "/match-location";
const subdivisionColors = {
  "Meadowbrook Forest": "green",
  "Meadowbrook Hills #1": "blue",
  "Meadowbrook Hills #2": "purple",
  "Meadowbrook Hills #3": "red",
  "Meadowbrook Hills #4": "orange",
  "Meadowbrook Hills": "darkblue",
  "Meadowbrook Woods": "darkgreen"
};

let map;
let currentMatch = null;

function getColorIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

function addPropertyMarker({ lat, lng, address, subdivision }) {
  if (!lat || !lng) return;
  const colorKey = subdivisionColors[subdivision] || 'gray';
  const marker = L.marker([lat, lng], {
    icon: getColorIcon(colorKey)
  }).addTo(map);
  marker.bindPopup(`<strong>${address}</strong><br>${subdivision}`);
}

window.addEventListener("DOMContentLoaded", () => {
  map = L.map('map').setView([42.441, -83.424], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Load all markers
  fetch('/api/properties')
    .then(res => res.json())
    .then(data => data.forEach(addPropertyMarker))
    .catch(err => console.error('❌ Failed to load markers:', err));

  // Try geolocation
  tryGeolocation();

  // Manual search
  setupAutocomplete();
});

// 🔍 Geolocation Matching
async function tryGeolocation() {
  const status = document.getElementById("status");
  const manual = document.getElementById("manual-search");

  try {
    status.textContent = "📍 Getting your location...";
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    );
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    L.marker([lat, lng], { icon: getColorIcon('blue') }).addTo(map).bindPopup("You are here").openPopup();
    map.setView([lat, lng], 15);

    const res = await fetch(`${apiUrl}?lat=${lat}&lng=${lng}`);
    const data = await res.json();

    if (data.match) {
      showMatchResult(data.match);
      status.textContent = `✅ Matched: ${data.match.address}`;
    } else {
      throw new Error("No match");
    }
  } catch (err) {
    console.warn("⚠️ Geolocation failed:", err.message);
    status.textContent = "⚠️ Couldn’t detect your location. Try searching manually.";
    manual?.classList.remove("hidden");
  }
}

// 🧠 Match Result Display
function showMatchResult(match) {
  currentMatch = match;

  document.getElementById("match-address").textContent = match.address;
  document.getElementById("match-resident").textContent = match.resident;
  document.getElementById("match-owners").textContent = match.all_owners || 'N/A';

  const isLikelyOwner = match.all_owners?.toLowerCase().includes(match.resident?.toLowerCase());
  document.getElementById("not-your-name").classList.toggle("hidden", isLikelyOwner);

  const filePath = `/pdfs/${match.deed}.pdf`;
  document.getElementById("deed-link").href = filePath;
  document.getElementById("deed-pdf").src = filePath;
  document.getElementById("download-deed").href = filePath;
  document.getElementById("download-deed").download = `${match.deed}.pdf`;
  document.getElementById("deed-pdf-viewer")?.classList.remove("hidden");

  const fields = {
    "fact-subdivision": match.subdivision,
    "fact-year-built": match.year_built,
    "fact-bedrooms": match.bedrooms,
    "fact-baths": match.baths,
    "fact-lot-size": match.lot_size_sqft,
    "fact-zoning": match.zoning,
    "fact-property-type": match.property_type,
    "fact-garage": match.garage_type,
    "fact-fireplace": match.fireplace,
    "fact-pool": match.pool,
    "fact-stories": match.stories,
    "fact-acreage": match.acreage ? `${parseFloat(match.acreage).toFixed(2)} acres` : 'N/A',
    "fact-purchase-date": match.purchase_date,
    "fact-purchase-price": formatCurrency(match.purchase_price)
  };

  for (const id in fields) {
    document.getElementById(id).textContent = fields[id] || 'N/A';
  }

  document.getElementById("match-result").classList.remove("hidden");
  document.getElementById("home-facts").classList.remove("hidden");
}

// 🔍 Address Search
function setupAutocomplete() {
  const input = document.getElementById("address-input");
  const list = document.getElementById("autocomplete-list");
  const searchBtn = document.getElementById("address-search-btn");

  input?.addEventListener("input", async () => {
    const query = input.value.trim();
    if (!query) return (list.innerHTML = '');

    const matches = await fetch(`/search-addresses?query=${encodeURIComponent(query)}`).then(res => res.json());
    list.innerHTML = matches.map(match =>
      `<li class="autocomplete-item" data-address="${match.address}">${match.address} — ${match.resident}</li>`
    ).join('');
  });

  input?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(input, list);
    }
  });

  searchBtn?.addEventListener("click", () => handleSearchSubmit(input, list));
  list?.addEventListener("click", e => {
    const item = e.target.closest(".autocomplete-item");
    if (!item) return;
    input.value = item.dataset.address;
    handleSearchSubmit(input, list);
  });
}

async function handleSearchSubmit(input, list) {
  const query = input.value.trim();
  if (!query) return;
  const matches = await fetch(`/search-addresses?query=${encodeURIComponent(query)}`).then(res => res.json());
  if (!matches.length) return alert("No address match found.");
  showMatchResult(matches[0]);
  list.innerHTML = '';
}

function formatCurrency(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 'N/A' : `$${num.toLocaleString()}`;
}

// 📄 PDF Export
document.getElementById("download-pdf-btn")?.addEventListener("click", () => {
  if (!currentMatch) return;
  const element = document.createElement("div");
  element.innerHTML = `
    <h2>🏡 Property Report</h2>
    <p><strong>Address:</strong> ${currentMatch.address}</p>
    <p><strong>Resident:</strong> ${currentMatch.resident}</p>
    <p><strong>All Owners:</strong> ${currentMatch.all_owners}</p>
    <p><strong>Subdivision:</strong> ${currentMatch.subdivision}</p>
    <p><strong>Year Built:</strong> ${currentMatch.year_built}</p>
    <p><strong>Bedrooms:</strong> ${currentMatch.bedrooms}</p>
    <p><strong>Baths:</strong> ${currentMatch.baths}</p>
    <p><strong>Lot Size:</strong> ${currentMatch.lot_size_sqft}</p>
    <p><strong>Zoning:</strong> ${currentMatch.zoning}</p>
    <p><strong>Garage:</strong> ${currentMatch.garage_type}</p>
    <p><strong>Pool:</strong> ${currentMatch.pool}</p>
    <p><strong>Fireplace:</strong> ${currentMatch.fireplace}</p>
    <p><strong>Stories:</strong> ${currentMatch.stories}</p>
    <p><strong>Acreage:</strong> ${currentMatch.acreage}</p>
    <p><strong>Purchase Date:</strong> ${currentMatch.purchase_date}</p>
  `;

  html2pdf().set({
    margin: 0.5,
    filename: `${currentMatch.address}_home_facts.pdf`
  }).from(element).save();
});