define(
    [
        'dojo/_base/declare',
        'dojo/_base/connect',
        'dojo/dom-construct'
    ],
    function(declare, connect, domConstruct) {
        return declare(null, {
            _connections: {},

            connect: function(connectionId) {
                if (this._connections[connectionId] === undefined) {
                    this._connections = {
                        startTime: Date.now(),
                        iframe: null
                    };
                } else {
                    throw 'Connection with id "' + connectionId + '" already exists.';
                }
            },
            onMessage: function(messageId, data) {}
        });
    }
);