// Sélection des éléments DOM
const nbJoursInput = document.getElementById("nbJours");
const codePostalInput = document.getElementById("codePostal");
const communeSelect = document.getElementById("commune");
const resultDiv = document.getElementById("result");
const parametresDiv = document.getElementById("parametres");
const iconeParametres = document.getElementById("iconeParametres");
const iconeCroix = document.getElementById("iconeCroix");

// API URL
const apiGeoUrl = "https://geo.api.gouv.fr/communes?codePostal=";
const apiWeatherUrl = "https://api.meteo-concept.com/api/forecast/daily?token=768561d5186a225a22564545f2f4bb3b85138f7039d78233825924501dbdcc78&insee=";

// Gestion des appels aux APIs
const getCommunes = async (codePostal) => {
    try {
        const response = await fetch(`${apiGeoUrl}${codePostal}`);
        if (!response.ok) throw new Error("Erreur réseau lors de la récupération des communes.");
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des communes :", error);
        return [];
    }
};

const getWeather = async (inseeCode) => {
    try {
        const response = await fetch(`${apiWeatherUrl}${inseeCode}`);
        if (!response.ok) throw new Error("Erreur réseau lors de la récupération des données météo.");
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des données météo :", error);
        return null;
    }
};

// Mise à jour des options de communes
const updateCommuneOptions = async () => {
    const codePostal = codePostalInput.value.trim();
    if (codePostal.length === 5 && /^\d+$/.test(codePostal)) {
        const communes = await getCommunes(codePostal);
        communeSelect.innerHTML = "";

        if (communes.length > 0) {
            communes.forEach(({ code, nom }) => {
                communeSelect.add(new Option(nom, code));
            });
            communeSelect.style.display = 'block';
            await handleCommuneChange(communes[0].code);
        } else {
            communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
            communeSelect.style.display = 'block';
            resultDiv.innerHTML = "";
        }
    } else {
        communeSelect.style.display = 'none';
        resultDiv.innerHTML = "";
    }
};

// Fonction utilitaire pour obtenir l'icône et la description de la météo
const getWeatherIconAndDescription = (weather) => {
    let weatherImage = "../ressources/Meteo/Couleur/Soleil.png";
    let meteoDescription = 'Ciel dégagé et ensoleillé';

    // Conditions pour diverses nuances de météo
    if (weather.probarain > 90 && weather.tmin < 0) {
        weatherImage = "../ressources/Meteo/Couleur/Neige.png";
        meteoDescription = 'Neige prévue, temps froid et neigeux';
    } else if (weather.probarain > 70) {
        weatherImage = "../ressources/Meteo/Couleur/Pluie.png";
        meteoDescription = 'Pluie abondante attendue, pensez à prendre un parapluie';
    } else if (weather.probarain > 30) {
        weatherImage = "../ressources/Meteo/Couleur/Nuage.png";
        meteoDescription = 'Ciel couvert avec des chances de pluie';
    } else if (weather.probarain > 0) {
        weatherImage = "../ressources/Meteo/Couleur/SoleilPluie.png"; // Utiliser une image pour soleil avec pluie
        meteoDescription = 'Soleil avec quelques averses possibles';
    } else if (weather.sun_hours > 6) {
        weatherImage = "../ressources/Meteo/Couleur/SoleilNuage.png"; // Utiliser une image pour soleil nuageux
        meteoDescription = 'Soleil avec des nuages épars, temps agréable';
    } else if (weather.wind10m > 50) {
        weatherImage = "../ressources/Meteo/Couleur/Vent.png";
        meteoDescription = 'Conditions venteuses, attention aux rafales';
    } else if (weather.probarain > 50 && weather.wind10m > 30) {
        weatherImage = "../ressources/Meteo/Couleur/Orage.png"; // Ajouter une icône pour les orages
        meteoDescription = 'Orage possible avec des rafales de vent';
    } else {
        weatherImage = "../ressources/Meteo/Couleur/Soleil.png";
        meteoDescription = 'Ciel dégagé et ensoleillé';
    }

    return { weatherImage, meteoDescription };
};
// Affichage des données météo
const displayWeather = (weatherData) => {
    // Vider le contenu précédent
    resultDiv.innerHTML = ""; 
    
    if (!weatherData || !weatherData.forecast) {
        resultDiv.innerHTML = "<p>Aucune donnée météo disponible.</p>";
        return;
    }

    // Limiter le nombre de jours au minimum de 1 et au maximum de 7 jours
    const nbJours = Math.min(Math.max(parseInt(nbJoursInput.value, 10), 1), 7);
    
    // Utiliser un tableau pour stocker le contenu HTML à insérer
    const weatherHTML = [];

    weatherData.forecast.slice(0, nbJours).forEach((weather) => {
        const date = new Date(weather.datetime);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Choisir l'icône et la description en fonction des conditions météo
        const { weatherImage, meteoDescription } = getWeatherIconAndDescription(weather);

        // Stocker chaque jour météo dans une chaîne
        weatherHTML.push(`
            <div class="weather-day">
                <!-- Section principale : Affichage des informations météo -->
                <div class="weather-main">
                    <img src="${weatherImage}" alt="Météo" class="weather-icon">
                    <div>
                        <span>${weatherData.city.name} - ${formattedDate} :</span>
                        <h1>${meteoDescription}</h1>
                        <p>Température minimale : ${weather.tmin}°C</p>
                        <p>Température maximale : ${weather.tmax}°C</p>
                    </div>
                </div>

                <!-- Section supplémentaire : Affichage des détails météo si cochés -->
                <div class="weather-details">
                    <p>Probabilité de pluie : ${weather.probarain}%</p>
                    <p>Heures d'ensoleillement : ${weather.sun_hours}h</p>
                    ${document.getElementById('latCheckbox').checked ? `<p>Latitude : ${weather.latitude}</p>` : ''}
                    ${document.getElementById('lonCheckbox').checked ? `<p>Longitude : ${weather.longitude}</p>` : ''}
                    ${document.getElementById('pluieCheckbox').checked ? `<p>Cumul de pluie : ${weather.rr10} mm</p>` : ''}
                    ${document.getElementById('ventCheckbox').checked ? `<p>Vent moyen : ${weather.wind10m} km/h</p>` : ''}
                    ${document.getElementById('directionCheckbox').checked ? `<p>Direction du vent : ${weather.dirwind10m}°</p>` : ''}
                </div>
            </div>
        `);
    });

    // Injecter tout le contenu HTML d'un seul coup
    resultDiv.innerHTML = weatherHTML.join('');
};



// Gestion du changement de commune
const handleCommuneChange = async (selectedCommuneCode) => {
    if (selectedCommuneCode) {
        const weatherData = await getWeather(selectedCommuneCode);
        displayWeather(weatherData);
    } else {
        resultDiv.innerHTML = "<p>Veuillez sélectionner une commune.</p>";
    }
};

// Gestion de la modification du nombre de jours
const handlenbJoursChange = () => {
    const nbJours = parseInt(nbJoursInput.value, 10);
    nbJoursInput.value = nbJours < 1 || nbJours > 7 ? "1" : nbJours.toString();
};

// Gestion des paramètres d'affichage
const toggleParametres = () => {
    parametresDiv.classList.toggle("visible");
};

// Initialisation lors du chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    communeSelect.style.display = 'none';
    nbJoursInput.addEventListener("input", handlenbJoursChange);
    codePostalInput.addEventListener("input", updateCommuneOptions);
    communeSelect.addEventListener("change", () => handleCommuneChange(communeSelect.value));
    iconeParametres.addEventListener("click", toggleParametres);
    iconeCroix.addEventListener("click", toggleParametres);
});
