# navigation.js

Install
```
npm install navigation.js
```

Test
```
npm test
```

## API Usage

### findClosestStepToUser

Given a user location and route, calculates closest step to user

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from Mapbox directions API
-   `user`  
-   `route`  

Returns **number** Step

### shouldReRoute

Given a user location and route, calculates whether re-routing should occur

**Parameters**

-   `GeoJSON` **object** point feature representing user location
-   `Route` **object** from Mapbox directions API
-   `user`  
-   `route`  

Returns **boolean**
