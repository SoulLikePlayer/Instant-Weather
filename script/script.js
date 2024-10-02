const apiKey = '768561d5186a225a22564545f2f4bb3b85138f7039d78233825924501dbdcc78';
const ville = 'Paris';

fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${apiKey}&insee=75056`)
  .then(response => response.json())
  .then(data => {
    const meteoInfo = document.getElementById('meteo-info');
    meteoInfo.innerHTML = `
      <p>Ville: ${ville}</p>
      <p>Prévision: ${data.forecast[0].weather}</p>
      <p>Température maximale: ${data.forecast[0].tmax}°C</p>
      <p>Température minimale: ${data.forecast[0].tmin}°C</p>
    `;
  })
  .catch(error => console.error('Erreur:', error));
