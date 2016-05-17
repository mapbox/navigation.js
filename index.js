var turfPointOnLine = require('turf-point-on-line');
var turfDistance = require('turf-distance');
var turfLineDistance = require('turf-line-distance');
var turfLineSlice = require('turf-line-slice');
var polyline = require('polyline');

var feetToMiles = 0.000189394;
var metersToMiles = 0.000621371;
var feetToKilometers = 0.0003048;
var metersToKilometers = 1000;
var metersToFeet = 3.28084;

module.exports = function(opts) {
    /**
    * Configuration options
    * @param {object} `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route. `completionDistance` - distance away from end of step that is considered a completion. If this distance is shorter than the step distance, it will be changed to 10ft. `warnUserTime` - number of seconds ahead of maneuver to warn user about maneuver. `shortCompletionDistance` - if the step is shorter than the `completionDistance`, this distance will be used to calculate if the step has been completed. `userBearingCompleteThreshold` - Bearing threshold for the user to complete a step
    */
    var options = {
        units: opts.units || 'miles',
        warnUserTime: opts.warnUserTime || 30, // seconds
        userBearingCompleteThreshold: opts.userBearingCompleteThreshold || 30
    };

    options.maxReRouteDistance = opts.maxReRouteDistance ? opts.maxReRouteDistance : opts.units === 'miles' ? 150 * feetToMiles : 150 * feetToKilometers;
    options.maxSnapToLocation = opts.maxSnapToLocation ? opts.maxSnapToLocation : opts.units === 'miles' ? 50 * feetToMiles : 50 * feetToKilometers;
    options.completionDistance = opts.completionDistance ? opts.completionDistance : opts.units === 'miles' ? 50 * feetToMiles : 50 * feetToKilometers;
    options.shortCompletionDistance = opts.shortCompletionDistance ? opts.shortCompletionDistance : opts.units === 'miles' ? 10 * feetToMiles : 10 * feetToKilometers;

    /**
     * Given a user location and route, calculates closest step to user.
     * @param {object} user point feature representing user location. Must be a valid GeoJSON object.
     * @param {object} route from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
     * The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `getCurrentStep` expects of these routes, either the first or second.
     * @param {number} userCurrentStep along the route
     * @param {number} userBearing current user bearing. If provided, the user must be within a certain threadhold of the steps exit bearing to successful complete a step.
     * @returns {object} Containing 3 keys: `step`, `distance`, `snapToLocation`. `distance` is the line distance to end of step, `absoluteDistance` is the users absolute distance to the end of the route `snapToLocation` is location along route which is closest to the user.
     */
    function getCurrentStep(user, route, userCurrentStep, userBearing) {
        var currentStep = {};
        var stepCoordinates;
        if (typeof route.steps[userCurrentStep].geometry === 'string') {
            stepCoordinates = polyline
                .decode(route.steps[userCurrentStep].geometry)
                .map(function(coordinate) {
                    return [coordinate[1], coordinate[0]];
                });
        } else {
            stepCoordinates = route.steps[userCurrentStep].geometry.coordinates;
        }
        var segmentRoute = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: stepCoordinates
            }
        };

        var closestPoint = turfPointOnLine(segmentRoute, user);
        var distance = turfDistance(user, closestPoint, options.units);

        var segmentEndPoint = { type: 'Feature', geometry: { type: 'Point', coordinates: stepCoordinates[stepCoordinates.length - 1] }};
        var segmentSlicedToUser = turfLineSlice(user, segmentEndPoint, segmentRoute);
        var userDistanceToEndStep = turfLineDistance(segmentSlicedToUser, options.units);

        //
        // Check if user has completed step. Two factors:
        //   1. Are they within a certain threshold of the end of the step?
        //   2. If a bearing is provided, is their bearing within a current threshold of the exit bearing for the step
        //
        var stepDistance = options.units === 'miles' ? route.steps[userCurrentStep].distance * metersToMiles : route.steps[userCurrentStep].distance * metersToKilometers;
        // If the step distance is less than options.completionDistance, modify it and make it 10 ft
        var modifiedCompletionDistance = stepDistance < options.completionDistance ? options.shortCompletionDistance : options.completionDistance;
        // Check if users bearing is within threshold of the steps exit bearing
        var withinBearingThreshold = userBearing ? Math.abs(userBearing - route.steps[userCurrentStep].maneuver.bearing_after) <= options.userBearingCompleteThreshold ? true : false : true;

        // Do not increment userCurrentStep if the user is approaching the final step
        if (userCurrentStep < route.steps.length - 2) {
            currentStep.step = withinBearingThreshold && (userDistanceToEndStep < modifiedCompletionDistance) ? userCurrentStep + 1 : userCurrentStep; // Don't set next step + 1 if at the end of the route
        } else {
            currentStep.step = userCurrentStep;
        }

        currentStep.distance = userDistanceToEndStep;
        currentStep.stepDistance = stepDistance;
        currentStep.shouldReRoute = turfDistance(user, closestPoint, options.units) > options.maxReRouteDistance ? true : false;
        currentStep.absoluteDistance = turfDistance(user, segmentEndPoint, options.units);
        currentStep.snapToLocation = distance < opts.maxSnapToLocation ? closestPoint : user;

        // Alert levels
        currentStep.alertUserLevel = {
            low: userDistanceToEndStep < 1 && route.steps[userCurrentStep].distance * metersToMiles > 1, // Step must be longer than 1 miles
            high: (userDistanceToEndStep < 150 * feetToMiles) && route.steps[userCurrentStep].distance * metersToFeet > 150 // Step must be longer than 150 ft
        };
        return currentStep;
    };

    return {
        getCurrentStep: getCurrentStep
    };
};
