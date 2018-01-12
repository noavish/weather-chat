// Ajax request to the weather API
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

// Setting up local storage
var SEARCHES_ID = 'cities';
var RUNNING_ID = 'cities_id';
var sortingHelper = 1;

var saveToLocalStorage = function () {
    localStorage.setItem(SEARCHES_ID, JSON.stringify(searchedCities));
    localStorage.setItem(RUNNING_ID, runningID);
};

var getFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem(SEARCHES_ID) || '[]');
};

// Rebutting global variables
var searchedCities = getFromLocalStorage();
var runningID = localStorage.getItem(RUNNING_ID) || 0;

// Creating time string
function timeStamp (now) {
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var date = now.toLocaleDateString();
    return (`at ${hours}:${minutes} on ${date}`);
}

// Creating new objects and pushing to searchedCities array
function createCityTemp(data) {
    var tempF = data.main.temp * 1.8 +32;
    var now = new Date();
    var timeString = timeStamp(now);
    var cityObject = {id: runningID, "name": data.name, "tempC": data.main.temp.toFixed(2), "tempF": tempF.toFixed(2), "timeString": timeString, "timestamp": now.getTime()};
    searchedCities.push(cityObject);
    runningID++;
    saveToLocalStorage();
    renderSearches();
}

// find city by ID
function _findCityByID(id) {
    for (var i=0; i<searchedCities.length; i++) {
        if (id == searchedCities[i].id) {
            return searchedCities[i];
        }
    }
}

// add comments to searchedCities
function addCommentToArray(clickedElement, comment) {
    var cityToCommentOn = _findCityByID($(clickedElement).parents('.city-result').data().id);
    if (!('comments' in cityToCommentOn)) {
        cityToCommentOn.comments = [];
    }
    cityToCommentOn.comments.push({comment: comment});
    saveToLocalStorage();
    renderSearches();
}

// render view
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

// Sorting by date/temp
function sortBy(sortingCritiria) {
    searchedCities.sort(function(a, b){return (a[sortingCritiria] - b[sortingCritiria]) * sortingHelper});
    sortingHelper *= -1;
}

// sort by name
function sortByName() {
    searchedCities.sort(function(a, b){
        if (a.name < b.name) {
            return -1 * sortingHelper;
        }
        if (a.name > b.name) {
            return sortingHelper;
        }
        return 0;
    });
    sortingHelper *= -1;
}

$('.get-temp').click(function () {
    var city = $(this).parents('.submit-btn-div').siblings('#city').val();
    if (!isCityInArray(city)) {
        fetch(city);
    }
    $(this).parents('.submit-btn-div').siblings('#city').val('');
});

$('#city').keypress(function(event) {
    if (event.keyCode == 13 || event.which == 13) {
        var city = $(this).val();
        if (!isCityInArray(city)) {
            fetch(city);
        }
        event.preventDefault();
        $(this).val('');
    }
});

function isCityInArray(cityName) {
    for (var i=0; i<searchedCities.length; i++) {
        if (cityName.toLowerCase() === searchedCities[i].name.toLowerCase()) {
            alert(`A search was already made for ${cityName}`);
            return true;
        }
    }
    return false;
}

$('.city-results').on('click', '.post-comment', function () {
   var comment = $(this).parents('div').siblings('.input-comment').val();
    addCommentToArray(this, comment);
});

$('.city-results').on('keypress', '.input-comment', function(event) {
    if (event.keyCode == 13 || event.which == 13) {
        var comment = $(this).val();
        addCommentToArray(this, comment);
        event.preventDefault();
        $(this).val('');
    }
});

$('.city-results').on('click', '.remove-post', function () {
    searchedCities.splice($(this).parents('div').index(), 1);
    saveToLocalStorage();
    renderSearches();
});

$('.city-results').on('click', '.remove-comment', function () {
    var idToRemove = $(this).parents('li').index();
    var cityID = $(this).parents('div').index();
    searchedCities[cityID].comments.splice(idToRemove, 1);
    saveToLocalStorage();
    renderSearches();
});


$('.sort-by-city').click(function () {
    sortByName();
    renderSearches();
});

$('.sort-by-temp').click(function () {
    sortBy("tempC");
    renderSearches();
});

$('.sort-by-date').click(function () {
    sortBy("timestamp");
    renderSearches();
});

renderSearches();