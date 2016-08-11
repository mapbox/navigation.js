var test = require('tape');
var routes = [require('./fixtures/route'), require('./fixtures/routepolyline')];

test('userToRoute should reRoute', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.22331008911133, 39.94409450436698]}};
    routes.forEach(function(route) {
        var nav = navigation.getCurrentStep(user, route.routes[0].legs[0], 0);
        t.equal(nav.shouldReRoute, true);
        t.equal(nav.step, 0);
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 5.39);
        t.equal(Math.round(nav.distance * 100) / 100, 0.09);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, false);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.22331008911134);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    });
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    routes.forEach(function(route) {
        var nav = navigation.getCurrentStep(user, route.routes[0].legs[0], 0);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 0);
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0.09);
        t.equal(Math.round(nav.distance * 100) / 100, 0.09);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, false);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    });
    t.end();
});

test('should signal next step', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var user2 = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12160688638687, 39.94387241576697]}}; // next point along route
    routes.forEach(function(route) {
        navigation.getCurrentStep(user, route.routes[0].legs[0], 0);
        var nav = navigation.getCurrentStep(user2, route.routes[0].legs[0], 0);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 1);
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0.02);
        t.equal(Math.round(nav.distance * 100) / 100, 0);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, true);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12160688638687);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94387241576697);
    });
    t.end();
});

test('should signal next step if bearing is provided and not within threshold but the user exits maneuver zone', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var user2 = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12160688638687, 39.94387241576697]}}; // next point along route
    routes.forEach(function(route) {
        navigation.getCurrentStep(user, route.routes[0].legs[0], 0, 0);
        var nav = navigation.getCurrentStep(user2, route.routes[0].legs[0], 0, 0);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 1, 'step should remain zero');
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0.02);
        t.equal(Math.round(nav.distance * 100) / 100, 0);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, true);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12160688638687);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94387241576697);
    });
    t.end();
});

test('should signal next step if bearing is provided and within threshold but the user does not exits maneuver zone', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    var user2 = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12157469987869, 39.94403898228457]}}; // next point along route
    routes.forEach(function(route) {
        navigation.getCurrentStep(user, route.routes[0].legs[0], 0, 0);
        var nav = navigation.getCurrentStep(user2, route.routes[0].legs[0], 0, 175);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 1, 'step should remain zero');
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0.01);
        t.equal(Math.round(nav.distance * 100) / 100, 0);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, true);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12157469987869);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94403898228457);
    });
    t.end();
});
//
test('should signal next step if bearing is provided and is within threshold', function(t) {
    var navigation = require('../')({ units: 'miles' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.121567, 39.944115]}};
    routes.forEach(function(route) {
        var nav = navigation.getCurrentStep(user, route.routes[0].legs[0], 0, 160);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 1, 'step should increment');
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0);
        t.equal(Math.round(nav.distance * 100) / 100, 0);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, true);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.121567);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.944115);
    });
    t.end();
});

test('userToRoute should not reRoute and uses kilometers', function(t) {
    var navigation = require('../')({ units: 'kilometers' });
    var user = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-75.12331008911133, 39.94409450436698]}};
    routes.forEach(function(route) {
        var nav = navigation.getCurrentStep(user, route.routes[0].legs[0], 0);
        t.equal(nav.shouldReRoute, false);
        t.equal(nav.step, 0);
        t.equal(Math.round(nav.absoluteDistance * 100) / 100, 0.15);
        t.equal(Math.round(nav.distance * 100) / 100, 0.15);
        t.equal(nav.alertUserLevel.low, false);
        t.equal(nav.alertUserLevel.high, false);
        t.equal(nav.snapToLocation.geometry.coordinates[0], -75.12331008911133);
        t.equal(nav.snapToLocation.geometry.coordinates[1], 39.94409450436698);
    });
    t.end();
});
