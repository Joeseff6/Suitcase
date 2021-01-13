// $(document).ready(function () {
//     $(document).foundation();
// });



//Stats at a glance Card


$("#citySubmit").on("click", function (e) {
  e.preventDefault();
  // SDK for GeoDB Cities per RapidAPI
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=US&namePrefix=Paris",
    "method": "GET",
    "headers": {
      "x-rapidapi-key": "4158f96d1emsh29be4d938fb2c05p1b6561jsn48bbd9b8afa1",
      "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
    }
  };

  $.ajax(settings)
    .then(function (response) {
      console.log(response)
    if (response.data.length > 1) {
      $('#options').css("display","block")
      for (let i = 0; i < response.data.length; i++) {
        let buttonEl = $("<button>");
        buttonEl.text(`button ` + i).attr("class","button")
        $("#options").append(buttonEl)
      }
    }
  });
})

const openWeatherKey = "60b0bb54fb9c74823c9f4bfc9fc85c96";

//weather Card
$("#citySubmit").on("click", function (e) {
  e.preventDefault();

  //user input
  let cityName = $("#cityInput");
  cityName = cityName.val().trim();

  if (cityName.length == 0) {
    //error message
    return 0;
  } else {
    //openWeather
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherKey}`;

    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {

      //country code 
      let countryCode = response.sys.country;

      //call forecast function
      forecast(response.coord.lat, response.coord.lon);
      //current conditions

      //Icon
      let icon = response.weather[0].icon;
      let iconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      let img = $("#conditionsIcon");
      img.attr("src", iconUrl);

      //Temperature
      let temp = $("#temp");
      let tempContent = response.main.temp;
      //convert to int
      tempContent = parseFloat(tempContent);
      //convert from kelvin to fahrenheit
      tempContent = ((tempContent - 273.15) * 9) / 5 + 32;
      tempContent = "Temperature: " + tempContent.toFixed(0) + " °F";
      $(temp).text(tempContent);

      //Humidity
      let humid = $("#humid");
      $(humid).text("Humidity: " + response.main.humidity + "%");

      //Wind Speed
      let wind = $("#wind");
      $(wind).text("Wind Speed: " + response.wind.speed + " MPH");

      //UV Index
      let uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${response.coord.lat}&lon=${response.coord.lon}&appid=${openWeatherKey}`;

      $.ajax({
        url: uvIndexUrl,
        method: "GET",
      }).then(function (data) {
        let uvIndex = $('#uvIndex');
        let uvIndexNum = data.value;
        $(uvIndex).text("UV Index: " + uvIndexNum);
        
      });
    });
  }
});
//end of weather card


//5 day forecast *still in progress*
function forecast(lat, lon){

    let forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${openWeatherKey}`;

    $.ajax({
        url: forecastUrl,
        method: 'GET',
    }).then(function (res) {
        console.log(res);
        const forecastContainer = $('#forecastContainer');
        $('#forecastContainer').html('');
        for (let i = 0; i < res.daily.length && i < 5; i++) {
          let card = $('<div>');
          card.attr('id', i);
          card.attr('class', 'card');

          let cardSectionImg = $('<div>');
          cardSectionImg.attr('class', 'card-section');
          let icon = $('<img>');
          let iconUrl = "https://openweathermap.org/img/wn/" + res.daily[i].weather[0].icon + "@2x.png"
          icon.attr('src', iconUrl);

          let cardSectionText = $('<div>');
          cardSectionText.attr('class', 'card-section');

          let datePTag = $('<p>');
          let time = res.daily[i].dt;
          let secs = time * 1000;
          let date = new Date(secs);
          date = date.toLocaleString();
          date = date.substring(0, 9);
          date = `(${date})`;
        }
        
    })
}