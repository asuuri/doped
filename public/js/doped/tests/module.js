define([
    "require",
	"doh/main",
    "dojo/has!host-browser?doped/tests/request/request"
], function(require, doh){
	if(doh.isBrowser){
		doh.register("tests/ComLink", require.toUrl("./ComLink.html"), 60000);
	}
});
