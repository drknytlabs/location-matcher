const apiUrl = "https://location-matcher-p6nhl.ondigitalocean.app/.ondigitalocean.app/match-location";

function getCurrentPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
  );
}

async function findMatch(lat, lng) {
  const res = await fetch(`${apiUrl}?lat=${lat}&lng=${lng}`);
  return res.json();
}

(async () => {
  const status = document.getElementById("status");
  const result = document.getElementById("match-result");
  const manual = document.getElementById("manual-search");

  try {
    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    status.textContent = `📍 Location detected. Searching for your property...`;

    const { match } = await findMatch(lat, lng);

    if (match) {
      document.getElementById("match-address").textContent = match.address;
      document.getElementById("match-resident").textContent = match.resident;
      const link = document.getElementById("deed-link");
      link.href = `/pdfs/${match.deed}`;
      result.classList.remove("hidden");
      status.textContent = `✅ Address matched!`;
    } else {
      status.textContent = "❌ Couldn't find your location. Please search manually.";
      manual.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    status.textContent = "⚠️ Location access failed. Try searching manually.";
    manual.classList.remove("hidden");
  }
})();
const input = document.getElementById("address-input");
const list = document.getElementById("autocomplete-list");

input?.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!query) {
    list.innerHTML = '';
    return;
  }

  const res = await fetch(`/search-addresses?query=${encodeURIComponent(query)}`);
  const matches = await res.json();

  list.innerHTML = matches.map(match => `
    <li class="autocomplete-item" data-address="${match.address}">
      ${match.address} — ${match.resident}
    </li>
  `).join('');
});

list?.addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;

  const address = item.dataset.address;
  input.value = address;
  list.innerHTML = '';

  fetch(`/search-addresses?query=${encodeURIComponent(address)}`)
    .then(res => res.json())
    .then(([match]) => {
      if (match) {
        document.getElementById("match-address").textContent = match.address;
        document.getElementById("match-resident").textContent = match.resident;
        const link = document.getElementById("deed-link");
        link.href = `/pdfs/${match.deed}`;
        link.style.display = 'inline-block';
        document.getElementById("match-result").classList.remove("hidden");
      }
    });
});
