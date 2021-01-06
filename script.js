const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const api_london = 'https://api.openweathermap.org/data/2.5/onecall?lat=51.51&lon=-0.13&exclude=current&units=metric&appid=f219ea0e98cad245abe42be2a31cca92';
const api_london_daily = 'https://api.openweathermap.org/data/2.5/onecall?lat=51.51&lon=-0.13&exclude=minutely,current&units=metric&appid=f219ea0e98cad245abe42be2a31cca92';

function getUTCTime(value) {
    let time = new Date(value * 1000),
        hours = time.getUTCHours(),
        minutes = time.getUTCMinutes();
    
    let formatted = hours.toString().padStart(2, '0')
     + ':' + minutes.toString().padStart(2, '0')

    return formatted;
}

function showMyPosition(position) {
    let lat = position.coords.latitude.toFixed(2);
    let lon = position.coords.longitude.toFixed(2);
    let my_api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current&units=metric&appid=f219ea0e98cad245abe42be2a31cca92`;
    getData(my_api);
    getDailyData(my_api);
}

function showOtherPosition() {
    getData(api_london); 
    getDailyData(api_london_daily)
}
navigator.geolocation.getCurrentPosition(showMyPosition, showOtherPosition);

async function getData(api_url) {
    const response = await fetch(api_url);
    const data = await response.json();
    let icon = data.daily[0].weather[0].icon;

    let today = new Date();
    let time = today.getHours() + ':' + today.getMinutes().toString().padStart(2, '0');
    let date = monthNames[today.getMonth()] + ' ' + today.getDate();


    showDayForecast();

    function showDayForecast() {
        let dayForecast = document.getElementById('day-forecast');
        dayForecast.innerHTML += `
        <div class="info-weather">
            <h3 id="city-name">Weather in ${data.timezone.split('/')[1]}</h3>
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="" id="weather-img">
            <p id="temp">${Math.floor(data.daily[0].temp.day)} &#x2103;</p>  
            <p id="weather">${data.daily[0].weather[0].main}</p>
            <span id="time">${time}</span>
            <span id="date">${date}</span>
            <span class="help" >Wrong data?</span>    
        </div>
        <table class="day-weather">
            <tr>
                <td>Wind</td><td id="wind">${data.daily[0].weather[0].description}, ${data.daily[0].wind_speed} m/s</td>
            </tr>
            <tr>
                <td>Cloudiness</td><td id="cloudiness">${data.daily[0].clouds} %</td>
            </tr>
            <tr>
                <td>Pressure</td><td id='pressure'>${data.daily[0].pressure} hPa</td>
            </tr>
            <tr>
                <td>Humidity</td><td id="humidity">${data.daily[0].humidity} %</td>
            </tr>
            <tr>
                <td>Sunrise</td><td id="sunrise">${getUTCTime(data.daily[0].sunrise)}</td>
            </tr>
            <tr>
                <td>Sunset</td><td id="sunset">${getUTCTime(data.daily[0].sunset)}</td>
            </tr>
            <tr>
                <td>Geo coords</td><td id="geo-coords">[${data.lat}, ${data.lon}]</td>
            </tr>
        </table>`;
    }
}

async function getDailyData(api_london_daily) {
    const response = await fetch(api_london_daily);
    const data = await response.json();
   
    let today = new Date();
    document.getElementById('week-forecast__title').innerText = 
`    Hourly weather and forecast in ${data.timezone.split('/')[1]}`;

    let weekTable = document.getElementById('week-weather');
    weekTable.innerHTML =`
    <tr class="week-weather__date" >
        <td>${days[today.getDay()]} ${monthNames[today.getMonth()]} ${today.getDate()} ${today.getFullYear()}</td>
        <td></td>
    </tr>` ;

    let isNextDay = false;
    let previousHour;
    let currentHour;
    let hoursToSkip = 3;

    for(let i = 0; i < data.hourly.length; i+=hoursToSkip) {
        
        setCurrentHourForIndex(i); 
        setPreviousHourForIndex(i);
        
        checkIfNextDay(); 
        if(isNextDay) {
            showWeatherForNextDay();
        }else{
            showWeatherForCurrentHour();
        }
        
    }
    function setCurrentHourForIndex(i) {
        currentHour = data.hourly[i];
    }
    function setPreviousHourForIndex(i) {
        if (i == 0) {
            previousHour = data.hourly[i];
        } else {
            previousHour = data.hourly[i - hoursToSkip];
        }
    }

    function checkIfNextDay() {
        isNextDay = getUTCTime(currentHour.dt)[0] < getUTCTime(previousHour.dt)[0] ?  true :  false;
    }

    function showWeatherForNextDay() {
        today.setDate(today.getDate() + 1);
    
        weekTable.innerHTML += `<tr class="week-weather__date" >
        <td>${days[today.getDay()]} ${monthNames[today.getMonth()]} ${today.getDate()} ${today.getFullYear()}</td>
        <td></td>
        </tr>
        <tr>
            <td>
                <p id="week_time">${getUTCTime(currentHour.dt)}</p>
                <img src="http://openweathermap.org/img/wn/${currentHour.weather[0].icon}.png" alt="">
            </td>
            <td>
                <span id="week_temp">${Math.floor(currentHour.temp)}   &#x2103; </span><i id="desc">${currentHour.weather[0].main}</i>
                <p>${currentHour.wind_speed} m/s, clouds ${currentHour.clouds} %, ${currentHour.pressure} hPa</p>
            </td>
        </tr> `;
    }

    function showWeatherForCurrentHour() {
        weekTable.innerHTML += `
        <tr>
            <td>
                <p id="week_time">${getUTCTime(currentHour.dt)}</p>
                <img src="http://openweathermap.org/img/wn/${currentHour.weather[0].icon}.png" alt="">
            </td>
            <td>
                <span id="week_temp">${Math.floor(currentHour.temp)}   &#x2103; </span><i id="desc">${currentHour.weather[0].main}</i>
                <p>${currentHour.wind_speed} m/s, clouds ${currentHour.clouds} %, ${currentHour.pressure} hPa</p>
            </td>
        </tr>`;
    }
}