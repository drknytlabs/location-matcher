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
