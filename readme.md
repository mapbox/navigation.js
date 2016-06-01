# navigation.js

-   Demo: [mapbox.github.io/navigation.js/tests/debug](http://mapbox.github.io/navigation.js/tests/debug/#14/39.9432/-75.1433)
-   Install: `npm install navigation.js --save`
-   Test: `npm test`
-   Run debug map locally: `npm start`. Then head to `http://localhost:9966`

Example:

```js
var navigation = require('navigation.js')({
    units: 'miles',
    maxReRouteDistance: 0.03,
    maxSnapToLocation: 0.01
});


// Where is the user along the route?
navigation.findNextStep(userLocation, mapboxDirectionRoute.routes[0], 1);
```

## API Usage

### findNextStep

Given a user location and route, calculates closest step to user.

**Parameters**

-   `user` **object** point feature representing user location. Must be a valid GeoJSON object.
-   `route` **object** from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
    The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.
-   `userCurrentStep` **number** along the route

Returns **object** Containing 3 keys: `step`, `distance`, `snapToLocation`. `distance` is the line distance to end of step, `absoluteDistance` is the users absolute distance to the end of the route `snapToLocation` is location along route which is closest to the user.

### options

Configuration options

**Parameters**

-   `object`  `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route. `completionDistance` - distance away from end of step that is considered a completion. If this distance is shorter than the step distance, it will be changed to 10ft. `warnUserTime` - number of seconds ahead of maneuver to warn user about maneuver. `shortCompletionDistance` - if the step is shorter than the `completionDistance`, this distance will be used to calculate if the step has been completed.


### Specification

For more information on how decisions are made in the library, see [the specification](/SPEC.md).
