// ===============================
// SkyPulse Pro Weather App
// ===============================

const API_KEY = "cd0e786b2f49d3f4d3e33b89e487869f";

let currentData = null;
let isCelsius = true;
let tempChart = null;

// -----------------------
// DOM Elements
// -----------------------

const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");

// -----------------------
// Clock
// -----------------------

function updateClock() {

const now = new Date();

document.getElementById("clock").innerHTML =
now.toLocaleTimeString();

}

setInterval(updateClock,1000);
updateClock();

// -----------------------
// Greeting
// -----------------------

function setGreeting(){

const hour = new Date().getHours();

let greeting = "";

if(hour < 12){
greeting = "☀️ Good Morning";
}
else if(hour < 18){
greeting = "🌤 Good Afternoon";
}
else{
greeting = "🌙 Good Evening";
}

document.getElementById("greeting").innerText = greeting;

}

setGreeting();

// -----------------------
// Theme Toggle
// -----------------------

document
.getElementById("themeBtn")
.addEventListener("click",()=>{

document.body.classList.toggle("light");

if(currentData){
drawChart(currentData.main.temp);
}

});

// -----------------------
// Enter Key Search
// -----------------------

cityInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){
fetchWeather();
}

});

// -----------------------
// Main Weather Fetch
// -----------------------

async function fetchWeather(){

const city = cityInput.value.trim();

if(!city){
showError("Please enter city name");
return;
}

try{

clearError();

const response =
await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
);

if(!response.ok){
throw new Error("City not found");
}

const data = await response.json();

currentData = data;

renderWeather(data);

saveHistory(data.name);

fetchAQI(data.coord.lat,data.coord.lon);

fetchForecast(city);

}
catch(error){

showError(error.message);

}

}

// -----------------------
// Location Weather
// -----------------------

function getLocationWeather(){

navigator.geolocation.getCurrentPosition(

async(position)=>{

const lat = position.coords.latitude;
const lon = position.coords.longitude;

const response =
await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
);

const data = await response.json();

currentData = data;

renderWeather(data);

fetchAQI(lat,lon);

fetchForecast(data.name);

},

()=>{
showError("Location access denied");
}

);

}

// -----------------------
// Render Weather
// -----------------------

function renderWeather(data){

weatherCard.style.display="block";

const weather = data.weather[0];

document.getElementById("cityName").innerText =
data.name;

document.getElementById("countryDate").innerText =
`${data.sys.country} • ${new Date().toDateString()}`;

document.getElementById("conditionLabel").innerText =
weather.description;

document.getElementById("tempValue").innerText =
Math.round(data.main.temp);

document.getElementById("feelsLike").innerText =
Math.round(data.main.feels_like)+"°";

document.getElementById("tempRange").innerText =
`H:${Math.round(data.main.temp_max)}° L:${Math.round(data.main.temp_min)}°`;

document.getElementById("humidity").innerText =
data.main.humidity+"%";

document.getElementById("windSpeed").innerText =
Math.round(data.wind.speed*3.6)+" km/h";

document.getElementById("visibility").innerText =
(data.visibility/1000).toFixed(1)+" km";

document.getElementById("pressure").innerText =
data.main.pressure+" hPa";

document.getElementById("cloudiness").innerText =
data.clouds.all+"%";

document.getElementById("gusts").innerText =
data.wind.gust
? Math.round(data.wind.gust*3.6)+" km/h"
: "N/A";

document.getElementById("sunrise").innerText =
formatTime(data.sys.sunrise);

document.getElementById("sunset").innerText =
formatTime(data.sys.sunset);

document.getElementById("weatherIconBig").innerText =
getEmoji(weather.id);

const uv =
Math.round((1-data.clouds.all/100)*10);

document.getElementById("uvVal").innerText = uv;

showWeatherTip(data.main.temp);

const flag =
`https://flagsapi.com/${data.sys.country}/flat/64.png`;

document.getElementById("countryFlag").src =
flag;

drawChart(data.main.temp);

}

// -----------------------
// AQI
// -----------------------

async function fetchAQI(lat,lon){

try{

const response =
await fetch(
`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
);

const data = await response.json();

document.getElementById("aqi").innerText =
data.list[0].main.aqi;

}
catch{

document.getElementById("aqi").innerText =
"N/A";

}

}

// -----------------------
// Forecast
// -----------------------

async function fetchForecast(city){

const response =
await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
);

const data = await response.json();

const container =
document.getElementById("forecastContainer");

container.innerHTML="";

const days =
data.list.filter(item =>
item.dt_txt.includes("12:00:00")
);

days.slice(0,5).forEach(day=>{

container.innerHTML += `
<div class="forecast-card">

<h4>
${new Date(day.dt_txt)
.toLocaleDateString("en-US",
{weekday:"short"})}
</h4>

<div class="icon">
${getEmoji(day.weather[0].id)}
</div>

<p>${Math.round(day.main.temp)}°C</p>

</div>
`;

});

}

// -----------------------
// Weather Tips
// -----------------------

function showWeatherTip(temp){

let tip="";

if(temp>35){

tip="🥤 Stay hydrated and avoid direct sunlight.";

}
else if(temp<10){

tip="🧥 Wear warm clothes outside.";

}
else{

tip="🌤 Perfect weather for outdoor activities.";

}

document.getElementById("weatherTip").innerText =
tip;

}

// -----------------------
// Chart
// -----------------------

function drawChart(temp){

const ctx = document.getElementById("tempChart");

if(tempChart){
tempChart.destroy();
}

const textColor =
document.body.classList.contains("light")
? "#111111"
: "#ffffff";

tempChart = new Chart(ctx,{

type:"line",

data:{

labels:[
"Morning",
"Noon",
"Evening",
"Night"
],

datasets:[{

label:"Temperature",

data:[
temp-2,
temp+2,
temp,
temp-3
],

borderColor:"#00c6ff",
backgroundColor:"#00c6ff",
borderWidth:3,
fill:false,
tension:0.4

}]

},

options:{

responsive:true,

plugins:{
legend:{
labels:{
color:textColor,
font:{
size:14,
weight:"bold"
}
}
}
},

scales:{

x:{
ticks:{
color:textColor,
font:{
size:14,
weight:"bold"
}
},
grid:{
color:"rgba(255,255,255,0.1)"
}
},

y:{
ticks:{
color:textColor,
font:{
size:14,
weight:"bold"
}
},
grid:{
color:"rgba(255,255,255,0.1)"
}
}

}

}

});

}

// -----------------------
// Unit Toggle
// -----------------------

function toggleUnit(){

if(!currentData) return;

const tempEl =
document.getElementById("tempValue");

if(isCelsius){

tempEl.innerText =
Math.round(currentData.main.temp*9/5+32);

document.getElementById("tempUnit")
.innerText="°F";

}
else{

tempEl.innerText =
Math.round(currentData.main.temp);

document.getElementById("tempUnit")
.innerText="°C";

}

isCelsius = !isCelsius;

}

// -----------------------
// Search History
// -----------------------

function saveHistory(city){

let history =
JSON.parse(
localStorage.getItem("history")
) || [];

if(!history.includes(city)){

history.unshift(city);

}

history = history.slice(0,5);

localStorage.setItem(
"history",
JSON.stringify(history)
);

showHistory();

}

function showHistory(){

const history =
JSON.parse(
localStorage.getItem("history")
) || [];

const list =
document.getElementById("historyList");

list.innerHTML="";

history.forEach(city=>{

const li =
document.createElement("li");

li.innerText=city;

li.onclick=()=>{

cityInput.value=city;
fetchWeather();

};

list.appendChild(li);

});

}

showHistory();

// -----------------------
// Favorites
// -----------------------

function saveFavorite(){

if(!currentData) return;

let favorites =
JSON.parse(
localStorage.getItem("favorites")
)||[];

if(!favorites.includes(currentData.name)){

favorites.push(currentData.name);

}

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);

showFavorites();

}

function showFavorites(){

const favorites =
JSON.parse(
localStorage.getItem("favorites")
)||[];

const list =
document.getElementById("favoriteList");

list.innerHTML="";

favorites.forEach(city=>{

const li =
document.createElement("li");

li.innerText=city;

li.onclick=()=>{

cityInput.value=city;
fetchWeather();

};

list.appendChild(li);

});

}

showFavorites();

// -----------------------
// Voice Search
// -----------------------

function startVoiceSearch(){

const recognition =
new webkitSpeechRecognition();

recognition.lang="en-US";

recognition.start();

recognition.onresult=(event)=>{

cityInput.value =
event.results[0][0].transcript;

fetchWeather();

};

}

// -----------------------
// Helpers
// -----------------------

function formatTime(timestamp){

const date =
new Date(timestamp*1000);

return date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

function showError(msg){
errorMsg.innerText=msg;
}

function clearError(){
errorMsg.innerText="";
}

function getEmoji(id){

if(id>=200 && id<300) return "⛈️";
if(id>=300 && id<400) return "🌦️";
if(id>=500 && id<600) return "🌧️";
if(id>=600 && id<700) return "❄️";
if(id>=700 && id<800) return "🌫️";
if(id===800) return "☀️";
if(id===801) return "🌤️";
if(id===802) return "⛅";
return "☁️";

}