define([
    "require",
    "doh/main"
], function(require, doh){
	if(doh.isBrowser) {
        doh.register("tests/SlideDisplay", require.toUrl("./SlideDisplay.html"), 60000);
	}
});
