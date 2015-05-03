define(
    [
        'dojo/_base/declare',
        './errors/DuplicateConnectionIdError',
        'dojo/_base/connect',
        'dojo/dom-construct'
    ],
    function(declare, DuplicateConnectionIdError, connect, domConstruct) {
        return declare(null, {
            _connections: {},

            connect: function(connectionId) {
                if (this._connections[connectionId] === undefined) {
                    this._connections[connectionId] = {
                        startTime: Date.now(),
                        iframe: null
                    };
                } else {
                    throw new DuplicateConnectionIdError();
                }
            },
            
            unconnect: function(connectionId) {
                if (this._connections.hasOwnProperty(connectionId)) {
                    this.unbind(connectionId);
                    domConstruct.destroy(
                        this._connections[connectionId].iframe
                    );
                    
                }
            },
            
            unbind: function(connectionId, callback) {},
            
            bind: function(connectionId, callback) {}
        });
    }
);