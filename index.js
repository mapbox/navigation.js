var turfPointOnLine = require('turf-point-on-line');
var turfDistance = require('turf-distance');
var turfLineDistance = require('turf-line-distance');
var turfLineSlice = require('turf-line-slice');
var polyline = require('polyline');

var feetToMiles = 0.000189394;
var feetToKilometers = 0.0003048;
var metersToFeet = 3.28084;
var userHasEnteredManeuverZone = false;

module.exports = function(opts) {
    /**
    * Configuration options
    * @param {object} `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route. `completionDistance` - distance away from end of step that is considered a completion. If this distance is shorter than the step distance, it will be changed to 10ft. `warnUserTime` - number of seconds ahead of maneuver to warn user about maneuver. `shortCompletionDistance` - if the step is shorter than the `completionDistance`, this distance will be used to calculate if the step has been completed. `userBearingCompleteThreshold` - Bearing threshold for the user to complete a step
    */
    var options = {
        units: opts.units || 'miles',
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
        var userAbsoluteDistance = turfDistance(user, segmentEndPoint, options.units);

        //
        // Check if user has completed step. Two factors:
        //   1. Are they within a certain threshold of the end of the step?
        //   2. If a bearing is provided, is their bearing within a current threshold of the exit bearing for the step
        //
        var stepDistance = turfLineDistance(segmentRoute, options.units);
        // If the step distance is less than options.completionDistance, modify it and make it 10 ft
        var modifiedCompletionDistance = stepDistance < options.completionDistance
            ? options.shortCompletionDistance : options.completionDistance;
        // Check if users bearing is within threshold of the steps exit bearing
        var withinBearingThreshold = userBearing ? Math.abs(userBearing - route.steps[userCurrentStep + 1].maneuver.bearing_after) <= options.userBearingCompleteThreshold ? true : false : false;

        currentStep.snapToLocation = distance < opts.maxSnapToLocation ? closestPoint : user;
        // Do not increment userCurrentStep if the user is approaching the final step
        if (userCurrentStep < route.steps.length - 2) {
            if (userDistanceToEndStep < modifiedCompletionDistance) {
                userHasEnteredManeuverZone = true;
                currentStep.snapToLocation = user;
            } else {
                userHasEnteredManeuverZone = false;
            }

            // Use the users absolute distance from the end of the maneuver point
            // Otherwise, as they move away from the maneuver point,
            // the distance will remain 0 since we're snapping to the closest point on the line
            if (userHasEnteredManeuverZone && (userAbsoluteDistance > modifiedCompletionDistance || withinBearingThreshold)) {
                currentStep.step = userCurrentStep + 1;
            } else {
                currentStep.step = userCurrentStep;
                userHasEnteredManeuverZone = false;
            }
        } else {
            currentStep.step = userCurrentStep;
            userHasEnteredManeuverZone = false;
        }

        currentStep.distance = userDistanceToEndStep;
        currentStep.stepDistance = stepDistance;
        currentStep.absoluteDistance = userAbsoluteDistance;
        currentStep.shouldReRoute = turfDistance(user, closestPoint, options.units) > options.maxReRouteDistance ? true : false;

        // Alert levels
        currentStep.alertUserLevel = {
            low: (userDistanceToEndStep < 52800 * feetToMiles) && route.steps[userCurrentStep].distance * metersToFeet > 52800, // Step must be longer than 10 miles,
            medium: (userDistanceToEndStep < 1000 * feetToMiles) && route.steps[userCurrentStep].distance * metersToFeet > 1000, // Step must be longer than 1000 ft,
            high: (userDistanceToEndStep < 300 * feetToMiles) && route.steps[userCurrentStep].distance * metersToFeet > 300 // Step must be longer than 300 ft
        };
        return currentStep;
    };

    return {
        getCurrentStep: getCurrentStep
    };
};
