// When a city is entered get the weather details and save the city name in local storage

$('#search-bar').submit(function (e) {
    e.preventDefault();
    // const keycode = (e.keyCode ? e.keyCode : e.which);
    // if (keycode == '13') {
    const cityInput = $('#search-city').val();

    if (!cityInput) {
        alert('Please enter a city name');
        return;
    }

    getWeatherDetails(cityInput);

});

$('#search-btn').on('click', function (e) {
    e.preventDefault();
    const cityInput = $('#search-city').val();

    if (!cityInput) {
        alert('Please enter a city name');
        return;
    }

    getWeatherDetails(cityInput);

});

// Calls the open weather api
// first it gets the latitude and longitude of the city that is input
// then it uses the latitude and longitude to fetch the weather details for that city
async function getWeatherDetails(selectedCity) {
    let geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=24c5d59f8495778a4808807285a58af8`;
    const geoApiResponse = await fetch(geoApiUrl)

    if (geoApiResponse.ok) {
        const data = await geoApiResponse.json()
        if (!data.length) {
            alert('Please enter a valid city');
            return;
        }
        console.log(data[0].country)
        const country = data[0].country;
        const city = data[0].name;
        saveCityToLocalStorage(city);
        $('#selected-city').text(`${city}, ${country}`);
        // $('#selected-city-country').text(`(${data[0].country})`);
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&appid=24c5d59f8495778a4808807285a58af8&units=metric`
        const weatherApiResponse = await fetch(weatherApiUrl)
        if (weatherApiResponse.ok) {
            const weatherApiData = await weatherApiResponse.json()
            updateUIWithWeatherData(weatherApiData)
            $('#weather').removeClass('hide')
        } else {
            alert('An error occurred: ' + weatherApiResponse.statusText);
        }
    } else {
        alert('An error occurred: ' + geoApiResponse.statusText);
    }
}

// Using the data returned from the api call, we update the UI to show the data for today and forecast days
function updateUIWithWeatherData(data) {
    // update today
    let todaysDate = moment().utcOffset(data.timezone_offset / 3600).format('D/M/YY');
    console.log(data)
    $('#todays-date').text(todaysDate)

    $('#temperature-today').text(data.current.temp);
    $('#wind-today').text(data.current.wind_speed);
    $('#humidity-today').text(data.current.humidity);
    $('#UV-today').text(data.current.uvi)

    if (data.current.uvi <= 2) {
        $('#UV-today').addClass('lowUV');
    } else if (data.current.uvi <= 5) {
        $('#UV-today').addClass('moderateUV');
    } else if (data.current.uvi <= 7) {
        $('#UV-today').addClass('highUV');
    } else if (data.current.uvi <= 10) {
        $('#UV-today').addClass('very-highUV');
    } else if (data.current.uvi > 10) {
        $('#UV-today').addClass('extremeUV');
    }

    let iconSourceURL = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
    $('#icon-today').attr('src', iconSourceURL);

    // update forecast
    for (let i = 0; i < 5; i++) {
        let forecastDate = moment().utcOffset(data.timezone_offset / 3600).add(i + 1, 'days').format('D/M/YY');

        $(`#forecast-date${i}`).text(forecastDate);
        $(`#temperature${i}`).text(data.daily[i].temp.day);
        $(`#wind${i}`).text(data.daily[i].humidity);
        $(`#humidity${i}`).text(data.daily[i].wind_speed);

        let iconSourceURL = `https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`;
        $(`#icon-forecast${i}`).attr('src', iconSourceURL);
    }
}

// add last searched city to local storage
function saveCityToLocalStorage(selectedCity) {
    let savedCities = JSON.parse(localStorage.getItem("previousSearchedCities"));

    if (!savedCities) {
        savedCities = [selectedCity];
    } else {//if savedCities.indexof(selectedCity) > -1
        savedCities.push(selectedCity);
    }

    localStorage.setItem("previousSearchedCities", JSON.stringify(savedCities));
    renderHistory(savedCities);
}

// grab the recent searched cities and render them on the ui
function renderHistory(savedCities) {
    $('#previously-searched').html('');
    for (let i = 0; i < savedCities.length; i++) {
        let city = savedCities[i];
        $('#previously-searched').append(`<li class="btn btn-light btn-lg btn-block">${city}</li>`)
    }
}

// listen to the search history list and get the weather details if clicked
$('#previously-searched').on('click', function (e) {
    selectedCity = e.target.innerHTML;
    getWeatherDetails(selectedCity);
})

// clear the local storage and ui of history
$('#clear-button').on('click', function () {
    $('#previously-searched').html('');
    localStorage.clear();
})

// when the page loads we load the search history
window.onload = function () {
    $('#previously-searched').html('')

    let savedCities = JSON.parse(localStorage.getItem("previousSearchedCities"));

    if (savedCities !== null) {
        renderHistory(savedCities)
    }
}