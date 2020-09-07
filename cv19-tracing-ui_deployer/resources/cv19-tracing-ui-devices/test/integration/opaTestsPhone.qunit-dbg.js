/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"covid19/ui/devicesmanagement/cv19-tracing-ui-devices/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});