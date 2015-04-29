define(
    ['dojo/_base/declare', 'dojo/_base/connect'],
    function(declare, connect) {
        return declare(null, {
            _connections: {},
            connect: function(connectionId) {},
            onMessage: function(messageId, data) {}
        });
    }
);