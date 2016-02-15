var test = require('tape');
var route = require('./fixtures/route');
var navigation = require('../')({
    units: 'miles',
    maxReRouteDistance: 0.1,
    maxSnapToLocation: 0.1
});

test('userToRoute should reRoute', function(t) {
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.22331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0], 1);
    t.equal(nav.shouldReRoute, true);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 5.517062900554218);
    t.equal(nav.distance, 0.21639212002898428);
    t.equal(nav.alertUser, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.22331008911134);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0], 1);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 0.2182122283610921);
    t.equal(nav.distance, 0.21639212002898428);
    t.equal(nav.alertUser, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12327);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.944218);
    t.end();
});
