require('mapbox.js');
require('leaflet-hash');
var activeTest = 0;
L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';
var userLocation = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [] }};
var places = document.getElementById('places');

// Routes to test
var downtown = require('../fixtures/route');
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

var map = L.mapbox.map('map', 'mapbox.streets').setView([39.9432, -75.1433], 14);
var marker = L.marker([0, 0]).addTo(map);
L.hash(map);

for (var i = 0; i < testCases.length; i++) {
    var div = document.createElement('div');
    div.innerHTML = '<a href=# data-route=' + i + ' data-name=' + testCases[i].name + ' data-lng=' + testCases[i].center[1] + ' data-lat=' + testCases[i].center[0] + ' data-zoom=' + testCases[i].zoom + '>' + testCases[i].name + '</a>';
    places.appendChild(div);
    div.addEventListener('click', function(e) {
        map.setView([e.target.dataset.lat, e.target.dataset.lng], e.target.dataset.zoom);
        activeTest = e.target.dataset.route;
    });

    L.geoJson({
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': testCases[i].route.routes[0].geometry.coordinates
                }
            }
        ]
    }).addTo(map);

    for (var p = 0; p < testCases[i].route.routes[0].steps.length; p++) {
        var maneuver = testCases[i].route.routes[0].steps[p].maneuver;

        L.circle([maneuver.location.coordinates[1], maneuver.location.coordinates[0]], 30, {
            color: 'black',
            weight: 1,
            fillColor: 'black'
        })
            .bindPopup(maneuver.instruction + '. Step: ' + i)
            .addTo(map);
    };

};

map.on('mousemove', function(e) {
    userLocation.geometry.coordinates[0] = e.latlng.lng;
    userLocation.geometry.coordinates[1] = e.latlng.lat;

    var shouldReRoute = navigation.shouldReRoute(userLocation, testCases[activeTest].route.routes[0]);
    document.getElementById('reroute').innerHTML = shouldReRoute;

    var nextStep = navigation.findNextStep(userLocation, testCases[activeTest].route.routes[0]);
    marker.setLatLng([nextStep.snapToLocation.geometry.coordinates[1], nextStep.snapToLocation.geometry.coordinates[0]]);
    document.getElementById('step').innerHTML = 'In ' + Math.round(nextStep.distance * 5280) + ' '+ testCases[activeTest].route.routes[0].steps[nextStep.step].maneuver.instruction;
});
