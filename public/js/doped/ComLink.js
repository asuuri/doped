define(
    [
        'dojo/_base/declare',
        './errors/DuplicateConnectionIdError',
        'dojo/_base/lang',
        'dojo/io-query',
        'doped/request/Iframe'
    ],
    function(declare, DuplicateConnectionIdError, lang, ioQuery, Iframe) {
        return declare(null, {
            _connections: null,

            _uri: {url: null, query: {}},

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

            _callbackHandler: function(/*string*/ connectionId, /*[mixed]*/ data) {
                if (this._connections[connectionId] && typeof this._connections[connectionId].handler === 'function') {
                    this._connections[connectionId].handler.call(this, data);
                }
            },

            _setupCallback: function(/*string*/ connectionId) {
                var callbackName = 'comLink' + Date.now();
                var callback = lang.hitch(this, function(data) {
                    this._callbackHandler(connectionId, data);
                });

                window[callbackName] = callback;

                return callbackName;
            },

            _generateUrl: function(/*string*/ callbackName, /*string*/ connectionId) {
                var query = lang.mixin(
                    this._uri.query,
                    {
                        callback: callbackName,
                        connectionId: connectionId
                    }
                );

                return this._uri.url + '?' + ioQuery.objectToQuery(query);
            },

            connect: function(/*string*/ connectionId, /*function*/ handler) {
                var callbackName;

                if (this._connections[connectionId] === undefined) {
                    callbackName = this._setupCallback(connectionId);

                    this._connections[connectionId] = {
                        startTime: Date.now(),
                        callbackName: callbackName,
                        iframe: new Iframe(this._generateUrl(callbackName, connectionId)),
                        handler: handler
                    };
                } else {
                    throw new DuplicateConnectionIdError();
                }

                return this;
            },

            disconnect: function(/*string*/ connectionId) {
                if (this._connections.hasOwnProperty(connectionId)) {
                    this._connections[connectionId].iframe.destroy();
                    delete this._connections[connectionId]
                }

                return this;
            }
        });
    }
);