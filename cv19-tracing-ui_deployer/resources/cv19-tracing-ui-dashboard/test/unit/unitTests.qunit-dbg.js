/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"covid19/ui/dashboard/cv19-tracing-ui-dashboard/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});