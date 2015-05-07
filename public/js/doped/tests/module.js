define([
    "require",
    "doh/main"
], function(require, doh){
	if(doh.isBrowser) {
            doh.register("tests/ComLink", require.toUrl("./ComLink.html"), 60000);
            doh.register("tests/request/request", require.toUrl("./request/Iframe.html"), 60000);
	}
});
