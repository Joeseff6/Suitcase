//=========================================================================================================================================
//Credits and Acknowledgements
//Line 237: marker source: https://medium.com/attentive-ai/working-with-openlayers-4-part-2-using-markers-or-points-on-the-map-f8e9b5cae098
//Line 593: Splash Screen inspired and modified from: https://www.youtube.com/watch?v=MOlaldp1Fv4
//=========================================================================================================================================

const newsApiKey = "MwbdU0E8AaAXfZot5GBd7PBuxvJwRfzr";
const openWeatherKey = "60b0bb54fb9c74823c9f4bfc9fc85c96";

var cityChoice;
var index;
var queryCity;
var historyArray = [];
var favoritesArray = []; 
var historyIndices = [];
var favoritesIndices = [];

getData();
historyBadgeDisplay();
favoritesBadgeDisplay();

function storeData() {
  localStorage.setItem("Favorite Cities", JSON.stringify(favoritesArray)); 
  localStorage.setItem("City History", JSON.stringify(historyArray));
  localStorage.setItem("History Indices", JSON.stringify(historyIndices));
  localStorage.setItem("Favorites Indices", JSON.stringify(favoritesIndices));
}

function getData() {
  var storedFavorites = JSON.parse(localStorage.getItem("Favorite Cities"));
  if (storedFavorites !== null) {
    favoritesArray = storedFavorites;
  }
  var storedHistory = JSON.parse(localStorage.getItem("City History"));
  if (storedHistory !== null) {
    historyArray = storedHistory;
  }

  var storedHistoryIndices = JSON.parse(localStorage.getItem("History Indices"));
  if (storedHistoryIndices !== null) {
    historyIndices = storedHistoryIndices;
  }

  var storedFavIndices = JSON.parse(localStorage.getItem("Favorites Indices"));
  if (storedFavIndices !== null) {
    favoritesIndices = storedFavIndices;
  }
  rendorData();
}

function rendorData() {
  for (let i = 0; i < favoritesArray.length; i++) {
    let buttonEl = $("<button/>");
    buttonEl.text(favoritesArray[i]).attr("class","button searchItem faveItem").attr("data-type","favorite").attr("data-close", "").attr("data-index",favoritesIndices[i]);
    $("#favoritesRevealButtons").append(buttonEl);
  }

  for (let i = 0; i < historyArray.length; i++) {
    let buttonEl = $("<button/>");
    buttonEl.text(historyArray[i]).attr("class","button searchItem hisItem").attr("data-type","history").attr("data-close","").attr("data-index",historyIndices[i]).attr("data-close","historyReveal1");
    $("#historyRevealButtons").append(buttonEl);
  }
}

$("#citySubmit").on("click", function (e) {
  e.preventDefault();
  footerQuote(); 
  $("#searchText").text("Choose your desired city");
  $(".removeOption").remove();

  if ($("#cityInput").val()) {
    let cityName = $("#cityInput").val();
    $("#cityInput").val(``);
    cityName = cityName.split(" ");
    cityName = cityName.join("%20");
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&sort=countryCode&namePrefix=" + cityName ,
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "4158f96d1emsh29be4d938fb2c05p1b6561jsn48bbd9b8afa1",
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
      }
    };
    $.ajax(settings)
      .then(function (response) {
        if (response.data.length >= 1) {
          cityChoice = response;
          for (let i = 0; i < response.data.length; i++) {
            let buttonEl = $("<button>");
            let cityOption = response.data[i].city + ", " + response.data[i].region + ", " + response.data[i].countryCode;
            buttonEl.text(cityOption).attr("class","button removeOption searchItem").attr("data-index",i).attr("data-type","search").attr("data-close","");
            $("#searchResultsReveal").append(buttonEl);
          }
        } else {
          $("#searchText").text("No results found, please close");
        }
      });
  } else {
    $("#searchText").text("No results found, please close.");
  }
});

$(document).on("click",".searchItem", function() {

  $("#currentCityContainer").attr("style", "display: block");
  $("#cardsContainer").attr("style", "display: block");
  var searchType = $(this).attr("data-type");
  var cityText = $(this).text();
  var cityArr = cityText.split(",");
  var cityName = cityArr[0].trim();
  var cityRegion = cityArr[1].trim();
  var cityCountryCode = cityArr[cityArr.length-1].trim();

  if (searchType === "search") {
    findHisCopy(cityText);
    findIndex(cityName,cityRegion,cityCountryCode,cityChoice.data);
    historyIndices.push(index);
    historyBadgeDisplay();
    var cityLat = cityChoice.data[index].latitude;
    var cityLon = cityChoice.data[index].longitude;
    weatherSection(cityName, cityCountryCode, cityLat, cityLon, cityRegion);
    forecast(cityLat, cityLon);
    getGMT(cityLat, cityLon);

    var regionUrl = "https://restcountries.eu/rest/v2/alpha?codes=" + cityCountryCode;
    $.ajax({
      url: regionUrl,
      method: "GET"
    })
      .then(function(response) {
        $("#currentCityName").text(cityName + ", " + response[0].name);  
        statsSection(response);
        let newsUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&q=" + cityName + "," + response[0].name + "&api-key=" + newsApiKey;
        $.ajax({
          url: newsUrl,
          method: "GET"
        })
          .then(function(response) {
            $(".newsItem").remove();
            newsSection(response);
          });
      });
  } else {
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&sort=countryCode&namePrefix=" + cityName ,
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "4158f96d1emsh29be4d938fb2c05p1b6561jsn48bbd9b8afa1",
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
      }
    };
    $.ajax(settings)
      .then(function (response) {
        cityChoice = response;
        findIndex(cityName,cityRegion,cityCountryCode,response.data);
        cityLat = response.data[index].latitude;
        cityLon = response.data[index].longitude;
        weatherSection(cityName, cityCountryCode, cityLat, cityLon, cityRegion);
        forecast(cityLat, cityLon);
        getGMT(cityLat, cityLon);

        var regionUrl = "https://restcountries.eu/rest/v2/alpha?codes=" + cityCountryCode
        $.ajax({
          url: regionUrl,
          method: "GET"
        })
          .then(function(response) {
            $("#currentCityName").text(cityName + ", " + response[0].name);
            statsSection(response);
            let newsUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&q=" + cityName + "," + response[0].name + "&api-key=" + newsApiKey;
            $.ajax({
              url: newsUrl,
              method: "GET"
            })
              .then(function(response) {
                $(".newsItem").remove();
                newsSection(response);
              });
          });
        });
  }
  storeData();
  $(".removeOption").remove();
  $("#historyReveal").foundation("close");
  $("#searchResultsReveal").foundation("close");
  $("#favoritesReveal").foundation("close");
});

function statsSection(response) {
  let lat =  (response[0].latlng[0]).toFixed(2);
  let lon = (response[0].latlng[1]).toFixed(2);
  let flag = response[0].flag;
  var latDirection = "";
  var lonDirection = "";
  currencyConverter(response[0].currencies[0].code,response[0].currencies[0].symbol);
  if ( lat < 0) {
    lat *= -1;
    latDirection = "S";
  } else {
    latDirection = "N";
  }
  if ( lon < 0) {
    lon *= -1;
    lonDirection = "W";
  } else {
    lonDirection = "E";
  }

  function commaSeparator(num) {
    var number = num.toString().split(".");
    number[0] = number[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return number.join(".");
  }
  
  $("#flag").attr("src",flag);
  $("#country").text("Country: " + response[0].name);
  $("#capital").text("Capital: " + response[0].capital);
  $("#region").text("Region: " + response[0].region);
  $("#lat").text("Country's Latitude: " + lat + "\u00B0" + latDirection);
  $("#lon").text("Country's Longitude: " + lon + "\u00B0" + lonDirection);
  $("#population").text("Country's Population: " + commaSeparator(response[0].population));
  $("#area").text("Country's total area: " + commaSeparator(response[0].area) + " sq. km.");
  $("#language").text("Language: " + response[0].languages[0].name);
  $("#currency").text("Currency: " + response[0].currencies[0].code + ", " + response[0].currencies[0].name);
  $("#callingCode").text("Country Calling Code: +" + response[0].callingCodes[0]);

}

function openLayers(x, y){
  $('#map').html('');

      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([y, x]),
          zoom: 10
        })
      });
      var marker = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat([y,x])
        ), 
      });
      marker.setStyle(new ol.style.Style({
        image: new ol.style.Icon(({
            src: 'Assets/Images/pin-icon-20px.png'
        }))
      }));
      var vectorSource = new ol.source.Vector({
        features: [marker]
      });
      var markerVectorLayer = new ol.layer.Vector({
        source: vectorSource,
      });
      map.addLayer(markerVectorLayer);
      return;
}


function weatherSection (city, country, lat, lon, state) {
  let mapLat = lat;
  let mapLon = lon;

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=imperial&appid=${openWeatherKey}`;

    $.ajax({
      url: url,
      method: "GET",
      
    }).then(function (response) {

      $('#newsCard').on('click', function() {
        $('.newsSection').css('display', 'block');
        $('.newsSection')[0].scrollIntoView();
      });

      $('#forecastInfoCard').on('click', function() {
        $('.forecastSection').css('display', 'block');
        $('.forecastSection')[0].scrollIntoView();
      });
      $('#weatherCard').on('click', function() {
        $('.weatherSection').css('display', 'block');
        $('.weatherSection')[0].scrollIntoView();
      });
      $('#mapCard').on('click', function() {
        $('.mapSection').css('display', 'block');
        $('.mapSection')[0].scrollIntoView();
        if ($('#map')){
          openLayers(response.coord.lat, response.coord.lon);
        };
      });

      $('#statsCard').on('click', function() {
        $('.statsSection').css('display', 'block');
        $('.statsSection')[0].scrollIntoView();
      });
      
      openLayers(mapLat, mapLon);

      let weatherDescription = response.weather[0].description;
      weatherDescription = weatherDescription.toLowerCase().replace(/\b[a-z]/g, function (c) {
        return c.toUpperCase();
      });
      let weatherDesc = $("#weatherDesc");
      weatherDesc.text("Current reports show: " + weatherDescription);

      let icon = response.weather[0].icon;
      let iconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      let img = $("#conditionsIcon");
      img.attr("src", iconUrl).attr("alt", weatherDescription);

      let temp = $("#temp");
      let tempContent = response.main.temp;
      tempContent = parseFloat(tempContent);
      tempContent = "Temperature: " + tempContent.toFixed(0) + " °F";
      $(temp).text(tempContent);

      let humid = $("#humid");
      $(humid).text("Humidity: " + response.main.humidity + "%");

      let wind = $("#wind");
      $(wind).text("Wind Speed: " + response.wind.speed.toFixed(0) + " MPH");

      let uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${response.coord.lat}&lon=${response.coord.lon}&appid=${openWeatherKey}`;

      $.ajax({
        url: uvIndexUrl,
        method: "GET",
      }).then(function (data) {
        let uvIndex = $('#uvIndex');
        let uvIndexNum = data.value;
        $(uvIndex).text("UV Index: " + uvIndexNum);
        
      });

    }).catch(function(){
      let errorUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&units=imperial&appid=${openWeatherKey}`
      
      $.ajax({
        url: errorUrl,
        method: 'GET',
      }).then(function(error) {
        $('#newsCard').on('click', function() {
            $('.newsSection').css('display', 'block');
            $('.newsSection')[0].scrollIntoView();
          });
          $('#forecastInfoCard').on('click', function() {
            $('.forecastSection').css('display', 'block');
            $('.forecastSection')[0].scrollIntoView();
          })     
          $('#weatherCard').on('click', function() {
            $('.weatherSection').css('display', 'block');
            $('.weatherSection')[0].scrollIntoView();
          })      
          $('#mapCard').on('click', function() {
            $('.mapSection').css('display', 'block');
            $('.mapSection')[0].scrollIntoView();
            if ($('#map')){
              openLayers(error.coord.lat, error.coord.lon);
        }       
      })      

      $('#statsCard').on('click', function() {
        $('.statsSection').css('display', 'block');
        $('.statsSection')[0].scrollIntoView();
      })     
      openLayers(mapLat, mapLon);

      let weatherDescription = error.weather[0].description;
      weatherDescription = weatherDescription.toLowerCase().replace(/\b[a-z]/g, function (c) {
        return c.toUpperCase();
      });
      let weatherDesc = $("#weatherDesc");
      weatherDesc.text("Current reports show: " + weatherDescription);

      let icon = error.weather[0].icon;
      let iconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      let img = $("#conditionsIcon");
      img.attr("src", iconUrl).attr("alt", weatherDescription);

      let temp = $("#temp");
      let tempContent = error.main.temp;
      tempContent = parseFloat(tempContent);
      tempContent = "Temperature: " + tempContent.toFixed(0) + " °F";
      $(temp).text(tempContent);

      let humid = $("#humid");
      $(humid).text("Humidity: " + error.main.humidity + "%");

      let wind = $("#wind");
      $(wind).text("Wind Speed: " + error.wind.speed.toFixed(0) + " MPH");

      let eUvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${error.coord.lat}&lon=${error.coord.lon}&appid=${openWeatherKey}`;
      $.ajax({
        url: eUvIndexUrl,
        method: "GET",
      }).then(function (eData) {
        let uvIndex = $('#uvIndex');
        let uvIndexNum = eData.value;
        $(uvIndex).text("UV Index: " + uvIndexNum);
        
      });
      });
    });
    return;
  }


function forecast(flat, flon){

  let forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${flat}&lon=${flon}&exclude=current,minutely,hourly&units=imperial&appid=${openWeatherKey}`;

  $.ajax({
      url: forecastUrl,
      method: 'GET',
  }).then(function (res) {
      const forecastContainer = $('#forecastCards');
      $('#forecastCards').html('');
      for (let i = 1; i < res.daily.length && i < 6; i++) {
        let card = $('<div>');
        card.attr('id', i);
        card.attr('class', 'card');

        let cardSectionImg = $('<div>');
        cardSectionImg.attr('class', 'card-section');
        let icon = $('<img>');
        let iconUrl = "https://openweathermap.org/img/wn/" + res.daily[i].weather[0].icon + "@2x.png"
        icon.attr('src', iconUrl).attr('alt', res.daily[i].weather[0].description);

        let cardSectionText = $('<div>');
        cardSectionText.attr('class', 'card-section');

        let datePTag = $('<p>');
        let time = res.daily[i].dt;
        let secs = time * 1000;
        let date = new Date(secs);
        date = date.toLocaleString();
        date = date.substring(0, 9);
        date = `(${date})`;
        datePTag.text(date)
        cardSectionImg.append(datePTag);

        let maxTempTag = $('<p>');
        let maxTemp = res.daily[i].temp.max;
        maxTempTag.text('Max Temp: ' + maxTemp.toFixed(0) + " °F");

        let minTempTag = $('<p>');
        let minTemp = res.daily[i].temp.min;
        minTempTag.text('Min Temp: ' + minTemp.toFixed(0) + " °F");

        let humidTag = $('<p>');
        let humid = res.daily[i].humidity;
        humidTag.text('Humidity: ' + humid + '%');

        let windSpeedTag = $('<p>');
        let windSpeed = res.daily[i].wind_speed;
        windSpeedTag.text('Wind Speed: ' + windSpeed.toFixed(0) + ' MPH');
        
        card.append(cardSectionImg);
        cardSectionImg.append(icon);
        card.css("width", '125px');
        card.append(cardSectionText);
        cardSectionText.append(maxTempTag);
        cardSectionText.append(minTempTag);
        cardSectionText.append(humidTag);
        cardSectionText.append(windSpeedTag);
        forecastContainer.append(card);
      }
      
  })
}

function newsSection(response) {
  let articleCount = 0;
  for (let i = 0; i < response.response.docs.length; i++) {
    if (response.response.docs[i].multimedia[22]) {
      var breakEl = $("<br>");
      breakEl.attr("class", "newsItem");
      let articleImage = $("<img>");
      let articleImageUrl = response.response.docs[i].multimedia[22].url;

      articleImage.attr("src","https://www.nytimes.com/" + articleImageUrl).attr("class", "newsItem").attr("id", "newsImg").attr("alt", response.response.docs[0].snippet);
      $("#newsArticles").append(articleImage);
      let articleHeadline = $("<a>");
      let articlePubDate = (response.response.docs[i].pub_date).substr(0,10);
      articleHeadline.text('"' + response.response.docs[i].headline.main + '" (' + articlePubDate +')').attr("class", "newsItem").attr("href", response.response.docs[i].web_url).attr("target","_blank").attr("id", "newsHl");
      $("#newsArticles").append(articleHeadline);
      let articleAbstract = $("<p>");
      articleAbstract.text(response.response.docs[i].abstract).attr("class","newsItem").attr("id","newsAbs");
      $("#newsArticles").append(articleAbstract);
      $("#newsArticles").append(breakEl);
      articleCount++;
    }
    $("#newsText").text("News: " + articleCount + " articles found");
  }
}

$('a[value*="close"').on('click', function() {
  $(this).closest('section').css('display', 'none');
});

function footerQuote () {
  let quoteArray = [" Not all those who wander are lost. | J.R.R. Tolkien"," If you don’t know where you’re going, any road will get you there. | Lewis Carroll", " The world is a book and those who do not travel read only one page. | St. Augustine", "Two roads diverged in a wood and I – I took the one less traveled by. | Robert Frost",
  " Only he that has traveled the road knows where the holes are deep. | Chinese Proverb", " Traveling – it leaves you speechless, then turns you into a storyteller. | Ibn Battuta", " To move, to breathe, to fly, to float, to gain all while you give, to roam the roads of lands remote, to travel is to live. | Hans Christian Andersen", " There are no foreign lands. It is the traveler only who is foreign. | Robert Louis Stevenson" ];
  let quoteNum = Math.floor(Math.random() * quoteArray.length);
  $("#footerMessage")[0].innerHTML = quoteArray[quoteNum];
};
footerQuote ();

let topBtn = $("#topBtn")[0];
window.onscroll = function() {scrollFunction()};
  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      topBtn.style.display = "block";
    } else {
      topBtn.style.display = "none";
    }
}
$("#topBtn").on('click', function () {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

function historyBadgeDisplay() {
  let historyBadge = $("#historyBadge")[0];
  historyBadge.textContent = historyArray.length;
  if (historyArray.length > 0){
    historyBadge.style.display = "block";
    } else {
    historyBadge.style.display = "none";
  };
};

function favoritesBadgeDisplay() {
  let favoritesBadge = $("#favoritesBadge")[0];
  favoritesBadge.textContent = favoritesArray.length;
  if (favoritesArray.length > 0){
    favoritesBadge.style.display = "block";
    } else {
    favoritesBadge.style.display = "none";
  };
};

$("#addToFavorites").on("click", function() {
  if (cityChoice) {
    var cityOption = cityChoice.data[index].city + ", " + cityChoice.data[index].region + ", " + cityChoice.data[index].countryCode;
    findFaveCopy(cityOption)
    favoritesBadgeDisplay(); 
    storeData();
  }
})

$('#cityInput').on('keydown', function (e) {
  let input = $(this).val();
  input = input.toLowerCase().replace(/\b[a-z]/g, function (c) {
    return c.toUpperCase();
  });
  $(this).val(input);
})
function clearLocalHistory (){
  localStorage.clear("City History");
  historyArray = [];
  historyBadgeDisplay();
  $("button").remove(".hisItem");
};
$("#clearLocalHistory").on('click', clearLocalHistory);


function clearLocalFavorites (){
  localStorage.clear("Favorite Cities");
  favoritesArray = [];
  favoritesBadgeDisplay();
  $("button").remove(".faveItem");
};
$("#clearLocalFavorites").on('click', clearLocalFavorites);

function makeSplash (){
  var splash = $(".splash");
  setTimeout (()=>{
    splash.addClass("fade-out");
  },3500);
  makeFunctional();
};
function makeFunctional (){
  var splash = $(".splash");
  setTimeout (()=>{
    splash.addClass("display-none");
  },4500);
}

$("document").ready(makeSplash);

function findIndex(cityName,cityRegion,cityCountryCode,object) {
  var arr = [];
  for (let i = 0; i < object.length; i++) {
    arr.push(Object.values(object[i]));
    var cityindex = $.inArray(cityName, arr[i]);
    var regionindex = $.inArray(cityRegion, arr[i]);
    var countryindex = $.inArray(cityCountryCode, arr[i]);

    if (cityindex !== -1 && regionindex !== -1 && countryindex !== -1) {
      index = i;
      break;
    }
  }
}

function currencyConverter(code, symbol){
  codeUrl = `https://free.currconv.com/api/v7/convert?q=USD_${code}&compact=ultra&apiKey=b46f7e5a17445272929f`
  $.ajax({
    url: codeUrl,
    method: 'GET',
  }).then(function (response){
    let value = response;
    value = JSON.stringify(value);
    value = value.split(':');
    value = value[1].split('}');
    value = parseFloat(value).toFixed(2);

    let codeVal = code;
  
    $('#curSymbol').text(symbol+""+value + " " +codeVal);
    })
}

function getGMT(flat, flon){
  let forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${flat}&lon=${flon}&exclude=current,minutely,hourly&units=imperial&appid=${openWeatherKey}`;
  $.ajax({
      url: forecastUrl,
      method: 'GET',
  }).then(function (res) {
        var utcOffset = (res.timezone_offset)/60;
        var timeZone = String(utcOffset/60);
        var timeZoneFirst = timeZone.substr(0,1);
        if (timeZoneFirst === "-") {
        var gmtZone = ("GMT "+ timeZone);
        } else {
          var gmtZone = ("GMT +"+ timeZone);
        };
        var currentLocalTime = moment().utcOffset(utcOffset).format('h:mmA');
        $("#localTime").text("City's Local Time: " + currentLocalTime);
        $("#localTimeZone").text("Time Zone: " + gmtZone);
  })
};

function findFaveCopy(cityText) {
  var faveCityExist = $.inArray(cityText,favoritesArray);
  if (faveCityExist === -1) {
    let buttonEl = $("<button>");
    buttonEl.text(cityText).attr("class","button searchItem faveItem").attr("data-close", "").attr("data-index",index);
    $("#favoritesReveal").append(buttonEl);
    favoritesIndices.push(index);
    favoritesArray.push(cityText);
  }
}

function findHisCopy(cityText) {
  var hisCityExist = $.inArray(cityText,historyArray);
  if (hisCityExist === -1) {
    buttonEl = $("<button>");
    buttonEl.text(cityText).attr("class","button searchItem hisItem").attr("data-close","").attr("data-index",index).attr("data-type","history");
    $(`#historyReveal`).append(buttonEl);
    historyArray.push(cityText);
  }
}