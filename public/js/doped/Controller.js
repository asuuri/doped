define(
    [
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_TemplatedMixin',
        'dojo/text!doped/_template/Controller.html',
        'dojo/_base/lang',
        'doped/ComLink'
    ],
    function(declare, Widget, TemplatedMixin, template, lang, ComLink) {
        return declare('doped/Controller', [Widget, TemplatedMixin], {
            templateString: template,
            
            postCreate: function() {
                console.log('Controller created');
            },
            
            _create: function() {
                console.log('create');
            },
            _prev: function() {
                console.log('prev');
            },
            _next: function() {
                console.log('next');
            }
        });
    }
);