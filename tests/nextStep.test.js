var test = require('tape');
var route = require('./fixtures/route');

test('userToRoute should reRoute', function(t) {
    var navigation = require('../').nextStep({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.22331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0);
    t.equal(nav.shouldReRoute, true);
    t.equal(nav.step, 0);
    t.equal(nav.absoluteDistance, 5.391214204745432);
    t.equal(nav.distance, 0.09073297470143911);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.22331008911134);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var navigation = require('../').nextStep({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 0);
    t.equal(nav.absoluteDistance, 0.09237455025286956);
    t.equal(nav.distance, 0.09073297470143911);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});

test('should signal next step', function(t) {
    var navigation = require('../').nextStep({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 1);
    t.equal(nav.absoluteDistance, 0);
    t.equal(nav.distance, 0);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, true);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.121567);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.944115);
    t.end();
});

test('should not signal next step if bearing is provided and not within threshold', function(t) {
    var navigation = require('../').nextStep({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0, 90);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 0, 'step should remain zero');
    t.equal(nav.absoluteDistance, 0);
    t.equal(nav.distance, 0);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, true);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.121567);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.944115);
    t.end();
});

test('should signal next step if bearing is provided and is within threshold', function(t) {
    var navigation = require('../').nextStep({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0, 160);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 1, 'step should increment');
    t.equal(nav.absoluteDistance, 0);
    t.equal(nav.distance, 0);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, true);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.121567);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.944115);
    t.end();
});

test('userToRoute should not reRoute and uses kilometers', function(t) {
    var navigation = require('../').nextStep({ units: 'kilometers' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    var nav = navigation.findNextStep(user, route.routes[0].legs[0], 0);
    t.equal(nav.shouldReRoute, false);
    t.equal(nav.step, 0);
    t.equal(nav.absoluteDistance, 0.14866237594988327);
    t.equal(nav.distance, 0.14602051711420994);
    t.equal(nav.alertUserLevel.low, false);
    t.equal(nav.alertUserLevel.high, false);
    t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
    t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    t.end();
});
