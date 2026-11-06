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