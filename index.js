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
 * @returns {boolean}
 */
navigation.findClosestStepToUser = function(user, route) {
    var lowest = Infinity;
    var step = 0;

    for (var i = 0; i < route.routes[0].steps.length; i++) {

        var stepPoint = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Point',
                coordinates: route.routes[0].steps[i].maneuver.location.coordinates
            }
        };

        var distance = turf.distance(user, stepPoint, defaults.units);

        if (distance < lowest) {
            lowest = distance;
            step = i;
        }
    };
    return step;
};
