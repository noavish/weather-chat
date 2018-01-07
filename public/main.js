var fetch = function (city) {
    $.ajax({
        method: "GET",
        url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=8ebb385c56cb162f0265a7de786cfeb1&units=metric`,
        success: function (data) {
            console.log(data);
            createCityTemp(data);
        },
        error: function (jqXHR, testStatus) {
            console.log(testStatus);
        }
    })
}

var searchedCities = [];
var runningID = 0;

function timeStamp () {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var date = now.toLocaleDateString();
    return (`at ${hours}:${minutes} on ${date}`);
}

function createCityTemp(data) {
    var tempF = data.main.temp * 1.8 +32;
    var time = timeStamp ();
    var cityObject = {id: runningID, "name": data.name, "tempC": data.main.temp, "tempF": tempF, "time": time};
    searchedCities.push(cityObject);
    runningID++;
    renderSearches();
}

function renderSearches() {
    var $cityResults = $('.city-results');
    $cityResults.empty();
    var citySource = $('#city-template').html();
    var cityTemplate = Handlebars.compile(citySource);
    var newHTML = cityTemplate({city: searchedCities});
    $cityResults.append(newHTML);
    for (var i=0; i<searchedCities.length; i++) {
        var commentSource = $('#comment-template').html();
        var commentTemplate = Handlebars.compile(commentSource);
        newHTML = commentTemplate(searchedCities[i]);
        $(`.comments-container[data-id=${searchedCities[i].id}]`).append(newHTML);
    }
}

$('.get-temp').click(function () {
    var city = $(this).siblings('#city').val();
    fetch(city);
});

$('.city-results').on('click', '.post-comment', function () {
   var comment = $(this).siblings('.input-comment').val();
   var cityToCommentOn = _findCityByName($(this).siblings('.name').text());
   if (!('comments' in cityToCommentOn)) {
       cityToCommentOn.comments = [];
   }
    cityToCommentOn.comments.push({comment: comment});
    renderSearches();
});

function _findCityByName(name) {
    for (var i=0; i<searchedCities.length; i++) {
        if (name === searchedCities[i].name) {
            return searchedCities[i];
        }
    }
}

// $('city-results').on('click', '.remove-post', function () {
//    $(this).
// });
//
// )