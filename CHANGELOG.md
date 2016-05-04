# v1.1.0

* Mapbox Directions API v5 is now required
* Adds support for `geometries=polyline`
* Changes `findNextStep` -> `getCurrentStep`

# v1.0.0

* Removes `shouldReRoute` method. It can now be found as a key on `findNextStep`.
* Added 3rd required argument to `findNextStep` which is the users current step.
* Internal logic has changed about whether the user should be rerouted. Now, the user must be within x miles of the given step, not the entire route.
* Added new key `alertUserLevel` which is an object with keys, `high` and `low`. `high` and `low` both return booleans which are false until the user should be notified about an upcoming maneuver.

# v0.2.0

* `distance` is no line distance.
* Adds `absoluteDistance` which is the users absolute distance to the end of the step.

# v0.1.0

* `maxDistance` changed to `maxReRouteDistance`.
* Added option `maxSnapToLocation`.
* `findNextStep` returns snapped location to route now on key `snapToLocation`.

# v0.0.1

* Initial release
