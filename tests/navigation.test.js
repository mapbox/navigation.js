var test = require('tape');
var route = require('./fixtures/route');

test('userToRoute should reRoute', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.22331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0], 1);
    t.equal(nav.shouldReRoute, true);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 5.517062900554218);
    t.equal(nav.distance, 0.21639212002898428);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.22331008911134);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0], 1);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 0.2182122283610921);
    t.equal(nav.distance, 0.21639212002898428);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});

test('userToRoute should not reRoute and uses kilometers', function(t) {
    var navigation = require('../')({ units: 'kilometers' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0], 1);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 0.3511784170063737);
    t.equal(nav.distance, 0.34824923761230214);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});
