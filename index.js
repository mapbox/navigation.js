var turf = require('turf');

var defaults = {
    units: 'miles',
    maxDistance: 0.1
};

var navigation = module.exports = {};

/**
 * Given a user location and route, calculates whether re-routing should occur
 * @param {object} GeoJSON point feature representing user location
 * @param {object} Route from Mapbox directions API
 * @returns {boolean}
 */
navigation.shouldReRoute = function(user, route) {
    var r = {
        type: 'Feature',
        properties: {},
        geometry: route.routes[0].geometry
    };
    var closestPoint = turf.pointOnLine(r, user);
    return turf.distance(user, closestPoint, defaults.units) > defaults.maxDistance ? true : false;
};

/**
 * Given a user location and route, calculates closest step to user
 * @param {object} GeoJSON point feature representing user location
 * @param {object} Route from Mapbox directions API
 * @returns {number} step
 */
navigation.findNextStep = function(user, route) {
    var previousSlice = 0;
    var currentMax = Infinity;
    var currentStep = 0;
    var routeCoordinates = route.routes[0].geometry.coordinates;
    var stepCoordinates = route.routes[0].steps;

    for (var p = 0; p < routeCoordinates.length; p++) {
        for (var i = 0; i < stepCoordinates.length; i++) {;
            if (arraysEqual(stepCoordinates[i].maneuver.location.coordinates, routeCoordinates[p])) {
                var slicedSegment = routeCoordinates.slice(previousSlice, p + 1);
                previousSlice = p;
                var segmentRoute = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: slicedSegment
                    }
                };
                var distance = turf.distance(user, turf.pointOnLine(segmentRoute, user), defaults.units);
                if (distance < currentMax) {
                    currentMax = distance;
                    currentStep = i;
                }
            }
        }
    }
    return currentStep;
};

function arraysEqual(array1, array2) {
    if (array1.length !== array2.length) return false;
    for (var i = array1.length; i--;) {
        if (array1[i] !== array2[i]) return false;
    }
    return true;
}
