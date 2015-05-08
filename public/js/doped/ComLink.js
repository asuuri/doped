define(
    [
        'dojo/_base/declare',
        './errors/DuplicateConnectionIdError',
        'dojo/_base/lang',
        'dojo/io-query',
        'doped/request/Iframe'
    ],
    function(declare, DuplicateConnectionIdError, lang, ioQuery, Iframe) {
        var WATCHDOG_INTERVAL = 1500;
        return declare(null, {
            _connections: null,

            _uri: {url: null, query: {}},

            _callbackHandler: function(/*string*/ connectionId, /*[mixed]*/ data) {
                if (this._connections[connectionId] && typeof this._connections[connectionId].handler === 'function') {
                    this._connections[connectionId].handler.call(this, data);
                }
            },

            _getCallbackName: function(/*string*/ connectionId) {
                return 'comlink_' + connectionId;
            },

            _setupCallback: function(/*string*/ connectionId) {
                var callbackName = this._getCallbackName();
                var callback = lang.hitch(this, function(data) {
                    this._callbackHandler(connectionId, data);
                });

                window[callbackName] = callback;

                return callbackName;
            },

            _resetWatchdog: function(/*string*/ connectionId) {
                console.log('wd reset: ' + connectionId);
                if (this._connections[connectionId]) {
                    this._connections[connectionId].connectionActive = true;
                }
            },

            _getWatchdogCallbackName: function(/*string*/ connectionId) {
                return 'comlinkWd_' + connectionId;
            },

            _setupWatchdog: function(/*string*/ connectionId) {
                window[this._getWatchdogCallbackName(connectionId)] = lang.hitch(
                    this,
                    '_resetWatchdog',
                    [connectionId]
                );

                return setInterval(
                    lang.hitch(
                        this,
                        function() {
                            if (this._connections[connectionId].connectionActive) {
                                this._connections[connectionId].connectionActive = false;
                            } else {
                                this._watchdogTriggered(connectionId);
                            }
                        }
                    ),
                    WATCHDOG_INTERVAL
                );
            },

            _watchdogTriggered: function(/*string*/ connectionId) {
                console.log('watchdogTriggered for connection: ' + connectionId);
                this._connections[connectionId].iframe.reload();
            },

            _generateUrl: function(/*string*/ callbackName, /*string*/ connectionId) {
                var query = lang.mixin(
                    this._uri.query,
                    {
                        callback: callbackName,
                        watchdog: this._getWatchdogCallbackName(connectionId),
                        connectionId: connectionId,
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
                var callbackName;

                if (this._connections[connectionId] === undefined) {
                    callbackName = this._setupCallback(connectionId);

                    this._connections[connectionId] = {
                        startTime: Date.now(),
                        callbackName: callbackName,
                        iframe: new Iframe(this._generateUrl(callbackName, connectionId)),
                        handler: handler,
                        connectionActive: true,
                        watchdogIntervallId: this._setupWatchdog(connectionId)
                    };
                } else {
                    throw new DuplicateConnectionIdError();
                }

                return this;
            },

            disconnect: function(/*string*/ connectionId) {
                if (this._connections.hasOwnProperty(connectionId)) {
                    this._connections[connectionId].iframe.destroy();
                    delete window[this._getCallbackName(connectionId)];
                    clearInterval(this._connections[connectionId].watchdogIntervallId);

                    delete this._connections[connectionId]
                }

                return this;
            }
        });
    }
);