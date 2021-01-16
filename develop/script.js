// $(document).ready(function () {
//     $(document).foundation();
// });

// Set global variable for ajax response on document event listener
var cityChoice
var choiceIndex

$("#citySubmit").on("click", function (e) {
  e.preventDefault();
  // SDK for GeoDB Cities per RapidAPI
  $(".removeOption").remove()
  let cityName = $("#cityInput").val()
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=" + cityName,
    "method": "GET",
    "headers": {
      "x-rapidapi-key": "4158f96d1emsh29be4d938fb2c05p1b6561jsn48bbd9b8afa1",
      "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
    }
  };

  // Requesting server data from GeoDB
  $.ajax(settings)
    .then(function (response) {
      cityChoice = response
      // Function to add buttons for additional searches
      if (response.data.length > 1) {
        $("#resultsContainer").css("display","block")
        for (let i = 0; i < response.data.length; i++) {
          let buttonEl = $("<button>");
          let cityOption = response.data[i].city + ", " + response.data[i].region + ", " + response.data[i].countryCode
          buttonEl.text(cityOption).attr("class","button removeOption historyChoice").attr("data-index",i)
          $("#resultsSection").append(buttonEl)
        }
      }
    })
})

$(document).on("click",".historyChoice", function() {
  choiceIndex = $(this).attr("data-index")
  $(".removeOption").remove()
  $("#resultsContainer").css("display","none")
  buttonEl = $("<button>")


  buttonEl.text(cityChoice.data[choiceIndex].city + ", " + cityChoice.data[choiceIndex].region + ", " + cityChoice.data[choiceIndex].countryCode).attr("class","button historyItem")
  console.log(buttonEl)
  $(`#historyReveal`).append(buttonEl);

  // Weather card
  weatherSection(cityChoice.data[choiceIndex].city,cityChoice.data[choiceIndex].region,cityChoice.data[choiceIndex].countryCode);
  console.log(cityChoice)



  //Stats at a glance Card
  let regionURL = "https://restcountries.eu/rest/v2/alpha?codes=" + cityChoice.data[choiceIndex].countryCode
  
  $.ajax({
    url: regionURL,
    method: "GET"
  })
    .then(function(response) {
      console.log(response)

      let lat =  (response[0].latlng[0]).toFixed(2)
      let lon = (response[0].latlng[1]).toFixed(2)
      let Offset = response[0].timezones[0];
      let flag = response[0].flag

      var latDirection = ""
      var lonDirection = ""

      if ( lat < 0) {
        lat *= -1
        latDirection = "S"
      } else {
        latDirection = "N"
      }

      if ( lon < 0) {
        lon *= -1
        lonDirection = "W"
      } else {
        lonDirection = "E"
      }

      function commaSeparator(num) {
        var number = num.toString().split(".");
        number[0] = number[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return number.join(".");
      }
      
      $("#flag").attr("src",flag)
      $("#country").text("Country: " + response[0].name)
      $("#capital").text("Capital: " + response[0].capital)
      $("#region").text("Region: " + response[0].region)
      $("#lat").text("Country's Latitude: " + lat + "\u00B0" + latDirection)
      $("#lon").text("Country's Longitude: " + lon + "\u00B0" + lonDirection)
      $("#population").text("Country's Population: " + commaSeparator(response[0].population))
      $("#language").text("Language: " + response[0].languages[0].name)
      $("#currency").text("Currency: " + response[0].currencies[0].code + ", " + response[0].currencies[0].name)
      $("#callingCode").text("Country Calling Code: +" + response[0].callingCodes[0])
      $("#localTime").text("Coutnry's Local Time: " + moment().utcOffset(Offset).format('h:mmA'))
      $("#localTimeZone").text("Time Zone: " + response[0].timezones[0])

      // News card
      let newsApiKey = "MwbdU0E8AaAXfZot5GBd7PBuxvJwRfzr"
      let newsUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&q=" + cityChoice.data[choiceIndex].city + "," + response[0].name + "&api-key=" + newsApiKey
      console.log(newsUrl)


      $.ajax({
        url: newsUrl,
        method: "GET"
      })
        .then(function(response) {
          console.log(response.response)
          $(".newsItem").remove()
          var breakEl = $("<br>")
          for (let i = 0; i < response.response.docs.length; i++) {
            let articleImage = $("<img>")
            let articleImageUrl = response.response.docs[i].multimedia[22].url
            articleImage.attr("src","https://www.nytimes.com/" + articleImageUrl).attr("class", "newsItem")
            $("#newsArticles").append(articleImage)

            let articleHeadline = $("<a>")
            articleHeadline.text(response.response.docs[i].headline.main).attr("class", "newsItem").attr("href", response.response.docs[i].web_url).attr("target","_blank")
            $("#newsArticles").append(articleHeadline)

            

            $("#newsArticles").append(breakEl)
          }
        })
    })
});



const openWeatherKey = "60b0bb54fb9c74823c9f4bfc9fc85c96";

//Auto Cap text on keydown feature
$('#cityInput').on('keydown', function (e) {
  let input = $(this).val();
  input = input.toLowerCase().replace(/\b[a-z]/g, function (c) {
    return c.toUpperCase();
  });
  $(this).val(input);
})



//weather Card
function weatherSection (city, state, country) {

  
$('#newsCard').on('click', function() {
  $('.newsSection').css('display', 'block');
  $('.newsSection')[0].scrollIntoView();
});

//Forecast
$('#forecastCard').on('click', function() {
  $('.forecastSection').css('display', 'block');
  $('.forecastSection')[0].scrollIntoView();
})

//Weather
$('#weatherCard').on('click', function() {
  $('.weatherSection').css('display', 'block');
  $('.weatherSection')[0].scrollIntoView();
})

//Map
$('#mapCard').on('click', function() {
  $('.mapSection').css('display', 'block');
  $('.mapSection')[0].scrollIntoView();
  
})


    //openWeather
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&units=imperial&appid=${openWeatherKey}`;

    $.ajax({
      url: url,
      method: "GET",
    }).then(function (response) {
      console.log(url)




      $('#map').html('');
      //country code 
      

      //call forecast function
      forecast(response.coord.lat, response.coord.lon);
      //Call Google Maps function
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([response.coord.lon, response.coord.lat]),
          zoom: 10
        })
      });
      //current conditions

      //weather description
      let weatherDescription = response.weather[0].description;
      weatherDescription = weatherDescription.toLowerCase().replace(/\b[a-z]/g, function (c) {
        return c.toUpperCase();
      });
      let weatherDesc = $("#weatherDesc");
      console.log(weatherDescription);
      weatherDesc.text("Current reports show: " + weatherDescription);

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
      tempContent = "Temperature: " + tempContent.toFixed(0) + " °F";
      $(temp).text(tempContent);

      //Humidity
      let humid = $("#humid");
      $(humid).text("Humidity: " + response.main.humidity + "%");

      //Wind Speed
      let wind = $("#wind");
      $(wind).text("Wind Speed: " + response.wind.speed.toFixed(0) + " MPH");

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

//end of weather card


//5 day forecast 
function forecast(lat, lon){

    let forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&units=imperial&appid=${openWeatherKey}`;

    $.ajax({
        url: forecastUrl,
        method: 'GET',
    }).then(function (res) {
        console.log(res);
        //Get forecast container div
        const forecastContainer = $('#forecastCards');
        //Clear Div
        $('#forecastCards').html('');
        //loop through response
        for (let i = 1; i < res.daily.length && i < 6; i++) {
          //create card div
          let card = $('<div>');
          //give it an id of index
          card.attr('id', i);
          //give div class card
          card.attr('class', 'card');

          //create another div for icon
          let cardSectionImg = $('<div>');
          cardSectionImg.attr('class', 'card-section');
          let icon = $('<img>');
          let iconUrl = "https://openweathermap.org/img/wn/" + res.daily[i].weather[0].icon + "@2x.png"
          icon.attr('src', iconUrl);

          //create another div for text
          let cardSectionText = $('<div>');
          cardSectionText.attr('class', 'card-section');

          //get date
          let datePTag = $('<p>');
          let time = res.daily[i].dt;
          let secs = time * 1000;
          let date = new Date(secs);
          date = date.toLocaleString();
          date = date.substring(0, 9);
          date = `(${date})`;
          datePTag.text(date)
          cardSectionImg.append(datePTag);

          //get max temp
          let maxTempTag = $('<p>');
          let maxTemp = res.daily[i].temp.max;
          maxTempTag.text('Max Temp: ' + maxTemp.toFixed(0) + " °F");

          //get min temp
          let minTempTag = $('<p>');
          let minTemp = res.daily[i].temp.min;
          minTempTag.text('Min Temp: ' + minTemp.toFixed(0) + " °F");

          //get humidity
          let humidTag = $('<p>');
          let humid = res.daily[i].humidity;
          humidTag.text('Humidity: ' + humid + '%');

          //get wind speed
          let windSpeedTag = $('<p>');
          let windSpeed = res.daily[i].wind_speed;
          windSpeedTag.text('Wind Speed: ' + windSpeed.toFixed(0) + ' MPH');
          

          //append img tag to forecast container
          card.append(cardSectionImg);
          //append icon to img tag
          cardSectionImg.append(icon);
          card.css("width", '125px');
          //append card text to card
          card.append(cardSectionText);
          //append max temp tag to text section & etc.
          cardSectionText.append(maxTempTag);
          cardSectionText.append(minTempTag);
          cardSectionText.append(humidTag);
          cardSectionText.append(windSpeedTag);
          //append card to forecast container
          forecastContainer.append(card);
        }
        
    })
}
//end of forecast card


//closing sections 
$('a[value*="close"').on('click', function() {
  $(this).closest('section').css('display', 'none');


});



