var turfPointOnLine = require('turf-point-on-line');
var turfDistance = require('turf-distance');
var turfLineDistance = require('turf-line-distance');
var turfLineSlice = require('turf-line-slice');
module.exports = function(opts) {
    /**
    * Configuration options
    * @param {object} `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route.
    */
    var options = {
        units: opts.units || 'miles',
        maxReRouteDistance: opts.maxReRouteDistance || 0.03,
        maxSnapToLocation: opts.maxSnapToLocation || 0.01
    };

    /**
     * Given a user location and route, calculates whether re-routing should occur.
     * @param {object} user point feature representing user location. Must be a valid GeoJSON object.
     * @param {object} route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `shouldReRoute` expects of these routes, either the first or second.
     * @returns {boolean} should user be re-routed.
     */
    function shouldReRoute(user, route) {
        var r = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
        };
        var closestPoint = turfPointOnLine(r, user);
        return turfDistance(user, closestPoint, options.units) > options.maxReRouteDistance ? true : false;
    };

    /**
     * Given a user location and route, calculates closest step to user.
     * @param {object} user point feature representing user location. Must be a valid GeoJSON object.
     * @param {object} route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.
     * @returns {object} Containing 3 keys: `step`, `distance`, `snapToLocation`. `distance` is the line distance to end of step, `absoluteDistance` is the users absolute distance to the end of the route `snapToLocation` is location along route which is closest to the user.
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
                    var closestPoint = turfPointOnLine(segmentRoute, user);
                    var distance = turfDistance(user, closestPoint, options.units);
                    if (distance < currentMax) {

                        currentMax = distance;

                        var segmentEndPoint = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: slicedSegment[slicedSegment.length - 1] }};
                        var segmentSlicedToUser = turfLineSlice(user, segmentEndPoint, segmentRoute);

                        currentStep.distance = turfLineDistance(segmentSlicedToUser, options.units);
                        currentStep.absoluteDistance = turfDistance(user, segmentEndPoint, options.units);
                        currentStep.step = i;
                        currentStep.snapToLocation = distance < opts.maxSnapToLocation ? closestPoint : user;
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

    return {
        shouldReRoute: shouldReRoute,
        findNextStep: findNextStep
    };
};
