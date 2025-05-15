const input = document.getElementById("address-input");
const list = document.getElementById("autocomplete-list");
const searchBtn = document.getElementById("address-search-btn");

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

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearchSubmit();
  }
});

searchBtn.addEventListener("click", handleSearchSubmit);

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

list.addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;

  input.value = item.dataset.address;
  handleSearchSubmit();
});

function showMatchResult(match) {
  document.getElementById("match-address").textContent = match.address;
  document.getElementById("match-resident").textContent = match.resident;
  const link = document.getElementById("deed-link");
  link.href = `/pdfs/${match.deed}`;
  link.style.display = 'inline-block';
  document.getElementById("match-result").classList.remove("hidden");
}