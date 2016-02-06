require('mapbox.js');
require('leaflet-hash');
var mapboxDirectionRoute = require('../fixtures/route');
L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';
var center = [39.9432, -75.1433];

var navigation = require('../../')({
    units: 'miles',
    maxReRouteDistance: 0.03,
    maxSnapToLocation: 0.01,
    warnUserTime: 30
});

var map = L.mapbox.map('map', 'mapbox.streets')
    .setView(center, 14);

L.hash(map);

var route = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
    ]
};

var userLocation = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Point',
        coordinates: []
    }
};

route.features[0].geometry.coordinates = mapboxDirectionRoute.routes[0].geometry.coordinates;

L.geoJson(route).addTo(map);

var marker = L.marker(center).addTo(map);

map.on('mousemove', function(e) {
    userLocation.geometry.coordinates[0] = e.latlng.lng;
    userLocation.geometry.coordinates[1] = e.latlng.lat;

    var shouldReRoute = navigation.shouldReRoute(userLocation, mapboxDirectionRoute.routes[0]);
    document.getElementById('reroute').innerHTML = shouldReRoute;

    var nextStep = navigation.findNextStep(userLocation, mapboxDirectionRoute.routes[0]);
    var stepText = document.getElementById('step');

    if (nextStep.alertUser) {
        stepText.className = 'flash';
        stepText.style.color = 'red';
    } else {
        stepText.className = '';
        stepText.style.color = 'black';
    }

    marker.setLatLng([nextStep.snapToLocation.geometry.coordinates[1], nextStep.snapToLocation.geometry.coordinates[0]]);
    stepText.innerHTML = 'In ' + Math.round(nextStep.distance * 5280) + ' '+ mapboxDirectionRoute.routes[0].steps[nextStep.step].maneuver.instruction;
});


for (var i = 0; i < mapboxDirectionRoute.routes[0].steps.length; i++) {
    var maneuver = mapboxDirectionRoute.routes[0].steps[i].maneuver;

    L.circle([maneuver.location.coordinates[1], maneuver.location.coordinates[0]], 30, {
        color: 'black',
        weight: 1,
        fillColor: 'black'
    })
        .bindPopup(maneuver.instruction + '. Step: ' + i)
        .addTo(map);
};
