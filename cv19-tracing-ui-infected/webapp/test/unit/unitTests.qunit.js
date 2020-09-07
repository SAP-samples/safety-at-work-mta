/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"covid19/ui/infected/cv19-tracing-ui-infected/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});