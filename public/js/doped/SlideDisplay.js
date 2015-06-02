define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/SlideDisplay.html',
        'dojo/_base/lang',
        'dojo/request',
        'dojo/dom-construct',
        'dojo/dom-class'
    ],
    function(declare, Widget, TemplatedMixin, template, lang, request, domConstruct, domClass) {
        return declare('doped/SlideDisplay', [Widget, TemplatedMixin], {
            templateString: template,

            uri: null,

            slideData: null,

            currentIndex: null,

            ready: function() {},

            timeoutHandler: null,

            postCreate: function() {
                if (this.uri) {
                    request(this.uri, {handleAs: 'json'}).then(
                        lang.hitch(this, 'loadSlides')
                    );
                }
            },

            loadSlides: function(data) {
                this.slideData = data;

                this._toSlide(0, 0, this.ready);
            },

            _toSlide: function(slideIndex, sideMove /*-1 0 1*/, ready) {
                if (this.slideData && this.slideData.slides && this.slideData.slides[slideIndex]) {
                    request(this.slideData.slides[slideIndex], {handleAs: 'document'}).then(
                        lang.hitch(this, function(svg) {
                            this.currentIndex = slideIndex;
                            this.renderSlide(svg.documentElement, sideMove, ready);
                        })
                    );
                }
            },

            renderSlide: function(svgNode, side /*-1 0 1*/, ready) {
                var containerNode, incomingClass, outgoingClass;
                if (side === 0) {
                    domConstruct.place(svgNode, this.slideContainerNode, 'only');
                } else {
                    incomingClass = (side === 1)?'next':'previous';
                    outgoingClass = (side === 1)?'previous':'next';

                    containerNode = domConstruct.create('div', { 'class': 'slideContent ' + incomingClass }, this.domNode);
                    domConstruct.place(svgNode, containerNode, 'only');

                    domClass.replace(containerNode, 'current', incomingClass);
                    domClass.replace(this.slideContainerNode, outgoingClass, 'current');

                    clearTimeout(this.timeoutHandler);
                    setTimeout(lang.hitch(this, function() {
                        domConstruct.destroy(this.slideContainerNode);
                        this.slideContainerNode = containerNode;
                    }), 600);
                }

                if (typeof ready === 'function') {
                    ready();
                }
            },

            next: function(ready) {
                var nextSlide = this.currentIndex + 1;

                this._toSlide(nextSlide, 1, ready);
            },

            goto: function(index, ready) {
                var sideMovement;

                if (index !== this.currentIndex) {
                    sideMovement = (this.currentIndex < index)? 1 : -1;
                    this._toSlide(index, sideMovement, ready);
                }
            },

            previous: function(ready) {
                var nextSlide = this.currentIndex - 1;

                this._toSlide(nextSlide, -1, ready)
            }
        });
    }
);