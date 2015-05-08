define(
    [
        'dojo/_base/declare',
        'dojo/dom-construct'
    ],
    function(declare, domConstruct) {
        return declare(null, {
            _node: null,

            _useFake: function() {

            },

            _generateId: function() {
                return 'dopedIframe-' + Date.now();
            },

            constructor: function(uri) {
                this._node = domConstruct.create(
                    'iframe',
                    {
                        src: uri,
                        id: this._generateId()
                    }
                );

                domConstruct.place(
                    this._node,
                    window.document.body,
                    'last'
                );
            },

            reload: function() {
                console.log('Reload');
                this._node.contentWindow.location.reload();

                return this;
            },

            destroy: function() {
                domConstruct.destroy(this._node);

                return this;
            },

            updateUrl: function(uri) {
            }
        });
    }
);