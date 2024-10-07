const nbJoursInput = document.getElementById("nbJours");
const codePostalInput = document.getElementById("codePostal");
const communeSelect = document.getElementById("commune");
const resultDiv = document.getElementById("result");
const parametresDiv = document.getElementById("parametres");
const iconeParametres = document.getElementById("iconeParametres");
const iconeCroix = document.getElementById("iconeCroix");
const headerSection = document.getElementById("headerSection");
const mainSection = document.getElementById("mainSection");
const footerSection = document.getElementById("footerSection");
const backgroundDiv = document.getElementById("background");

const apiGeoUrl = "https://geo.api.gouv.fr/communes?codePostal=";
const apiWeatherUrl = "https://api.meteo-concept.com/api/forecast/daily?token=768561d5186a225a22564545f2f4bb3b85138f7039d78233825924501dbdcc78&insee=";

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

const updateCommuneOptions = async () => {
    const codePostal = codePostalInput.value.trim();
    if (codePostal.length === 5 && /^\d+$/.test(codePostal)) {
        const communes = await getCommunes(codePostal);
        communeSelect.innerHTML = "";

        if (communes.length > 0) {
            communes.forEach(({ code, nom }) => {
                communeSelect.add(new Option(`${nom} (${code})`, code));
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

const getWeatherIconAndDescription = (weather) => {
    let weatherImage = "./ressources/Meteo/Couleur/Soleil.png";
    let meteoDescription = 'Ciel dégagé et ensoleillé';
    let backgroundGradient = 'linear-gradient(210deg, #fbc01f, #ffe291, #ffffff)'; // Par défaut pour le soleil

    if (weather.probarain > 90 && weather.tmin < 0) {
        weatherImage = "./ressources/Meteo/Couleur/NeigeNuage.png";
        meteoDescription = 'Neige prévue, temps froid et neigeux';
        backgroundGradient = 'linear-gradient(210deg, #98deea, #d6e4e8, #ffffff)';
    } else if (weather.probarain > 70) {
        weatherImage = "./ressources/Meteo/Couleur/Pluie.png";
        meteoDescription = 'Pluie abondante attendue, pensez à prendre un parapluie';
        backgroundGradient = 'linear-gradient(210deg, #979797, #5f99cc, #ffffff)';
    } else if (weather.probarain > 30) {
        weatherImage = "./ressources/Meteo/Couleur/Nuage.png";
        meteoDescription = 'Ciel couvert avec des chances de pluie';
        backgroundGradient = 'linear-gradient(210deg, #1ea6c6, #c6c6c6, #ffffff)';
    } else if (weather.probarain > 0) {
        weatherImage = "./ressources/Meteo/Couleur/SoleilPluie.png";
        meteoDescription = 'Soleil avec quelques averses possibles';
        backgroundGradient = 'linear-gradient(210deg, #fedb41, #c6c6c6, #a4d6ff, #ffffff)';
    } else if (weather.sun_hours > 6) {
        weatherImage = "./ressources/Meteo/Couleur/SoleilNuage.png";
        meteoDescription = 'Soleil avec des nuages épars, temps agréable';
        backgroundGradient = 'linear-gradient(210deg, #fedb41, #30b6e7, #ffffff)';
    } else if (weather.wind10m > 50) {
        weatherImage = "./ressources/Meteo/Couleur/VentNuage.png";
        meteoDescription = 'Conditions venteuses, attention aux rafales';
        backgroundGradient = 'linear-gradient(210deg, #becace, #77dcee, #ffffff)';
    } else if (weather.probarain > 50 && weather.wind10m > 30) {
        weatherImage = "./ressources/Meteo/Couleur/Orage.png";
        meteoDescription = 'Orage possible avec des rafales de vent';
        backgroundGradient = 'linear-gradient(210deg, #ffd33f, #a6adb9, #ffffff)';
    }

    return { weatherImage, meteoDescription, backgroundGradient };
};


const displayWeather = (weatherData) => {
    resultDiv.innerHTML = ""; 
    
    if (!weatherData || !weatherData.forecast) {
        resultDiv.innerHTML = "<p>Aucune donnée météo disponible.</p>";
        return;
    }

    const nbJours = Math.min(Math.max(parseInt(nbJoursInput.value, 10), 1), 7);
    
    const weatherHTML = [];

    weatherData.forecast.slice(0, nbJours).forEach((weather) => {
        const date = new Date(weather.datetime);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const { weatherImage, meteoDescription, backgroundGradient } = getWeatherIconAndDescription(weather);

        weatherHTML.push(`
            <div class="weather-day" style="background-image: ${backgroundGradient};">
                <div class="weather-main">
                    <img src="${weatherImage}" alt="Météo" class="weather-icon">
                    <div>
                        <span>${weatherData.city.name} - ${formattedDate} :</span>
                        <h1 class="weather-textIcon">${meteoDescription}</h1>
                        <p>Température minimale : ${weather.tmin}°C</p>
                        <p>Température maximale : ${weather.tmax}°C</p>
                    </div>
                </div>

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

    resultDiv.innerHTML = weatherHTML.join('');
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
    nbJoursInput.value = nbJours < 1 || nbJours > 7 ? "1" : nbJours.toString();
    if (communeSelect.value) handleCommuneChange(communeSelect.value);
};

const toggleParametres = () => {
    parametresDiv.classList.toggle("visible");
    backgroundDiv.classList.toggle("invisible");
    document.body.classList.toggle("noScrollbar");
};

const hideSettings = event => {
    // if ([headerSection, mainSection, footerSection].some(section => section.contains(event?.target)) && parametresDiv.classList.contains("visible")) {
    if (event?.target?.id === "background" && parametresDiv.classList.contains("visible")) {
        toggleParametres();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    communeSelect.style.display = 'none';
    nbJoursInput.addEventListener("input", handlenbJoursChange);
    codePostalInput.addEventListener("input", updateCommuneOptions);
    communeSelect.addEventListener("change", () => handleCommuneChange(communeSelect.value));
    iconeParametres.addEventListener("click", toggleParametres);
    iconeCroix.addEventListener("click", toggleParametres);
    
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', () => handleCommuneChange(communeSelect.value)));

    document.addEventListener("click", hideSettings);
});

