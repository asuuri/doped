define(
    [
        'dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/on'
    ],
    function(declare, domConstruct, on) {
        return declare(null, {
            _node: null,

            _generateId: function() {
                return 'dopedIframe-' + Date.now();
            },

            constructor: function(uri, onLoad) {
                this._node = domConstruct.create(
                    'iframe',
                    {
                        src: uri,
                        id: this._generateId()
                    }
                );

                if (typeof onLoad === 'function') {
                    on(this._node, 'load', onLoad);
                }

                domConstruct.place(
                    this._node,
                    window.document.body,
                    'last'
                );
            },

            reload: function() {
                this._node.contentWindow.location.reload();

                return this;
            },

            destroy: function() {
                domConstruct.destroy(this._node);

                return this;
            }
        });
    }
);