require('mapbox.js');
require('leaflet-hash');
var request = require('request');
var debounce = require('debounce');
var endpoint = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
var polyline = require('polyline');

// Setup map
L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';
var map = L.mapbox.map('map').setView([39.9229, -75.1351], 14);
L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v8').addTo(map);
L.hash(map);
var marker = L.marker([0, 0]).addTo(map);
var routeGeoJSON = L.layerGroup().addTo(map);
var userLocation = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [] }};
L.geoJson(require('../fixtures/downtown').routes[0].geometry).addTo(routeGeoJSON);

var activeRoute = require('../fixtures/downtown').routes[0];
var stepDiv = document.getElementById('step');

// Navigation.js can handle both geometries=polyline and geometries=geojson
// However, the Mapbox directions API will default to geometries=geojson
var geometries = 'polyline';
// var geometries = 'geojson';

// Setup navigation.js
var navigation = require('../../')({
    units: 'miles',
    maxReRouteDistance: 0.03,
    maxSnapToLocation: 0.01
});

// Alwats set the initial step to 0
var currentStep = 0;

map.on('mousemove', function(e) {
    userLocation.geometry.coordinates[0] = e.latlng.lng;
    userLocation.geometry.coordinates[1] = e.latlng.lat;

    var stepInfo = navigation.getCurrentStep(userLocation, activeRoute.legs[0], currentStep);

    // Display whether user should reroute in UI
    document.getElementById('reroute').innerHTML = stepInfo.shouldReRoute;

    // If the user is off the route, `shouldReRoute` will be true
    // In this case, recalculate the route, clear the current route, add the new route
    // and most importantly, reset the currentStep to 0
    if (stepInfo.shouldReRoute) {
        getRoute(e.latlng.lng, e.latlng.lat, -75.118674, 39.94156, function(err, route) {
            routeGeoJSON.clearLayers();
            stepDiv.classList.remove('flash');

            // This example shows how to handle both encoded polylines and GeoJSON
            if (typeof route.routes[0].geometry === 'string') {
                L.geoJson(polyline.toGeoJSON(route.routes[0].geometry)).addTo(routeGeoJSON);
            } else {
                L.geoJson(route.routes[0].geometry).addTo(routeGeoJSON);
            }

            activeRoute = route.routes[0];
            currentStep = 0;
        });
    }

    // Flash the instructions to signal to the user the maneuver is coming up soon
    if (stepInfo.alertUserLevel.high) {
        if (!stepDiv.classList.contains('flash')) stepDiv.classList.add('flash');
    }

    // If the calculated step is greater than the users current step, update it
    // This means the user completed the current step. Also, turn off flashing
    if (stepInfo.step > currentStep) {
        currentStep = stepInfo.step;
        stepDiv.classList.remove('flash');
    }

    // Get the instruction of the next step and display it
    document.getElementById('step').innerHTML = 'In ' + Math.round(stepInfo.distance * 5280) + ' ft '+ activeRoute.legs[0].steps[stepInfo.step + 1].maneuver.instruction;

    // Snap the marker to closest point along the route
    marker.setLatLng([stepInfo.snapToLocation.geometry.coordinates[1], stepInfo.snapToLocation.geometry.coordinates[0]]);
});

var getRoute = debounce(function(fromLng, fromLat, toLng, toLat, callback) {
    request(endpoint + fromLng + ',' + fromLat + ';' + toLng + ',' + toLat + '.json?geometries=' + geometries + '&overview=full&steps=true&access_token=pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig', function(err, res, body) {
        if (err) return callback(err);
        if (body && res.statusCode === 200) return callback(null, JSON.parse(body));
    });
}, 1000);
