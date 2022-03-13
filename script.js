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
  // Country 1
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(res => {
      console.log(res);
      // Create an error message
      if (!res.ok) throw new Error(`Country not found (${res.status})`);
      return res.json();
    })
    .then(data => {
      console.log(data[0]);
      renderCountry(data[0], '');
      const neighbour = data[0].borders[0];
      if (!neighbour) return;
      // Return a new api for Country #2
      return fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`);
    })
    .then(res1 => res1.json())
    .then(data => renderCountry(data[0], 'neighbour'))
    // Catching an error
    .catch(err => {
      console.error(`💥💥 ${err} 💥💥`);
      renderError(
        `Something went wrong 💥💥💥💥, ${err.message}. Please try again!`
      );
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

btn.addEventListener('click', function () {
  // getCountryAndNeighbour3('adas');
});

/////////////////////////////////////////////
////////////////////////////////////////////
///////////////////////////////////////////
const getJSON = function (url, errorMessage = 'Something went wrong') {
  return fetch(url).then(res => {
    console.log(res);
    // Create an error message
    if (!res.ok) throw new Error(`${errorMessage} (${res.status})`);
    return res.json();
  });
};
const getCountryAndNeighbour4 = function (country) {
  // Country 1
  getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders[0];
      console.log(neighbour);
      if (!neighbour) throw new Error('No neighbour found!');
      // Return a new api for Country #2
      return getJSON(`https://restcountries.com/v3.1/alpha/${neighbour}`);
    })
    .then(data => renderCountry(data[0], 'neighbour'))
    // Catching an error
    .catch(err => {
      console.error(`💥💥 ${err} 💥💥`);
      renderError(
        `Something went wrong, 💥${err.message}💥. Please try again!`
      );
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};
btn.addEventListener('click', function () {
  // getCountryAndNeighbour4('vietnam');
});

/////////////////////////////////////////////
//////// CODING CHALLENGE 1 ////////////////
///////////////////////////////////////////
const whereAmI = function (lat, lng) {
  fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
    .then(res => {
      if (!res.ok) throw new Error(`Problem with API (${res.status})`);
      return res.json();
    })
    .then(data => {
      console.log(`⚡️ You are in ${data.city}, city of ${data.country} ⚡️`);
      return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
    })
    .then(res1 => {
      if (!res1.ok) throw new Error(`Country not found (${res1.status})`);
      return res1.json();
    })
    .then(data => {
      renderCountry(data[0]);
    })
    .catch(err => console.error(`🔥 ${err.message} 🔥`))
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};
// Test Data
// whereAmI(52.508, 13.381);
// whereAmI(19.037, 72.873);
// whereAmI(-33.933, 18.474);

/////////////////////////////////////////////
//////////// EVENT LOOP ////////////////////
///////////////////////////////////////////
console.log('Test start');
setTimeout(() => {
  console.log('0 second timer');
}, 0);
Promise.resolve('Resolved Problem #1').then(res => console.log(res));
Promise.resolve('Resolved Problem #2').then(res => {
  for (let i = 0; i < 99999; i++) {}
  console.log(res);
});
console.log('Test end');

/////////////////////////////////////////////
/////////// SIMPLE PROMISE /////////////////
///////////////////////////////////////////
const lottery = new Promise(function (resolve, reject) {
  console.warn('🔮 Lottery draw is in progress 🔮');
  setTimeout(function () {
    if (Math.random() >= 0.5) {
      resolve('YOU WIN');
    } else {
      reject(new Error('YOU LOST YOUR MONEY'));
    }
  }, 3000);
});
lottery.then(res => console.log(res)).catch(err => console.error(err));
