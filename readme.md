# navigation.js

-   Demo: [mapbox.github.io/navigation.js/tests/debug](http://mapbox.github.io/navigation.js/tests/debug/#14/39.9432/-75.1433)
-   Install: `npm install navigation.js --save`
-   Test: `npm test`

Example:

```js
var navigation = require('navigation.js')({
    units: 'miles',
    maxReRouteDistance: 0.03,
    maxSnapToLocation: 0.01
});

// Given a users location, are they within 0.1 miles of any point on the route?
navigation.shouldReRoute(userLocation, mapboxDirectionRoute); //true

// Where is the user along the route?
navigation.findNextStep(userLocation, mapboxDirectionRoute); // {distance: 0.5, step: 4}
```

## API Usage

### findNextStep

Given a user location and route, calculates closest step to user.

**Parameters**

-   `user` **object** point feature representing user location. Must be a valid GeoJSON object.
-   `route` **object** from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
    The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.

Returns **object** Containing 3 keys: `step`, `distance`, `snapToLocation`. `distance` is distance to end of step, `snapToLocation` is location along route which is closest to the user.

### options

Configuration options

**Parameters**

-   `object`  `units` - either `miles` or `km`. `maxReRouteDistance` - max distance the user can be from the route. `maxSnapToLocation` - max distance to snap user to route.

### shouldReRoute

Given a user location and route, calculates whether re-routing should occur.

**Parameters**

-   `user` **object** point feature representing user location. Must be a valid GeoJSON object.
-   `route` **object** from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
    The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `shouldReRoute` expects of these routes, either the first or second.

Returns **boolean** should user be re-routed.
