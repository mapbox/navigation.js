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

test('findNextStep - should not alert', function(t) {
    var userTwo = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [-75.16444444656372, 39.94649630539111]
        }
    };
    var step = navigation.findNextStep(userTwo, route.routes[0]);
    t.equal(step.alertUser, false);
    t.equal(typeof step.distance, 'number');
    t.equal(typeof step.snapToLocation, 'object');
    t.equal(step.snapToLocation.type, 'Feature');
    t.equal(step.snapToLocation.geometry.type, 'Point');
    t.equal(step.snapToLocation.geometry.coordinates[0], -75.16480297931626);
    t.equal(step.snapToLocation.geometry.coordinates[1], 39.94650897049405);
    t.equal(step.step, 6);
    t.end();
});

test('findNextStep - should alert', function(t) {
    var userTwo = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [-75.16403675079346, 39.950131747894396]
        }
    };
    var step = navigation.findNextStep(userTwo, route.routes[0]);
    t.equal(step.alertUser, true);
    t.equal(typeof step.distance, 'number');
    t.equal(typeof step.snapToLocation, 'object');
    t.equal(step.snapToLocation.type, 'Feature');
    t.equal(step.snapToLocation.geometry.type, 'Point');
    t.equal(step.snapToLocation.geometry.coordinates[0], -75.16401678807557);
    t.equal(step.snapToLocation.geometry.coordinates[1], 39.95012748637537);
    t.equal(step.step, 6);
    t.end();
});
