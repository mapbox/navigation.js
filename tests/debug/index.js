require('mapbox.js');
require('leaflet-hash');
var request = require('request');
var debounce = require('debounce');
var endpoint = require('./endpoint');

L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';
var userLocation = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [] }};
var places = document.getElementById('places');
var routeGeoJSON = L.layerGroup();

// Routes to test
var downtown = require('../fixtures/downtown');
var loop = require('../fixtures/routeSF');
var highway = require('../fixtures/highway');

// Setup navigation.js
var navigation = require('../../')({
    units: 'miles',
    maxReRouteDistance: 0.03,
    maxSnapToLocation: 0.01
});

var testCases = [
    {
        center: [39.9432, -75.1433],
        zoom: 14,
        route: downtown,
        name: 'City, downtown'
    }, {
        center: [37.6953, -122.4743],
        zoom: 15,
        route: loop,
        name: 'Route passes over itself'
    }, {
        center: [37.7655, -122.4083],
        zoom: 15,
        route: highway,
        name: 'Highway'
    }
];
var activeTest = testCases[0].route.routes[0];
var currentStep = 0;

var map = L.mapbox.map('map').setView([39.9432, -75.1433], 14);
L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v8').addTo(map);
var marker = L.marker([0, 0]).addTo(map);
L.hash(map);
routeGeoJSON.addTo(map);

for (var i = 0; i < testCases.length; i++) {
    var div = document.createElement('div');
    div.innerHTML = '<a href=# data-route=' + i + ' data-name=' + i + ' data-lng=' + testCases[i].center[1] + ' data-lat=' + testCases[i].center[0] + ' data-zoom=' + testCases[i].zoom + '>' + testCases[i].name + '</a>';
    places.appendChild(div);
    div.addEventListener('click', function(e) {
        map.setView([e.target.dataset.lat, e.target.dataset.lng], e.target.dataset.zoom);
        activeTest = testCases[parseInt(e.target.dataset.route)].route.routes[0];
        addToMap(testCases[parseInt(e.target.dataset.route)].route);
    });
};

addToMap(testCases[0].route);

map.on('mousemove', function(e) {
    userLocation.geometry.coordinates[0] = e.latlng.lng;
    userLocation.geometry.coordinates[1] = e.latlng.lat;

    var nextStep = navigation.findNextStep(userLocation, activeTest.legs[0], currentStep);

    if (activeTest.legs[0].steps.length - 1 !== nextStep.step) {
        document.getElementById('reroute').innerHTML = nextStep.shouldReRoute;
        if (nextStep.shouldReRoute) {
            var last = activeTest.geometry.coordinates[activeTest.geometry.coordinates.length - 1];
            getRouteDebounced(e.latlng.lng, e.latlng.lat, last[0], last[1], function(err, route) {
                routeGeoJSON.clearLayers();
                addToMap(route);
                activeTest = route.routes[0];
                currentStep = 0;
            });
        }
        if (nextStep.step > currentStep) currentStep = nextStep.step;
        document.getElementById('step').innerHTML = 'In ' + Math.round(nextStep.distance * 5280) + ' '+ activeTest.legs[0].steps[nextStep.step + 1].maneuver.instruction;
    } else {
        document.getElementById('step').innerHTML = 'You have reached your destination';
    }
    marker.setLatLng([nextStep.snapToLocation.geometry.coordinates[1], nextStep.snapToLocation.geometry.coordinates[0]]);
});

function getRoute(fromLng, fromLat, toLng, toLat, callback) {
    request(endpoint + fromLng + ',' + fromLat + ';' + toLng + ',' + toLat + '.json?geometries=geojson&overview=full&steps=true&access_token=pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig', function(err, res, body) {
        if (err) return callback(err);
        if (body && res.statusCode === 200) return callback(null, JSON.parse(body));
    });
}
var getRouteDebounced = debounce(getRoute, 1000);

function addToMap(route) {
    L.geoJson({
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': route.routes[0].geometry.coordinates
                }
            }
        ]
    }).addTo(routeGeoJSON);
}
