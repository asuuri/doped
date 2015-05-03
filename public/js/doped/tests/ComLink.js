define(
    [
        'doh/main', 
        'doped/ComLink', 
        'doped/errors/DuplicateConnectionIdError'
    ], function(
        doh, 
        ComLink, 
        DuplicateConnectionIdError
    ){
	doh.register('tests.ComLink', [
            {
                name: 'Trying to connect twice /w same id throws an error',
                runTest: function(t) {
                    var comLink = new ComLink();

                    comLink.connect('foobar');

                    t.assertError(DuplicateConnectionIdError, comLink, 'connect', ['foobar']);
                }
            }
	]);

});

