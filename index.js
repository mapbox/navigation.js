var turfPointOnLine = require('turf-point-on-line');
var turfDistance = require('turf-distance');
var turfLineDistance = require('turf-line-distance');
var turfLineSlice = require('turf-line-slice');
var feetToMiles = 0.000189394;
var metersToMiles = 0.000621371;
var feetToKilometers = 0.0003048;
var metersToKilometers = 1000;
var metersToFeet = 3.28084;

module.exports = function(opts) {
    /**
    * Configuration options
    * @param {object} `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route. `completionDistance` - distance away from end of step that is considered a completion. If this distance is shorter than the step distance, it will be changed to 10ft. `warnUserTime` - number of seconds ahead of maneuver to warn user about maneuver. `shortCompletionDistance` - if the step is shorter than the `completionDistance`, this distance will be used to calculate if the step has been completed.
    */
    var options = {
        units: opts.units || 'miles',
        warnUserTime: opts.warnUserTime || 30 // seconds
    };

    options.maxReRouteDistance = opts.maxReRouteDistance ? opts.maxReRouteDistance : opts.units === 'miles' ? 150 * feetToMiles : 150 * feetToKilometers;
    options.maxSnapToLocation = opts.maxSnapToLocation ? opts.maxSnapToLocation : opts.units === 'miles' ? 50 * feetToMiles : 50 * feetToKilometers;
    options.completionDistance = opts.completionDistance ? opts.completionDistance : opts.units === 'miles' ? 50 * feetToMiles : 50 * feetToKilometers;
    options.shortCompletionDistance = opts.shortCompletionDistance ? opts.shortCompletionDistance : opts.units === 'miles' ? 10 * feetToMiles : 10 * feetToKilometers;

    /**
     * Given a user location and route, calculates closest step to user.
     * @param {object} user point feature representing user location. Must be a valid GeoJSON object.
     * @param {object} route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.
     * @param {number} userCurrentStep along the route
     * @returns {object} Containing 3 keys: `step`, `distance`, `snapToLocation`. `distance` is the line distance to end of step, `absoluteDistance` is the users absolute distance to the end of the route `snapToLocation` is location along route which is closest to the user.
     */
    function findNextStep(user, route, userCurrentStep) {
        var previousSlice = 0;
        var currentMax = Infinity;
        var currentStep = {};
        var routeCoordinates = route.geometry.coordinates;
        var stepCoordinates = route.steps;

        for (var p = 0; p < routeCoordinates.length; p++) {
            for (var i = userCurrentStep; i <= userCurrentStep; i++) {
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
                        var userDistanceToEndStep = turfLineDistance(segmentSlicedToUser, options.units);

                        var stepDistance = options.units === 'miles' ? stepCoordinates[i - 1].distance * metersToMiles : stepCoordinates[i].distance * metersToKilometers;
                        // If the step distance is less than options.completionDistance, modify it and make it 10 ft
                        var modeifiedCompletionDistance = stepDistance < options.completionDistance ? options.shortCompletionDistance : options.completionDistance;
                        currentStep.step = userDistanceToEndStep < modeifiedCompletionDistance && i < stepCoordinates.length - 1 ? userCurrentStep + 1 : userCurrentStep; // Don't set next step + 1 if at the end of the route

                        currentStep.distance = userDistanceToEndStep;
                        currentStep.shouldReRoute = turfDistance(user, closestPoint, options.units) > options.maxReRouteDistance ? true : false;
                        currentStep.absoluteDistance = turfDistance(user, segmentEndPoint, options.units);
                        currentStep.snapToLocation = distance < opts.maxSnapToLocation ? closestPoint : user;

                        currentStep.alertUserLevel = {
                            low: userDistanceToEndStep < 2 && stepCoordinates[i - 1].distance * metersToMiles > 1, // Step must be longer than 1 miles
                            high: (userDistanceToEndStep < 150 * feetToMiles) && stepCoordinates[i - 1].distance * metersToFeet > 150 // Step must be longer than 150 ft
                        };
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
        findNextStep: findNextStep
    };
};
