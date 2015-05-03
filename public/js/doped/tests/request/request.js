define([
	"require",
	"doh/main"
], function(require, doh){
	if(doh.isBrowser){
		doh.register("tests.request.Iframe", require.toUrl("./Iframe.html"), 60000);
	}
});
