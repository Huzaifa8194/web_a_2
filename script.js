
let currentPage = 1;
const itemsPerPage = 5;
let totalPages = 1;




const apiKey = "7bc6894b5f86b5856a15c0f09651a908";
let isCelsius = true;

document
  .getElementById("search-bar")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const city = event.target.value;

      fetchWeatherData(city);
      fetchForecastData(city);
      console.log(`Fetching weather data for ${city}`);
    }
  });

// Example function to fetch weather data (API logic needs to be implemented)
// Fetch weather data
function fetchWeatherData(city) {
  hideError(); // Hide previous errors
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  console.log("API STRING: " + apiUrl);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found or API limit exceeded.");
      }
      return response.json();
    })
    .then((data) => {
      const cityName = data.name;
      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const weatherDescription = data.weather[0].description;
      const weatherIcon = data.weather[0].icon;

      // Update the DOM with weather information
      displayWeatherData(cityName, temperature, humidity, windSpeed, weatherDescription, weatherIcon);
    })
    .catch((error) => {
      displayError(error.message);
    });
}

// Fetch forecast data
function fetchForecastData(city) {
  hideError(); // Hide previous errors
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  console.log("FORECAST DEBUG: " + forecastUrl);
  fetch(forecastUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found or API limit exceeded.");
      }
      return response.json();
    })
    .then((data) => {
      const forecastList = data.list;
      const dailyForecast = getDailyForecast(forecastList);
      displayForecastData(dailyForecast);

      const forecastData = processForecastData(data);
      updateCharts(forecastData.dates, forecastData.temperatures, forecastData.humidity, forecastData.windSpeeds);

      totalPages = Math.ceil(dailyForecast.length / itemsPerPage);
      currentPage = 1; // Reset to page 1 on new search
      displayPaginatedForecast(dailyForecast, currentPage);
      updatePaginationControls(dailyForecast);
    })
    .catch((error) => {
      displayError(error.message);
    });
}









document
  .getElementById("search-bar")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const city = event.target.value.trim();
      if (validateCityInput(city)) {
        fetchWeatherData(city);
        fetchForecastData(city);
      }
    }
  });
function convertTemperature(temp, toCelsius = true) {
  return toCelsius ? ((temp - 32) * 5) / 9 : (temp * 9) / 5 + 32;
}















function displayPaginatedForecast(forecast, page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedForecast = forecast.slice(start, end);

  let forecastHTML = "<div class='forecast-grid'>";
  paginatedForecast.forEach((day) => {
    forecastHTML += `
      <div class="forecast-item">
        <p>${day.date}</p>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather Icon">
        <p>${day.temp} °C</p>
        <p>${day.description}</p>
      </div>
    `;
  });
  forecastHTML += "</div>";
  document.getElementById("forecast").innerHTML = forecastHTML;
}

function updatePaginationControls(forecast) {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      displayPaginatedForecast(forecast, currentPage);
      updatePaginationControls(forecast);
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      displayPaginatedForecast(forecast, currentPage);
      updatePaginationControls(forecast);
    }
  });
}




function processForecastData(data) {
    const dates = [];
    const temperatures = [];
    const humidity = [];
    const windSpeeds = [];
  
    // Loop through the forecast list (every 3 hours)
    for (let i = 0; i < data.list.length; i += 8) { // We take data every 24 hours (8 * 3-hour intervals)
      const forecast = data.list[i];
      const date = new Date(forecast.dt_txt).toLocaleDateString(); // Convert to readable date
  
      dates.push(date);
      temperatures.push(forecast.main.temp);
      humidity.push(forecast.main.humidity);
      windSpeeds.push(forecast.wind.speed);
    }
  
    return {
      dates: dates,
      temperatures: temperatures,
      humidity: humidity,
      windSpeeds: windSpeeds
    };
  }
  

  let chartInstance1 = null; 
  let chartInstance2 = null; 
  let chartInstance3 = null; 
  // Function to update the charts with new data
  function updateCharts(labels, temperatures, humidity, windSpeeds) {
    // 1. Vertical Bar Chart for Temperature
    const barCtx = document.getElementById('barChart').getContext('2d');


    if (chartInstance1) {
      chartInstance1.destroy();
    }

    if (chartInstance2) {
      chartInstance2.destroy();
    }
    if (chartInstance3) {
      chartInstance3.destroy();
    }



    chartInstance1 = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: labels, // X-axis labels (dates)
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures, // Y-axis data
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  
    // 2. Doughnut Chart for Humidity
    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    chartInstance2 = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: labels, // X-axis labels (dates)
        datasets: [{
          label: 'Humidity (%)',
          data: humidity, // Y-axis data
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    // 3. Line Chart for Wind Speed
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    chartInstance3  = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: labels, // X-axis labels (dates)
        datasets: [{
          label: 'Wind Speed (m/s)',
          data: windSpeeds, // Y-axis data
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          fill: true,
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }






  function getDailyForecast(forecastList) {
    const dailyData = [];
    forecastList.forEach((forecast) => {
      if (forecast.dt_txt.includes("12:00:00")) {
        const day = {
          date: forecast.dt_txt.split(" ")[0],
          temp: forecast.main.temp,
          description: forecast.weather[0].description,
          icon: forecast.weather[0].icon,
        };
        dailyData.push(day);
      }
    });
    return dailyData;
  }

function displayForecastData(forecast) {
    let forecastHTML = "<div class='forecast-grid'>";
    forecast.forEach((day) => {
      forecastHTML += `
        <div class="forecast-item">
          <p>${day.date}</p>
          <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather Icon">
          <p>${day.temp} °C</p>
          <p>${day.description}</p>
        </div>
      `;
    });
    forecastHTML += "</div>";
    document.getElementById("forecast").innerHTML = forecastHTML;
  }
  function displayWeatherData(cityName, temperature, humidity, windSpeed, weatherDescription, weatherIcon) {
    const tempToDisplay = isCelsius ? temperature : convertTemperature(temperature, false);
    const unit = isCelsius ? "°C" : "°F";
    
    const weatherDataHTML = `
      <h2>Weather in ${cityName}</h2>
      <p>Temperature: ${tempToDisplay.toFixed(1)} ${unit}</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind Speed: ${windSpeed} m/s</p>
      <p>Condition: ${weatherDescription}</p>
      <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="Weather Icon">
    `;
    document.getElementById("weather-data").innerHTML = weatherDataHTML;

    applyWeatherTheme(weatherDescription);

  }

function applyWeatherTheme(description) {
  const body = document.body;

  // Remove previous weather theme classes
  body.classList.remove('sunny-theme', 'cloudy-theme', 'rainy-theme', 'snowy-theme', 'bluey-theme');

  // Add the appropriate theme class based on the weather description
  if (description.includes("clear")) {
    body.classList.add('bluey-theme');
  } else if (description.includes("clouds")) {
    body.classList.add('cloudy-theme');
  } else if (description.includes("rain")) {
    body.classList.add('rainy-theme');
  } else if (description.includes("snow")) {
    body.classList.add('snowy-theme');
  } else {
    body.classList.add('bluey-theme'); // Fallback theme
  }
}

function applyWeatherTheme(description) {
  const body = document.body;

  // Remove previous weather theme classes
  body.classList.remove('sunny-theme', 'cloudy-theme', 'rainy-theme', 'snowy-theme');

  // Add the appropriate theme class based on the weather description
  if (description.includes("clear")) {
    body.classList.add('sunny-theme');
  } else if (description.includes("clouds")) {
    body.classList.add('cloudy-theme');
  } else if (description.includes("rain")) {
    body.classList.add('rainy-theme');
  } else if (description.includes("snow")) {
    body.classList.add('snowy-theme');
  } else {
    body.classList.add('default-theme'); // Fallback theme
  }
}



document.getElementById("send-btn").addEventListener("click", sendChatMessage);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
});

function sendChatMessage() {
  const inputElement = document.getElementById("chat-input");
  const message = inputElement.value;
  if (!message) return;  // Prevent empty message submission

  // Call the Google Gemini API
  fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBJtlEJZEfQOGRIq0lE1y4i8Na2RBsz1Vc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }]
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.contents && data.contents[0].parts[0].text) {
      displayChatResponse(data.contents[0].parts[0].text);
    } else {
      displayChatResponse("Sorry, I didn't understand that.");
    }
  })
  .catch(error => {
    console.error('Error:', error);
    displayChatResponse("There was an error processing your request.");
  });

  // Clear the input after sending the message
  inputElement.value = '';
}

function displayChatResponse(responseText) {
  const chatAnswerElement = document.getElementById("chat-answer");
  chatAnswerElement.innerHTML = responseText;
}





window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherByCoordinates(lat, lon);
      fetchForecastByCoordinates(lat, lon);
    });
  }
};

function fetchWeatherByCoordinates(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        const cityName = data.name;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const weatherDescription = data.weather[0].description;
        const weatherIcon = data.weather[0].icon;

        displayWeatherData(cityName, temperature, humidity, windSpeed, weatherDescription, weatherIcon);
      }
    });
}

function fetchForecastByCoordinates(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(forecastUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        const forecastList = data.list;
        const dailyForecast = getDailyForecast(forecastList);
        displayForecastData(dailyForecast);
      }
    });
}


// Validate city input
function validateCityInput(city) {
  if (!city) {
    displayError("City name cannot be empty.");
    return false;
  }
  return true;
}

// Display error message
function displayError(message) {
  const errorElement = document.getElementById("error-message");

  // Check if the message is not the specific error to hide
  if (message !== "Cannot set properties of null (setting 'disabled')") {
    errorElement.innerText = message;
    errorElement.style.display = "block"; // Show the error message
  } else {
    errorElement.style.display = "none"; // Hide the error message if it matches
  }
}

// Hide error message
function hideError() {
  const errorElement = document.getElementById("error-message");
  errorElement.innerText = "";
  errorElement.style.display = "none"; // Hide the error message
}

