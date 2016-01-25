# navigation.js

-   Demo: [mapbox.github.io/navigation.js/tests/debug](http://mapbox.github.io/navigation.js/tests/debug/#14/39.9432/-75.1433)
-   Test: `npm test`

Example:

```js
var navigation = require('navigation.js')({
    units: 'miles',
    maxDistance: 0.1
});

// Given a users location, are they within 0.1 miles of any point on the route?
navigation.shouldReRoute(userLocation, mapboxDirectionRoute); //true

// Where is the user along the route?
navigation.findNextStep(userLocation, mapboxDirectionRoute); // {distance: 0.5, step: 4}
```

## API Usage

### findNextStep

Given a user location and route, calculates closest step to user

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
    The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `findNextStep` expects of these routes, either the first or second.

Returns **object** Containing `step` and `distance` to next step in unites provide in options object

### options

Configuration options

**Parameters**

-   `object`  `units` - either `miles` or `km`. `maxDistance` - max distance the user can be from the route

### shouldReRoute

Given a user location and route, calculates whether re-routing should occur

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from [Mapbox directions API](https://www.mapbox.com/developers/api/directions/).
    The Mapbox directions API returns an object with up to 2 `routes` on the `route` key. `shouldReRoute` expects of these routes, either the first or second.

Returns **boolean** should user be re-routed
