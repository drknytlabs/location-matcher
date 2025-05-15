const apiUrl = "/match-location";
const status = document.getElementById("status");
const result = document.getElementById("match-result");
const manual = document.getElementById("manual-search");

const input = document.getElementById("address-input");
const list = document.getElementById("autocomplete-list");
const searchBtn = document.getElementById("address-search-btn");

// ==========================
// GEOLOCATION MATCH ON LOAD
// ==========================
async function getCurrentPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
  );
}

async function tryGeolocation() {
  try {
    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    status.textContent = `📍 Location found. Matching...`;

    const res = await fetch(`${apiUrl}?lat=${lat}&lng=${lng}`);
    const data = await res.json();

    if (data.match) {
      showMatchResult(data.match);
      status.textContent = `✅ Address matched!`;
    } else {
      throw new Error("No match");
    }
  } catch (err) {
    console.warn("Geolocation failed or no match:", err);
    status.textContent = "⚠️ Could not detect a match. Search manually.";
    manual.classList.remove("hidden");
  }
}

tryGeolocation();

// ==========================
// AUTOCOMPLETE SEARCH LOGIC
// ==========================
async function searchAddresses(query) {
  const res = await fetch(`/search-addresses?query=${encodeURIComponent(query)}`);
  return await res.json();
}

function showMatches(matches) {
  list.innerHTML = matches.map(match => `
    <li class="autocomplete-item" data-address="${match.address}">
      ${match.address} — ${match.resident}
    </li>
  `).join('');
}

input.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!query) {
    list.innerHTML = '';
    return;
  }

  const matches = await searchAddresses(query);
  showMatches(matches);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearchSubmit();
  }
});

searchBtn.addEventListener("click", handleSearchSubmit);

list.addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;

  input.value = item.dataset.address;
  handleSearchSubmit();
});

async function handleSearchSubmit() {
  const query = input.value.trim();
  if (!query) return;

  const matches = await searchAddresses(query);
  if (matches.length === 0) {
    alert("No address match found.");
    return;
  }

  showMatchResult(matches[0]);
  list.innerHTML = '';
}

// ==========================
// RESULT DISPLAY SHARED FUNC
// ==========================
function showMatchResult(match) {
  document.getElementById("match-address").textContent = match.address;
  document.getElementById("match-resident").textContent = match.resident;
  const link = document.getElementById("deed-link");
  link.href = `/pdfs/${match.deed}`;
  link.style.display = 'inline-block';
  document.getElementById("match-result").classList.remove("hidden");

  // Populate home facts
  document.getElementById("fact-subdivision").textContent = match.subdivision || 'N/A';
  document.getElementById("fact-year-built").textContent = match.year_built || 'N/A';
  document.getElementById("fact-bedrooms").textContent = match.bedrooms || 'N/A';
  document.getElementById("fact-baths").textContent = match.baths || 'N/A';
  document.getElementById("fact-lot-size").textContent = match.lot_size_sqft || 'N/A';
  document.getElementById("fact-zoning").textContent = match.zoning || 'N/A';
  

  document.getElementById("match-result").classList.remove("hidden");
  document.getElementById("home-facts").classList.remove("hidden");
}

function formatCurrency(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 'N/A' : `$${num.toLocaleString()}`;
}
