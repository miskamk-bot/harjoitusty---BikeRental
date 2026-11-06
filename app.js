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

const API_URL = 'http://vamk.net:34001/api/bikes';
const bikeList = document.getElementById('bike-list');
let bikes = []; // Tallennetaan pyörät tähän myös myöhempää suodatusta varten

async function fetchBikes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Virhe: ${response.status}`);
    }

    bikes = await response.json();
    renderBikes(bikes);
  } catch (error) {
    console.error('Virhe haettaessa pyöriä:', error);
    bikeList.innerHTML = `<p style="color: red;">Pyörien haku epäonnistui: ${error.message}</p>`;
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

    // Kenttien varmistus rajapinnan mahdollisten nimeämisten varalta
    const name = bike.name || bike.model || 'Nimetön pyörä';
    const type = bike.type || 'Peruspyörä';
    const price = bike.pricePerHour || bike.price || 0;
    const imgUrl = bike.imageUrl || 'https://via.placeholder.com/300x200?text=Ei+kuvaa';

    card.innerHTML = `
      <img src="${imgUrl}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x200?text=Ei+kuvaa'">
      <h3>${name}</h3>
      <p><strong>Tyyppi:</strong> ${type}</p>
      <p><strong>Hinta:</strong> ${price} € / h</p>
    `;

    bikeList.appendChild(card);
  });
}

// Haetaan pyörät heti kun sivu ladataan
fetchBikes();