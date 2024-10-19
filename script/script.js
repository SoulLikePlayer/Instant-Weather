// Récupère les éléments du DOM pour l'interaction avec la page
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
const labelCommune = document.getElementById("labelCommune");

const apiGeoUrl = "https://geo.api.gouv.fr/communes?codePostal=";
const apiWeatherUrl = "https://api.meteo-concept.com/api/forecast/daily?token=768561d5186a225a22564545f2f4bb3b85138f7039d78233825924501dbdcc78&insee=";

let previousCodePostal = codePostalInput.value;

let codePostalCache = {},
    weatherCache = {};

// Affiche un message d'erreur basé sur la réponse ou l'erreur passée en paramètre
const showError = (responseOrError) => {
    let errorMessage = "Une erreur est survenue";

    if (responseOrError?.status && responseOrError?.statusText) {
        errorMessage += `\n${responseOrError.status} ${responseOrError.statusText}`;
    } else if (responseOrError?.status) {
        errorMessage += `\nCode d'erreur : ${responseOrError.status}`;
    } else if (responseOrError.message) {
        errorMessage += `\nErreur : ${responseOrError.message}`;
    }

    alert(errorMessage);
};

// Récupère les communes liées au code postal donné via une API
const getCommunes = async (codePostal) => {
    const response = await fetch(`${apiGeoUrl}${codePostal}`).catch(showError);

    if (!response?.ok) {
        if (response) showError(response);
        return [];
    }

    return await response.json();
};

// Récupère les prévisions météorologiques basées sur le code INSEE de la commune via une API
const getWeather = async (inseeCode) => {
    const response = await fetch(`${apiWeatherUrl}${inseeCode}`).catch(showError);

    if (!response?.ok) {
        if (response) showError(response);
        return null;
    }

    return await response.json();
};

// Met à jour les options de sélection de commune en fonction du code postal entré
const updateCommuneOptions = async () => {
    // Vérifie que le code postal est valide et n'est pas trop long
    if (codePostalInput.value && (!/^\d+$/.test(codePostalInput.value) || codePostalInput.value?.length > 5)) codePostalInput.value = previousCodePostal;

    if (codePostalInput.value?.length === 5 && /^\d+$/.test(codePostalInput.value)) {
        let communes;

        // Si le code postal est en cache, on l'utilise, sinon on appelle l'API
        if (codePostalCache.codePostal === codePostalInput.value) {
            communes = codePostalCache.data;
        } else {
            communes = await getCommunes(codePostalInput.value);
            codePostalCache.codePostal = codePostalInput.value;
            codePostalCache.data = communes.map(({ code, nom }) => {
                return { code, nom }
            });
        }

        // Met à jour le champ de sélection des communes
        communeSelect.innerHTML = "";
        communeSelect.disabled = communes.length === 1;
        
        if (communes.length > 0) {
            if (communes.length > 1) communeSelect.add(new Option("Sélectionnez une commune", "00000"));

            communes.forEach(({ code, nom }) => {
                communeSelect.add(new Option(`${nom}`, code));
            });

            communeSelect.style.display = 'block';
            labelCommune.style.display = 'block';

            // Si une seule commune est trouvée, affiche immédiatement la météo
            if (communes.length === 1) await handleCommuneChange(communes[0].code);
        } else {
            communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
            communeSelect.style.display = 'block';
            labelCommune.style.display = 'block';
            resultDiv.innerHTML = "";
        }
    } else {
        communeSelect.style.display = 'none';
        labelCommune.style.display = 'none';
        resultDiv.innerHTML = "";
    }

    previousCodePostal = codePostalInput.value;
};

// Génère une icône de météo et une description en fonction des conditions météo fournies
const getWeatherIconAndDescription = (weather) => {
    let weatherImage = "./ressources/Meteo/Couleur/Soleil.png";
    let meteoDescription = 'Ciel dégagé et ensoleillé';
    let backgroundGradient = 'linear-gradient(210deg, #fbc01fce, #ffe291ce, #ffffff)'; // Par défaut pour le soleil

    if (weather.probarain > 90 && weather.tmin < 0) {
        weatherImage = "./ressources/Meteo/Couleur/NeigeNuage.png";
        meteoDescription = 'Neige prévue, temps froid et neigeux';
        backgroundGradient = 'linear-gradient(210deg, #98deeace, #d6e4e8ce, #ffffff)'; /*Neige*/ 
    } else if (weather.probarain > 70) {
        weatherImage = "./ressources/Meteo/Couleur/Pluie.png";
        meteoDescription = 'Pluie abondante attendue, pensez à prendre un parapluie';
        backgroundGradient = 'linear-gradient(210deg, #979797ce, #5f99ccce, #ffffff)'; /*Pluie*/
    } else if (weather.probarain > 30) {
        weatherImage = "./ressources/Meteo/Couleur/Nuage.png";
        meteoDescription = 'Ciel couvert avec des chances de pluie';
        backgroundGradient = 'linear-gradient(210deg, #1ea7c6ce, #c6c6c6ce, #ffffff)'; /*Nuage*/ 
    } else if (weather.probarain > 0) {
        weatherImage = "./ressources/Meteo/Couleur/SoleilPluie.png";
        meteoDescription = 'Soleil avec quelques averses possibles';
        backgroundGradient = 'linear-gradient(210deg, #fedb41ce, #c6c6c6ce, #a4d6ffce, #ffffff)'; /*Pluie Nuage Soleil*/
    } else if (weather.sun_hours > 6) {
        weatherImage = "./ressources/Meteo/Couleur/SoleilNuage.png";
        meteoDescription = 'Soleil avec des nuages épars, temps agréable';
        backgroundGradient = 'linear-gradient(210deg, #fedb41ce, #30b6e7ce, #ffffff)'; /*Nuage Soleil*/
    } else if (weather.wind10m > 50) {
        weatherImage = "./ressources/Meteo/Couleur/VentNuage.png";
        meteoDescription = 'Conditions venteuses, attention aux rafales';
        backgroundGradient = 'linear-gradient(210deg, #becacece, #77dceece, #ffffff)'; /*Vent*/
    } else if (weather.probarain > 50 && weather.wind10m > 30) {
        weatherImage = "./ressources/Meteo/Couleur/Orage.png";
        meteoDescription = 'Orage possible avec des rafales de vent';
        backgroundGradient = 'linear-gradient(210deg, #ffd33fce, #a6adb9ce, #ffffff)'; /*Orage*/
    }

    return { weatherImage, meteoDescription, backgroundGradient };
};

// Affiche les prévisions météo pour les jours sélectionnés
const displayWeather = (weatherData) => {
    resultDiv.innerHTML = ""; 
    
    if (!weatherData || !weatherData.forecast) {
        resultDiv.innerHTML = "<p>Aucune donnée météo disponible.</p>";
        return;
    }

    const nbJours = Math.min(Math.max(parseInt(nbJoursInput.value, 10), 1), 7);
    
    const weatherHTML = [];
    let animationDelay;

    weatherData.forecast.slice(0, nbJours).forEach((weather, index) => {
        const date = new Date(weather.datetime);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const { weatherImage, meteoDescription, backgroundGradient } = getWeatherIconAndDescription(weather);
        
        animationDelay = index * 100; // Délai de 100ms par carte

        weatherHTML.push(`
            <div class="weather-day weather-start" style="background-image: ${backgroundGradient}; animation-delay: ${animationDelay}ms;">
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
                    <p><span class="fa-solid fa-droplet"></span> Probabilité de pluie : ${weather.probarain}%</p>
                    <p><span class="fa-solid fa-sun"></span> Heures d'ensoleillement : ${weather.sun_hours}h</p>
                    ${document.getElementById('latCheckbox').checked ? `<p><span class="fa-solid fa-globe"></span> Latitude : ${weather.latitude}</p>` : ''}
                    ${document.getElementById('lonCheckbox').checked ? `<p><span class="fa-solid fa-globe"></span> Longitude : ${weather.longitude}</p>` : ''}
                    ${document.getElementById('pluieCheckbox').checked ? `<p><span class="fa-solid fa-cloud-showers-heavy"></span> Cumul de pluie : ${weather.rr10} mm</p>` : ''}
                    ${document.getElementById('ventCheckbox').checked ? `<p><span class="fa-solid fa-wind"></span> Vent moyen : ${weather.wind10m} km/h</p>` : ''}
                    ${document.getElementById('directionCheckbox').checked ? `<p><span class="fa-solid fa-compass"></span> Direction du vent : ${weather.dirwind10m}°</p>` : ''}
                </div>
            </div>
        `);
    });
    resultDiv.innerHTML = weatherHTML.join('');
    setTimeout(() => {
        document.querySelectorAll('.weather-start').forEach(card => {
            card.classList.remove('weather-start');
        });
    }, animationDelay * nbJours);
};

// Gère le changement de commune et affiche les prévisions météo correspondantes
const handleCommuneChange = async (selectedCommuneCode) => {
    const codePostal = codePostalInput.value;
    if (codePostal?.length === 5 && /^\d+$/.test(codePostal) && selectedCommuneCode && !["Aucune commune trouvée", "00000"].includes(selectedCommuneCode)) {
        let weatherData;

        // Si les données météo sont en cache, les réutilise, sinon fait une requête API
        if (weatherCache.codeInsee === selectedCommuneCode) {
            weatherData = weatherCache;
        } else {
            weatherData = await getWeather(selectedCommuneCode);

            if (!weatherData) return;

            weatherCache = weatherData;
            weatherCache.codeInsee = selectedCommuneCode;
        }

        displayWeather(weatherData);
    } else {
        resultDiv.innerHTML = "<p>Veuillez sélectionner une commune.</p>";
    }
};

// Gère le changement du nombre de jours et met à jour les prévisions météo
const handlenbJoursChange = () => {
    localStorage.nbJours = nbJoursInput.value;
    if (communeSelect.value) handleCommuneChange(communeSelect.value);
};

// Bascule l'affichage des paramètres utilisateur
const toggleParametres = () => {
    parametresDiv.classList.toggle("visible");
    backgroundDiv.classList.toggle("invisible");
    document.body.classList.toggle("noScrollbar");
};

// Ferme les paramètres si l'utilisateur clique en dehors de la fenêtre des paramètres
const hideSettings = event => {
    if (event?.target?.id === "background" && parametresDiv.classList.contains("visible")) {
        toggleParametres();
    }
};

// Initialisation de la page et des événements après le chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    communeSelect.style.display = 'none';
    labelCommune.style.display = 'none';

    codePostalInput.addEventListener("input", updateCommuneOptions);
    communeSelect.addEventListener("change", () => handleCommuneChange(communeSelect.value));
    iconeParametres.addEventListener("click", toggleParametres);
    iconeCroix.addEventListener("click", toggleParametres);
    
    // Réglages stockés dans le localStorage
    if (localStorage.nbJours) nbJoursInput.value = localStorage.nbJours;
    nbJoursInput.addEventListener("input", handlenbJoursChange);

    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (localStorage[checkbox.id] === "false") checkbox.checked = false;

        checkbox.addEventListener('change', () => {
            localStorage[checkbox.id] = checkbox.checked;
            handleCommuneChange(communeSelect.value)
        });
    });

    document.addEventListener("click", hideSettings);
});
