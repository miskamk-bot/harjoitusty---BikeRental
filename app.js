// --- ISSUE 1: Sivunäkymien vaihto ---
const btnCatalog = document.getElementById('btn-catalog');
const btnAdmin = document.getElementById('btn-admin');
const catalogView = document.getElementById('catalog-view');
const adminView = document.getElementById('admin-view');

btnCatalog.addEventListener('click', () => {
  catalogView.classList.remove('hidden');
  adminView.classList.add('hidden');
  btnCatalog.classList.add('active');
  btnAdmin.classList.remove('active');
});

btnAdmin.addEventListener('click', () => {
  adminView.classList.remove('hidden');
  catalogView.classList.add('hidden');
  btnAdmin.classList.add('active');
  btnCatalog.classList.remove('active');
});

// --- ADMIN-KIRJAUTUMINEN (Salasana: admin123) ---
// Base64-muodossa: 'admin123' -> 'YWRtaW4xMjM='
const PASS_TOKEN = 'YWRtaW4xMjM=';

const loginForm = document.getElementById('admin-login-form');
const adminPassInput = document.getElementById('admin-pass-input');
const loginBox = document.getElementById('admin-login-box');
const adminPanel = document.getElementById('admin-panel');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Muunnetaan käyttäjän syöte vastaavaan muotoon ja verrataan
  if (btoa(adminPassInput.value) === PASS_TOKEN) {
    loginError.textContent = '';
    adminPassInput.value = '';
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    loginBox.classList.add('hidden');
    adminPanel.classList.remove('hidden');
  } else {
    loginError.textContent = 'Virheellinen salasana!';
  }
});

btnLogout.addEventListener('click', () => {
  sessionStorage.removeItem('isAdminLoggedIn');
  adminPanel.classList.add('hidden');
  loginBox.classList.remove('hidden');
});

if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
  loginBox.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

// --- ISSUE 2: Pyörien haku ja näyttäminen ---
const API_URL = 'http://vamk.net:34001/api/bikes';
const bikeList = document.getElementById('bike-list');
let bikes = [];

// Testidata, jos yhteys VAMK-palvelimeen ei ole aktiivinen
const FALLBACK_BIKES = [
  { id: 1, name: "Helkama Jopo 24", type: "City", pricePerHour: 5, imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500" },
  { id: 2, name: "Trek Marlin 7", type: "Mountain", pricePerHour: 12, imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500" },
  { id: 3, name: "GigaBike E-Pro", type: "Electric", pricePerHour: 18, imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500" },
  { id: 4, name: "Pelago Brooklyn", type: "City", pricePerHour: 8, imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500" }
];

async function fetchBikes() {
  try {
    bikeList.innerHTML = '<p>Ladataan pyöriä palvelimelta...</p>';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Status ${response.status}`);
    bikes = await response.json();
    renderBikes(bikes);
  } catch (error) {
    console.warn('Palvelinyhteys ei vastannut:', error.message);
    bikes = [...FALLBACK_BIKES];
    renderBikes(bikes);

    const info = document.createElement('p');
    info.style.color = '#b45309';
    info.style.backgroundColor = '#fef3c7';
    info.style.padding = '0.5rem';
    info.style.borderRadius = '4px';
    info.style.gridColumn = '1 / -1';
    info.textContent = 'Huom: Palvelin (vamk.net:34001) ei vastannut (vaatii VAMK-verkon/VPN:n). Sivulla näytetään testidataa.';
    bikeList.prepend(info);
  }
}

function renderBikes(bikeArray) {
  bikeList.innerHTML = '';

  if (bikeArray.length === 0) {
    bikeList.innerHTML = '<p>Yhtään pyörää ei löytynyt.</p>';
    return;
  }

  bikeArray.forEach(bike => {
    const card = document.createElement('div');
    card.className = 'bike-card';

    const name = bike.name || bike.model || 'Nimetön pyörä';
    const type = bike.type || 'Peruspyörä';
    const price = bike.pricePerHour || bike.price || 0;
    const imgUrl = bike.imageUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500';

    card.innerHTML = `
      <img src="${imgUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500'">
      <h3>${name}</h3>
      <p><strong>Tyyppi:</strong> ${type}</p>
      <p><strong>Hinta:</strong> ${price} € / h</p>
    `;

    bikeList.appendChild(card);
  });
}

fetchBikes();

// --- ISSUE 3: Suodatustoiminnot ---
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const priceFilter = document.getElementById('price-filter');
const priceVal = document.getElementById('price-val');

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedType = typeFilter.value;
  const maxPrice = parseFloat(priceFilter.value);

  const filtered = bikes.filter(bike => {
    const bikeName = (bike.name || bike.model || '').toLowerCase();
    const bikeType = bike.type || '';
    const bikePrice = parseFloat(bike.pricePerHour || bike.price || 0);

    const matchesName = bikeName.includes(searchTerm);
    const matchesType = (selectedType === 'all') || (bikeType.toLowerCase() === selectedType.toLowerCase());
    const matchesPrice = bikePrice <= maxPrice;

    return matchesName && matchesType && matchesPrice;
  });

  renderBikes(filtered);
}

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
priceFilter.addEventListener('input', (e) => {
  priceVal.textContent = `${e.target.value} €/h`;
  applyFilters();
});

// --- ISSUE 4: Uuden pyörän lisääminen (POST) ---
const addBikeForm = document.getElementById('add-bike-form');
const addStatus = document.getElementById('add-status');
const DEFAULT_BIKE_IMAGE = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500';

addBikeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userImg = document.getElementById('bike-img').value.trim();
  const newBike = {
    id: Date.now(),
    name: document.getElementById('bike-name').value,
    type: document.getElementById('bike-type').value,
    pricePerHour: parseFloat(document.getElementById('bike-price').value),
    imageUrl: userImg !== '' ? userImg : DEFAULT_BIKE_IMAGE
  };

  addStatus.textContent = 'Tallennetaan...';
  addStatus.style.color = '#333';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBike),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Status ${response.status}`);

    addStatus.textContent = 'Pyörä lisätty onnistuneesti APIin!';
    addStatus.style.color = 'green';
    addBikeForm.reset();
    fetchBikes();
  } catch (error) {
    // Jos API ei vastaa kotiverkossa, pyörä lisätään paikalliseen tilaan
    bikes.push(newBike);
    renderBikes(bikes);
    addStatus.textContent = 'Pyörä lisätty näkymään!';
    addStatus.style.color = 'green';
    addBikeForm.reset();
  }
});