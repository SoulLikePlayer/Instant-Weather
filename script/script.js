const nbJoursInput = document.getElementById("nbJours");
const codePostalInput = document.getElementById("codePostal");
const communeSelect = document.getElementById("commune");
const resultDiv = document.getElementById("result");
const parametresDiv = document.getElementById("parametres");
const iconeParametres = document.getElementById("iconeParametres");
const iconeCroix = document.getElementById("iconeCroix");

const apiGeoUrl = "https://geo.api.gouv.fr/communes?codePostal=";
const apiWeatherUrl = "https://api.meteo-concept.com/api/forecast/daily?token=768561d5186a225a22564545f2f4bb3b85138f7039d78233825924501dbdcc78&insee=";

const getCommunes = async (codePostal) => {
    try {
        const response = await fetch(apiGeoUrl + codePostal);
        const communes = await response.json();
        return communes;
    } catch (error) {
        console.error("Erreur lors de la récupération des communes :", error);
    }
};

const updateCommuneOptions = async () => {
    const codePostal = codePostalInput.value;
    if (codePostal.length === 5 && /^\d+$/.test(codePostal)) {
        const communes = await getCommunes(codePostal);
        communeSelect.innerHTML = "";
        if (communes.length > 0) {
            communes.forEach(commune => {
                const option = document.createElement("option");
                option.value = commune.code;
                option.textContent = commune.nom;
                communeSelect.appendChild(option);
            });
            communeSelect.style.display = 'block'; // Affiche le sélecteur de communes
        } else {
            communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
            communeSelect.style.display = 'block'; // Affiche le sélecteur même s'il n'y a pas de commune
        }
    } else {
        communeSelect.innerHTML = "";
        communeSelect.style.display = 'none'; // Masque le sélecteur de communes
    }
};

const getWeather = async (inseeCode) => {
    try {
        const response = await fetch(apiWeatherUrl + inseeCode);
        const weatherData = await response.json();
        return weatherData.forecast[0];
    } catch (error) {
        console.error("Erreur lors de la récupération des données météo :", error);
    }
};

const displayWeather = (weather) => {
    if (weather) {
        resultDiv.innerHTML = `
            <h3>Prévisions météorologiques</h3>
            <p>Température minimale : ${weather.tmin}°C</p>
            <p>Température maximale : ${weather.tmax}°C</p>
            <p>Probabilité de pluie : ${weather.probarain}%</p>
            <p>Heures d'ensoleillement : ${weather.sun_hours}h</p>
        `;
    } else {
        resultDiv.innerHTML = "<p>Aucune donnée météo disponible.</p>";
    }
};

const handleCommuneChange = async () => {
    const selectedCommuneCode = communeSelect.value;
    if (selectedCommuneCode) {
        const weather = await getWeather(selectedCommuneCode);
        displayWeather(weather);
    } else {
        resultDiv.innerHTML = "<p>Veuillez sélectionner une commune.</p>";
    }
};

const handlenbJoursChange = () => {
    const nbJours = nbJoursInput.value;
    
    if (/^[1-7]{1}$/.test(nbJours)) {
        console.log("gg");
    } else {
        nbJoursInput.value = "1";
    }
};

const ouvrirParametres = () => {
    parametresDiv.classList.toggle("visible");
    // parametresDiv.style.width = "100px";
    
    // iconeParametres.style.opacity = "0";
};

const fermerParametres = () => {
    parametresDiv.classList.toggle("invisible");
    // parametresDiv.style.width = "0";
    // iconeParametres.style.opacity = "1";
};

window.addEventListener('DOMContentLoaded', () => {
    communeSelect.style.display = 'none'; // Masque le sélecteur au démarrage
});

nbJoursInput.addEventListener("input", handlenbJoursChange);
codePostalInput.addEventListener("input", updateCommuneOptions);
communeSelect.addEventListener("change", handleCommuneChange);

iconeParametres.addEventListener("click", ouvrirParametres);
iconeCroix.addEventListener("click", fermerParametres);