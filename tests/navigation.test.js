var test = require('tape');
var route = require('./fixtures/route');
var navigation = require('../')({
    units: 'miles',
    maxReRouteDistance: 0.1,
    maxSnapToLocation: 0.1
});

var user = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Point',
        coordinates: [-122.40658342838287, 37.79485564380556]
    }
};

test('userToRoute should reRoute', function(t) {
    var reRoute = navigation.shouldReRoute(user, route.routes[0]);
    t.equal('boolean', typeof reRoute, 'is boolean');
    t.equal(reRoute, true, 'Should reRoute');
    t.end();
});

test('userToRoute should not reRoute', function(t) {
    var closeUser = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Point',
            coordinates: [-75.17943572998047, 39.92940139770508]
        }
    };
    var reRoute = navigation.shouldReRoute(closeUser, route.routes[0]);
    t.equal(typeof reRoute, 'boolean', 'is boolean');
    t.equal(reRoute, false, 'Should not reRoute');
    t.end();
});

test('findNextStep', function(t) {
    var step = navigation.findNextStep(user, route.routes[0]);
    t.equal(typeof step.distance, 'number');
    t.equal(step.distance, 0);
    t.equal(step.absoluteDistance, 2516.0350162705317);
    t.equal(typeof step.snapToLocation, 'object');
    t.equal(step.snapToLocation.type, 'Feature');
    t.equal(step.snapToLocation.geometry.type, 'Point');
    t.equal(step.snapToLocation.geometry.coordinates[0], -122.40658342838287);
    t.equal(step.snapToLocation.geometry.coordinates[1], 37.79485564380556);
    t.equal(step.step, 1);
    t.end();
});
