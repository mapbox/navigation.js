var turfPointOnLine = require('turf-point-on-line');
var turfDistance = require('turf-distance');

module.exports = function(opts) {
    /**
    * Configuration options
    * @param {object} `units` - either `miles` or `km`. `maxDistance` - max distance the user can be from the route
    */
    var options = {
        units: opts.units || 'miles',
        maxDistance: opts.maxDistance || 0.1
    };

    /**
     * Given a user location and route, calculates whether re-routing should occur
     * @param {object} GeoJSON point feature representing user location
     * @param {object} Route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `shouldReRoute` expects of these routes, either the first or second.
     * @returns {boolean} should user be re-routed
     */
    function shouldReRoute(user, route) {
        var r = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
        };
        var closestPoint = turfPointOnLine(r, user);
        return turfDistance(user, closestPoint, options.units) > options.maxDistance ? true : false;
    };

    /**
     * Given a user location and route, calculates closest step to user
     * @param {object} GeoJSON point feature representing user location
     * @param {object} Route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.
     * @returns {object} Containing `step` and `distance` to next step in unites provide in options object
     */
    function findNextStep(user, route) {
        var previousSlice = 0;
        var currentMax = Infinity;
        var currentStep = {};
        var routeCoordinates = route.geometry.coordinates;
        var stepCoordinates = route.steps;

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
                    var distance = turfDistance(user, turfPointOnLine(segmentRoute, user), options.units);
                    if (distance < currentMax) {
                        currentMax = distance;
                        currentStep.step = i;
                    }
                }
            }
        }
        var r = {
            type: 'Feature',
            properties: {},
            geometry: route.steps[currentStep.step].maneuver.location
        };
        currentStep.distance = turfDistance(user, r, options.units);
        return currentStep;
    };

    function arraysEqual(array1, array2) {
        if (array1.length !== array2.length) return false;
        for (var i = array1.length; i--;) {
            if (array1[i] !== array2[i]) return false;
        }
        return true;
    }

    return {
        shouldReRoute: shouldReRoute,
        findNextStep: findNextStep
    };
};
