'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

/////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////////
const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
  //   countriesContainer.style.opacity = 1;
};

/////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////////
const renderCountry = function (data, className = '') {
  const flag = data.flags.svg;
  const countryName = data.name.common;
  const region = data.region;
  const population = (data.population / 1000000).toFixed(2);
  const language = Object.values(data.languages)[0];
  const currency = Object.values(data.currencies)[0].name;
  const html = `
      <article class="country ${className}">
        <img class="country__img" src="${flag}" />
        <div class="country__data">
          <h3 class="country__name">${countryName}</h3>
          <h4 class="country__region">${region}</h4>
          <p class="country__row"><span>👫</span>${population} people</p>
          <p class="country__row"><span>🗣️</span>${language}</p>
          <p class="country__row"><span>💰</span>${currency}</p>
        </div>
      </article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  //   countriesContainer.style.opacity = 1;
};

/////////////////////////////////////////////
////////// REST contries APIs //////////////
///////////////////////////////////////////
const getCountryData = function (country) {
  const request = new XMLHttpRequest();
  request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
  request.send();
  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    const languages = Object.values(data.languages);
    const currencies = Object.values(data.currencies);
    const html = `
        <article class="country">
          <img class="country__img" src="${data.flags.svg}" />
          <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              +data.population / 1000000
            ).toFixed(1)}</p>
            <p class="country__row"><span>🗣️</span>${languages[0]}</p>
            <p class="country__row"><span>💰</span>${currencies[0].name}</p>
          </div>
        </article>
        `;
    countriesContainer.insertAdjacentHTML('beforeend', html);
    countriesContainer.style.opacity = 1;
  });
};
// getCountryData('ukraine');
// getCountryData('russia');
// getCountryData('usa');

/////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////////
const getCountryAndNeighbour = function (country) {
  //AJAX call #1 for main country:
  const request1 = new XMLHttpRequest();
  request1.open('GET', `https://restcountries.com/v3.1/name/${country}`);
  request1.send();
  request1.addEventListener('load', function () {
    //NOTE:responseText is actually string in JSON format.Converting js object:
    const [data] = JSON.parse(this.responseText);
    console.log(data);

    //render country:
    renderCountry(data);

    //get neighbours:
    const neighbours = data.borders;
    if (!neighbours) return;

    //AJAX call 2 for neighbours:
    neighbours.forEach(neighbour => {
      let request2 = new XMLHttpRequest();
      request2.open(
        'GET',
        `https://restcountries.com/v3.1/alpha/${neighbour}
      `
      );
      request2.send();
      request2.addEventListener('load', function () {
        const [data2] = JSON.parse(this.responseText);
        console.log(data2);
        renderCountry(data2, 'neighbour');
      });
    });
  });
};
// getCountryAndNeighbour('vietnam');

/////////////////////////////////////////////
///////////// PROMISES  ////////////////////
///////////////////////////////////////////
const getCountryData1 = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      renderCountry(data[0]);
    });
};
// getCountryData1('vietnam');

/////////////////////////////////////////////
////////// CONSUMING PROMISES //////////////
///////////////////////////////////////////
const getCountryAndNeighbour1 = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(res => res.json())
    .then(data => {
      console.log(data[0]);
      renderCountry(data[0], '');
      const neighbour = data[0].borders[0];
      if (!neighbour) return;
      // Country #2
      fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`)
        .then(response => response.json())
        .then(data => renderCountry(data[0], 'neighbour'));
    });
};
// getCountryAndNeighbour1('vietnam');

/////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////////
const getCountryAndNeighbour2 = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(res => res.json())
    .then(data => {
      renderCountry(data[0], '');
      return data[0].borders;
    })
    .then(neighbours => {
      neighbours.forEach(neighbour => {
        fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`)
          .then(res1 => res1.json())
          .then(data => renderCountry(data[0], 'neighbour'));
      });
    });
};
// getCountryAndNeighbour2('vietnam');

/////////////////////////////////////////////
////////// REJECTING PROMISES //////////////
///////////////////////////////////////////
const getCountryAndNeighbour3 = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(res => res.json())
    .then(data => {
      console.log(data[0]);
      renderCountry(data[0], '');
      const neighbour = data[0].borders[0];
      if (!neighbour) return;
      // Country #2
      fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`)
        .then(res1 => res1.json())
        .then(data => renderCountry(data[0], 'neighbour'))
        // Catching error
        .catch(err => {
          console.error(`💥💥 ${err} 💥💥`);
          renderError(
            `Something went wrong 💥💥💥💥, ${err.message}. Try again!`
          );
        })
        .finally(() => {
          countriesContainer.style.opacity = 1;
        });
    });
};

btn.addEventListener('click', function () {
  getCountryAndNeighbour3('germany');
});
