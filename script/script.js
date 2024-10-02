document.getElementById('zipcodeForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const zipcode = document.getElementById('zipcode').value;
    const citiesList = document.getElementById('citiesList');
    
    citiesList.innerHTML = '';

    if (!/^\d{5}$/.test(zipcode)) {
        alert('Veuillez entrer un code postal valide (5 chiffres).');
        return;
    }

    fetch(`https://geo.api.gouv.fr/communes?codePostal=${zipcode}&fields=nom,code&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                citiesList.innerHTML = '<li>Aucune ville trouvée pour ce code postal.</li>';
            } else {
                data.forEach(city => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${city.nom} (Code INSEE: ${city.code})`;
                    citiesList.appendChild(listItem);
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
            citiesList.innerHTML = '<li>Une erreur est survenue lors de la recherche des villes.</li>';
        });
});
