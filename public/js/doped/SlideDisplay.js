define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/SlideDisplay.html',
        'dojo/_base/lang',
        'dojo/request',
    ],
    function(declare, Widget, TemplatedMixin, template, lang, request) {
        return declare('doped/page/Director', [Widget, TemplatedMixin], {
            templateString: template,

            postCreate: function() {

            }
        });
    }
);