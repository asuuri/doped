define(
    [
        'dojo/_base/declare',
        './errors/DuplicateConnectionIdError',
        'dojo/Deferred',
        'dojo/_base/lang',
        'dojo/io-query',
        'doped/request/Iframe'
    ],
    function(declare, DuplicateConnectionIdError, Deferred, lang, ioQuery, Iframe) {
        var WATCHDOG_INTERVAL = 1500;
        return declare(null, {
            _connections: null,

            _uri: {url: null, query: {}},

            _watchdogEnabled: false,

            _setupCallbacks: function(connectionId, onReady) {
                window[this._getConnectionNodeName(connectionId)] = {
                    ready:    lang.hitch(this, onReady),
                    message: lang.hitch(this, function(data) { this._callbackHandler(connectionId, data); }),
                    watchdog: lang.hitch(this, '_resetWatchdog', [connectionId])
                };
            },

            _getConnectionNodeName: function(/*string*/ connectionId) {
                return 'comlinkNode_' + connectionId;
            },

            _callbackHandler: function(/*string*/ connectionId, /*[mixed]*/ data) {
                if (this._connections[connectionId] && typeof this._connections[connectionId].handler === 'function') {
                    this._connections[connectionId].handler.call(this, data);
                }
            },

            _resetWatchdog: function(/*string*/ connectionId) {
                if (this._connections[connectionId]) {
                    this._connections[connectionId].connectionActive = true;
                }
            },

            _setupWatchdog: function(/*string*/ connectionId) {
                return setInterval(
                    lang.hitch(
                        this,
                        function() {
                            if (this._connections[connectionId].connectionActive && this._watchdogEnabled) {
                                this._connections[connectionId].connectionActive = false;
                            } else if (this._watchdogEnabled) {
                                this._watchdogTriggered(connectionId);
                            }
                        }
                    ),
                    WATCHDOG_INTERVAL
                );
            },

            _watchdogTriggered: function(/*string*/ connectionId) {
                if (this._connections[connectionId]) {
                    this._connections[connectionId].iframe.reload();
                }
            },

            _generateUrl: function(/*string*/ connectionId) {
                var query = lang.mixin(
                    this._uri.query,
                    {
                        connectionId: connectionId,
                        connectionNode: this._getConnectionNodeName(connectionId)
                    }
                );

                return this._uri.url + '?' + ioQuery.objectToQuery(query);
            },

            constructor: function(/*string*/ uri) {
                var url;
                var query = {};
                var splitterPos = uri.indexOf("?");

                if (splitterPos > -1) {
                    query = ioQuery.queryToObject(
                        uri.substring(splitterPos + 1, uri.length)
                    );
                    url = uri.substring(0, splitterPos);
                } else {
                    url = uri;
                }

                this._uri = {
                    url: url,
                    query: query
                };

                this._connections = {};
            },

            connect: function(/*string*/ connectionId, /*function*/ handler) {
                var deferred = new Deferred();

                if (this._connections[connectionId] === undefined) {
                    this._setupCallbacks(connectionId, function() {
                        if (!deferred.isResolved()) {
                            this._watchdogEnabled = true;
                            deferred.resolve();
                        }
                    });

                    this._connections[connectionId] = {
                        startTime: Date.now(),
                        callbackNode: this._getConnectionNodeName(connectionId),
                        iframe: new Iframe(this._generateUrl(connectionId)),
                        handler: handler,
                        connectionActive: true,
                        watchdogIntervallId: this._setupWatchdog(connectionId)
                    };
                } else {
                    throw new DuplicateConnectionIdError();
                }

                return deferred;
            },

            disconnect: function(/*string*/ connectionId) {
                if (this._connections.hasOwnProperty(connectionId)) {
                    this._connections[connectionId].iframe.destroy();
                    clearInterval(this._connections[connectionId].watchdogIntervallId);

                    delete this._connections[connectionId];
                }

                return this;
            }
        });
    }
);