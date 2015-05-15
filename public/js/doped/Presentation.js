define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/Presentation.html',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dojo/html',
        'dojo/hash',
        'dojo/request',
        'dojo/_base/lang',
        'dojo/_base/array',
        'doped/ComLink'
    ],
    function(declare, Widget, TemplatedMixin, template, style, domConstruct, html, hash, request, lang, array, ComLink) {
        return declare('doped/Controller', [Widget, TemplatedMixin], {
            templateString: template,

            _connectionId: '',

            _comlink: null,

            _counter: 0,

            postCreate: function() {
                if(hash()) {
                    this._connectionId = hash();
                    this._comlink = new ComLink('comlink?mode=client');

                    var connection = this._comlink.connect(this._connectionId, lang.hitch(this, '_handleCommand'));
                    connection.then(lang.hitch(this, '_connectionReady'));
                } else {
                    request('comlink?command=query', { handleAs: 'json'}).then(lang.hitch(this, '_listOngoing'));
                }
            },

            _listOngoing: function(data) {

                if (data['hashes']) {
                    array.forEach(
                        data.hashes,
                        function(hashObj) {
                            var li = domConstruct.create('li', {}, this.ongoingListNode);
                            domConstruct.create(
                                'a',
                                { href: '#' + hashObj.hash, innerHTML:  hashObj.hash},
                                li
                            );
                            console.log(hashObj);
                        },
                        this
                    );
                }
            },

            _connectionReady: function() {
                style.set(this.counterNode, 'visibility', 'visible');
                console.log('Connection ready', this.counterNode);
            },

            _presentationEnded: function() {
                style.set(this.counterNode, 'visibility', 'hidden');
                console.log('Presentation ended');
            },

            _handleCommand: function(data) {
                console.log(data);
                switch(data['command']) {
                    case 'update':
                        this._counter--;
                        html.set(this.counterNode, '' + data['slide']);
                        break;
                    case 'quit':
                        this._comlink.disconnect(this._connectionId).then(lang.hitch(this, '_presentationEnded'));
                        break;
                    default:
                        console.log('Unknown command');
                }
            }
        });
    }
);