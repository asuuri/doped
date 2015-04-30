define(['doh/main', 'doped/ComLink'], function(doh, ComLink){
	doh.register('tests.ComLink', [
		{
            name: 'Trying to connect twice /w same id throws an error',
            runTest: function() {
                var comLink = ComLink();

                comLink.connect('foobar');
                comLink.connect('foobar');
            }
        }
	]);

});

