// ^ HTML Elements
const forecastContainer = document.querySelector(".forecast-cards");
const locationElement = document.querySelector(".location");
const searchBox = document.getElementById("searchBox");
const cityContainer = document.querySelector(".city-items");
const city = document.getElementById("city");


// ^ App Variables
let currentLocation = "cairo";
const recentCities = JSON.parse(localStorage.getItem("cities")) || []


// ^ Functions
async function getWeather(location) {
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=fe0919367ee04d42aa9181628233012&q=${location}&days=7`);
  const data = await response.json();
  displayWeather(data)
  searchBox.value = ""
}

function success(position) {
  currentLocation = `${position.coords.latitude},${position.coords.longitude}`
  getWeather(currentLocation)
}

function displayWeather(data) {
  const days = data.forecast.forecastday;
  console.log(days)
  locationElement.innerHTML = `<span class="city-name pt-2">${data.location.name}</span>,${data.location.country}`
  let cardsHTML = "";
  for (let [index, day] of days.entries()) {

    const date = new Date(day.date)
    const weekday = date.toLocaleDateString("en-us", { weekday: "long" })

      let date_now = new Date();
      let hr = date_now.getHours();
      let min = date_now.getMinutes();
      let sec = date_now.getSeconds();
      let middayValue = "AM";
      middayValue = hr >= 12 ? "PM" : "AM";
      if (hr == 0) {
          hr = 12;
      } else if (hr > 12) {
          hr -= 12;
      }
      hr = hr < 10 ? "0" + hr : hr;
      min = min < 10 ? "0" + min : min;
      time = `${hr}:${min} ${middayValue}`;
      let icon;
      hr < 5 ? icon=`<i class="fa-solid fa-cloud-sun"></i>`:icon=`<i class="fa-solid fa-cloud-moon"></i>`

    cardsHTML += `<div class="up">
    <div class="${index == 0 ? "card active" : "card"}" data-index=${index} >
    <div class="card-header">
      <div class="day">${weekday}</div>
      <div class="time">${hr + ":" + min} <span class="ms-1">${middayValue}</span></div>
    </div>
    <div class="card-body">
      <div class="degree">${day.hour[date.getHours()].temp_c}°C</div>
      <div class="icon">${icon}</div>
    </div>
    <div class="card-data">
      <ul class="left-column">
        <li>Real Feel: <span class="real-feel">${day.hour[date.getHours()].feelslike_c}°C</span></li>
        <li>Wind: <span class="wind">${day.hour[date.getHours()].wind_kph} K/h</span></li>
        <li>Pressure: <span class="pressure">${day.hour[date.getHours()].pressure_mb}Mb</span></li>
        <li>Humidity: <span class="humidity">${day.hour[date.getHours()].humidity}%</span></li>
      </ul>
      <ul class="right-column">
        <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
        <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
      </ul>
    </div>
  </div>
  </div>`
  }
  forecastContainer.innerHTML = cardsHTML;
  displaytemp(days[0]);

  const allCards = document.querySelectorAll(".card");

  for (let card of allCards) {
    card.addEventListener("click", function (e) {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active")
      e.currentTarget.classList.add("active")
      displaytemp(days[e.currentTarget.dataset.index])
    })
  }

  let exist = recentCities.find((currentCity) => currentCity.city == data.location.name)
  if (exist) return
  recentCities.push({ city: data.location.name, country: data.location.country });
  localStorage.setItem("cities", JSON.stringify(recentCities))
  displayRecentCity(data.location.name, data.location.country)
}

function displaytemp(weather) {
  let cartoona =``;
  for(var i=1; i<25;i=i+3){
    cartoona +=`<div class="row" id="timery">
    <div class="col-sm-4">
      <p><i class="fa-regular fa-clock me-2"></i>${i<13?`${i}Am`:`${i-12}pm`}</p>
    </div>
    <div class="col-sm-8">
      <div class="row">
        <div class="col-sm-5">
          <div class="temp"><i class="fa-solid fa-temperature-empty me-1"></i>${weather.hour[i].heatindex_c}°C</div>
        </div>
        <div class="col-sm-7">
          <div class="text text-center"><i class="fa-solid fa-cloud me-1"></i>${weather.hour[i].condition.text}</div>
        </div>
      </div>
    </div>
  </div>`
  }
  document.getElementById("temp-day-hours").innerHTML = cartoona;
}

async function getCityImage(city) {
  const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
  const data = await response.json();
  const random = Math.trunc(Math.random() * data.results.length)
  return data.results[random]
}

async function displayRecentCity(city, country) {
  let cityInfo = await getCityImage(city);
  if (cityInfo) {
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${cityInfo.urls.regular}" alt="${city}" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>`;
    cityContainer.innerHTML += itemContent
  }
}


// ^ Events
window.addEventListener("load", function () {
  navigator.geolocation.getCurrentPosition(success);
  for (let i = 0; i < recentCities.length; i++) {
    displayRecentCity(recentCities[i].city, recentCities[i].country)
  }
})

city.addEventListener("click",function(e){
  console.log(e.target.alt);
  if(e.target.alt == undefined){
    return
   }else{
    getWeather(e.target.alt)
   }
})

document.addEventListener("keyup", function (e) {
  if (e.key == "Enter") getWeather(searchBox.value);
})