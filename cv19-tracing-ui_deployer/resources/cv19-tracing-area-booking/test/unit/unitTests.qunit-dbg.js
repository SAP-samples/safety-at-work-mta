/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cv19/tracing/area/booking/cv19-tracing-area-booking/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});