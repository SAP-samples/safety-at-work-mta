sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"covid19/ui/dashboard/cv19-tracing-ui-dashboard/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("covid19.ui.dashboard.cv19-tracing-ui-dashboard.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});