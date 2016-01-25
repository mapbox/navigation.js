# navigation.js

-   Demo: [mapbox.github.io/navigation.js/tests/debug](http://mapbox.github.io/navigation.js/tests/debug/#14/39.9432/-75.1433)
-   Test: `npm test`

Example:

```js
var navigation = require('navigation.js')({
    units: 'miles',
    maxDistance: 0.1
});

navigation.shouldReRoute(userLocation, mapboxDirectionRoute); //true
```

## API Usage

### findNextStep

Given a user location and route, calculates closest step to user

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from Mapbox directions API
-   `user`  
-   `route`  

Returns **object** Containing `step` and `distance` to next step

### Options

Configuration options

**Parameters**

-   `object`  `units` - either `miles` or `km`. `maxDistance` - max distance the user can be from the route

### shouldReRoute

Given a user location and route, calculates whether re-routing should occur

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from Mapbox directions API
-   `user`  
-   `route`  

Returns **boolean** 
