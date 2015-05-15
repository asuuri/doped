define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/Presentation.html',
        'dojo/dom-class',
        'dojo/dom-attr',
        'dojo/html',
        'dojo/_base/lang',
        'doped/ComLink'
    ],
    function(declare, Widget, TemplatedMixin, template, domClass, attr, html, lang, ComLink) {
        return declare('doped/Controller', [Widget, TemplatedMixin], {
            templateString: template,

            postCreate: function() {
                console.log('Controller created');
            },

            _connectionId: '',
        });
    }
);