define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/text!doped/page/_template/Presentation.html',
        'dojo/on',
        'dojo/keys',
        'dojo/dom-style',
        'dojo/dom-construct',
        'dojo/html',
        'dojo/hash',
        'dojo/request',
        'dojo/_base/lang',
        'dojo/_base/array',
        'doped/ComLink',
        'doped/SlideDisplay'
    ],
    function(
        declare,
        Widget,
        TemplatedMixin,
        WidgetsInTemplateMixin,
        template,
        on,
        keys,
        style,
        domConstruct,
        html,
        hash,
        request,
        lang,
        array,
        ComLink
    ) {
        return declare('doped/page/Presentation', [Widget, TemplatedMixin, WidgetsInTemplateMixin], {
            templateString: template,

            _connectionId: '',

            _comlink: null,

            slidesUri: '',

            postCreate: function() {
                if(hash()) {
                    this._connectionId = hash();
                    this._comlink = new ComLink('comlink?mode=client');

                    var connection = this._comlink.connect(this._connectionId, lang.hitch(this, '_handleCommand'));
                    connection.then(lang.hitch(this, '_connectionReady'));
                } else {
                    request('comlink?command=query', { handleAs: 'json'}).then(lang.hitch(this, '_listOngoing'));
                }

                on(window, 'keydown', lang.hitch(this, '_handleKeyPress'));
            },

            _handleKeyPress: function(evt) {
                switch(evt.keyCode){
                    case keys.RIGHT_ARROW:
                        this.slideDisplay.next();
                        break;
                    case keys.LEFT_ARROW:
                        this.slideDisplay.previous();
                        break;
                }
            },

            _listOngoing: function(data) {
                if (data['hashes']) {
                    array.forEach(
                        data.hashes,
                        function(hashObj) {
                            var li = domConstruct.create('li', {}, this.ongoingListNode);
                            var link = domConstruct.create(
                                'a',
                                { href: '#' + hashObj.hash, innerHTML:  hashObj.hash},
                                li
                            );

                            on(link, 'click', function() {
                                location.reload();
                            });
                        },
                        this
                    );
                }
            },

            _connectionReady: function() {

            },

            _presentationEnded: function() {

            },

            _handleCommand: function(data) {
                switch(data['command']) {
                    case 'prev':
                        this.slideDisplay.previous();
                        break;
                    case 'goto':
                        this.slideDisplay.goto(data.slideNumber);
                        break;
                    case 'next':
                        this.slideDisplay.next();
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