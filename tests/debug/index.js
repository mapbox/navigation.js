require('mapbox.js');
var mapboxDirectionRoute = require('../fixtures/route');

var navigation = require('../../')({
    units: 'miles',
    maxDistance: 0.1
});

var hash = require('leaflet-hash');
var center = [39.9432, -75.1433];

L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig';

var map = L.mapbox.map('map', 'mapbox.streets')
    .setView(center, 14);

var hash = L.hash(map);

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
}

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
    marker.setLatLng(e.latlng);
    userLocation.geometry.coordinates[0] = e.latlng.lng;
    userLocation.geometry.coordinates[1] = e.latlng.lat;

    var shouldReRoute = navigation.shouldReRoute(userLocation, mapboxDirectionRoute);
    document.getElementById('reroute').innerHTML = shouldReRoute;

    var nextStep = navigation.findNextStep(userLocation, mapboxDirectionRoute);
    document.getElementById('step').innerHTML = 'In ' + Math.round(nextStep.distance * 5280) + ' '+ mapboxDirectionRoute.routes[0].steps[nextStep.step].maneuver.instruction;
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
