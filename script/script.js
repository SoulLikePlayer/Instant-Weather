const codePostalInput = document.getElementById("codePostal");
const communeSelect = document.getElementById("commune");
const validerButton = document.getElementById("valider");
const resultDiv = document.getElementById("result");

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
    
    if (codePostal.length === 5) {
        const communes = await getCommunes(codePostal);
        communeSelect.innerHTML = "";

        if (communes.length > 0) {
            communes.forEach(commune => {
                const option = document.createElement("option");
                option.value = commune.code;
                option.textContent = commune.nom;
                communeSelect.appendChild(option);
            });
        } else {
            communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
        }
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

codePostalInput.addEventListener("input", updateCommuneOptions);

validerButton.addEventListener("click", async () => {
    const selectedCommuneCode = communeSelect.value;
    
    if (selectedCommuneCode) {
        const weather = await getWeather(selectedCommuneCode);
        displayWeather(weather);
    } else {
        resultDiv.innerHTML = "<p>Veuillez sélectionner une commune.</p>";
    }
});
