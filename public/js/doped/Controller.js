define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/Controller.html',
        'dojo/dom-class',
        'dojo/dom-attr',
        'dojo/dom-style',
        'dojo/html',
        'dojo/_base/lang',
        'dojo/request',
        'doped/ComLink'
    ],
    function(declare, Widget, TemplatedMixin, template, domClass, attr, style, html, lang, request) {
        return declare('doped/Controller', [Widget, TemplatedMixin], {
            templateString: template,

            postCreate: function() {
                request('../slides/', { handleAs: 'json' }).then(
                    lang.hitch(this, function(data) {
                        if (data['total']) {
                            this.total = data.total;
                            html.set(this.totalSlidesNode, '' + this.total);
                            this._showControls();
                        }
                    })
                );
                console.log('Controller created');
            },

            _connectionId: '',

            _total: 0,

            _slide: 0,

            _showControls: function() {
                domClass.add(this.domNode, 'active');
            },

            _toggleStatus: function() {
                if (!domClass.contains(this.createBtnNode, 'create')) {
                    attr.set(this.createBtnNode, 'disabled', 'disabled');
                    request(
                        '../comlink',
                        { handleAs: 'json', preventCache: true, method: 'POST' }
                    ).then(
                        lang.hitch(this, function(data) {
                            if (data['status'] && data.status === 200) {
                                this._connectionId = data.connectionId;
                                attr.remove(this.createBtnNode, 'disabled');
                                domClass.replace(this.createBtnNode, 'create', 'stop');
                                html.set(this.createBtnNode, 'end');
                                attr.remove(this.nextBtnNode, 'disabled');
                                style.set(this.linkNode, 'visibility', 'visible');
                                attr.set(this.linkNode, 'href', '/#' + this._connectionId);
                            } else {
                                if (data['message']) {
                                    alert(data['message']);
                                }
                                attr.remove(this.createBtnNode, 'disabled');
                            }
                        }),
                        lang.hitch(this, function(data) {
                            console.log('failed', data);
                        })
                    );
                } else {
                    attr.set(this.createBtnNode, 'disabled', 'disabled');
                    request(
                        '../comlink',
                        {
                            handleAs: 'json',
                            preventCache: true,
                            query: {
                                command: 'quit',
                                mode: 'controller',
                                connectionId: this._connectionId
                            }
                        }
                    ).then(
                        lang.hitch(this, function(data) {
                            if (data['status'] && data.status === 200 && data.command === 'quit') {
                                attr.remove(this.createBtnNode, 'disabled');
                                domClass.replace(this.createBtnNode, 'stop', 'create');
                                html.set(this.createBtnNode, 'start');
                                attr.set(this.prevBtnNode, 'disabled', 'disabled');
                                attr.set(this.nextBtnNode, 'disabled', 'disabled');
                                style.set(this.linkNode, 'visibility', 'hidden');
                                html.set(this.watchersCountNode, '0');
                                this._slide = 0;
                            } else {
                                if (data['message']) {
                                    alert(data['message']);
                                }
                                attr.remove(this.createBtnNode, 'disabled');
                            }
                        }),
                        lang.hitch(this, function(data) {
                            console.log('failed', data);
                        })
                    );
                }
            },

            _update: function() {
                var slide = this._slide;

                if (slide === 0) {
                    attr.set(this.prevBtnNode, 'disabled', 'disabled');
                } else if (slide === this.total){
                    attr.set(this.nextBtnNode, 'disabled', 'disabled');
                } else {
                    attr.remove(this.prevBtnNode, 'disabled');
                    attr.remove(this.nextBtnNode, 'disabled');
                }
                request(
                    '../comlink',
                    {
                        handleAs: 'json',
                        preventCache: true,
                        query: {
                            command: 'update',
                            slide: slide,
                            mode: 'controller',
                            connectionId: this._connectionId
                        }
                    }
                ).then(
                    lang.hitch(this, function(data) {
                        html.set(this.watchersCountNode, '' + data.totalClients);
                        html.set(this.currentSlideNode, '' + slide);
                        console.log(data);
                    }),
                    lang.hitch(this, function(data) {
                        console.log(data);
                    })
                );
            },
            _prev: function() {
                this._slide--;
                this._update();
            },
            _next: function() {
                this._slide++;
                this._update();
            }
        });
    }
);