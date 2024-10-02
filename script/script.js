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
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des communes :", error);
        return [];
    }
};

const updateCommuneOptions = async () => {
    const codePostal = codePostalInput.value;
    if (codePostal.length === 5 && /^\d+$/.test(codePostal)) {
        const communes = await getCommunes(codePostal);
        communeSelect.innerHTML = "";

        if (communes.length > 0) {
            communes.forEach(({ code, nom }) => {
                const option = new Option(nom, code);
                communeSelect.add(option);
            });
            communeSelect.style.display = 'block';
            await handleCommuneChange(communes[0].code);
        } else {
            communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
            communeSelect.style.display = 'block';
            resultDiv.innerHTML = "";
        }
    } else {
        communeSelect.innerHTML = "";
        communeSelect.style.display = 'none';
        resultDiv.innerHTML = "";
    }
};

const getWeather = async (inseeCode) => {
    try {
        const response = await fetch(apiWeatherUrl + inseeCode);
        const weatherData = await response.json();
        return weatherData.forecast;
    } catch (error) {
        console.error("Erreur lors de la récupération des données météo :", error);
        return null;
    }
};

const displayWeather = (weatherData) => {
    if (weatherData && weatherData.length > 0) {
        resultDiv.innerHTML = `<h3>Prévisions météorologiques</h3>`;
        weatherData.slice(0, nbJoursInput.value).forEach((weather, index) => {
            resultDiv.innerHTML += `
                <div class="weather-day">
                    <span>Jour ${index + 1} :</span>
                    <p>Température minimale : ${weather.tmin}°C</p>
                    <p>Température maximale : ${weather.tmax}°C</p>
                    <p>Probabilité de pluie : ${weather.probarain}%</p>
                    <p>Heures d'ensoleillement : ${weather.sun_hours}h</p>
                    ${document.getElementById('latCheckbox').checked ? `<p>Latitude : ${weather.latitude}</p>` : ''}
                    ${document.getElementById('lonCheckbox').checked ? `<p>Longitude : ${weather.longitude}</p>` : ''}
                    ${document.getElementById('pluieCheckbox').checked ? `<p>Cumul de pluie : ${weather.rr10} mm</p>` : ''}
                    ${document.getElementById('ventCheckbox').checked ? `<p>Vent moyen : ${weather.wind10m} km/h</p>` : ''}
                    ${document.getElementById('directionCheckbox').checked ? `<p>Direction du vent : ${weather.dirwind10m}°</p>` : ''}
                </div>
            `;
        });
    } else {
        resultDiv.innerHTML = "<p>Aucune donnée météo disponible.</p>";
    }
};

const handleCommuneChange = async (selectedCommuneCode) => {
    if (selectedCommuneCode) {
        const weatherData = await getWeather(selectedCommuneCode);
        displayWeather(weatherData);
    } else {
        resultDiv.innerHTML = "<p>Veuillez sélectionner une commune.</p>";
    }
};

const handlenbJoursChange = () => {
    const nbJours = parseInt(nbJoursInput.value, 10);
    if (nbJours < 1 || nbJours > 7) {
        nbJoursInput.value = "1";
    }
};

const toggleParametres = () => {
    parametresDiv.classList.toggle("visible");
};

window.addEventListener('DOMContentLoaded', () => {
    communeSelect.style.display = 'none';
});

nbJoursInput.addEventListener("input", handlenbJoursChange);
codePostalInput.addEventListener("input", updateCommuneOptions);
communeSelect.addEventListener("change", () => handleCommuneChange(communeSelect.value));
iconeParametres.addEventListener("click", toggleParametres);
iconeCroix.addEventListener("click", toggleParametres);
