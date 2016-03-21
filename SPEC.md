# Navigation.js specification

## Purpose
The goal of this specification is to outline the rules and ideas this library adheres to guide a user along a route.

### Units
By default, the metric system should be used where available.

### Concepts
Navigation.js looks at a single step along a greater route. All calculations are done against this step and not against the whole route. Once a step is completed, the next step on the route can be compared. If the user is no longer on the current step, the developer should re-route the user and also set their internal step counter back to 0.

### Re-routing
If at any time the user is not within `45 meters` of any point on the current step, re-route the user.

### Completing a step
* If the user is within 15 meters of the end of the step, the user has completed the current step.
* If the bearing for the user is available, the above point must be true and also the users bearing must be within `20 degrees` of the exit bearing of the step.

### Alerting the user
There are 2 types of alerts and both are of type `boolean`. These alerts are given distance along the current step based and by default are `false`.

Navigation.js has an `alertUserLevel` object with two keys on it:
* `low`
* `high`

#### When to alert
* A `low` alert is `true` when the user is within `1.5km` of the end of the route and the step length is greater than 1.5km.
* A `high` alert is `true` when the user is within `45m` of the end of the route and the step length is greater than 45km.
