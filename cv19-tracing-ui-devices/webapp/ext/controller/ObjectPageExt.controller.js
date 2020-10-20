// sap.ui.define([
// 	"sap/ui/core/mvc/Controller",
// 	"sap/m/MessageToast"
// ], function (Controller, Fragment, Filter, FilterOperator, MessageToast) {
// 	"use strict";

// 	return Controller.extend("covid19.ui.devicesmanagement.cv19-tracing-ui-devices.ext.controller.ObjectPageExt", {

// 		onClickActionDeviceSetHeader1: function (oEvent) {

// 			var oViewCtx = this.getView().getBindingContext(),
// 				oM = oViewCtx.getModel(),
// 				sPath = oViewCtx.getPath();

// 			oM.remove(sPath, {
// 				error: function (e) {
// 					console.log(e)
// 				},
// 				success: function (e) {
// 					MessageToast.show("Device deleted!");
// 				}
// 			})

// 		}
// 	});

// });
sap.ui.controller("covid19.ui.devicesmanagement.cv19-tracing-ui-devices.ext.controller.ObjectPageExt", {

	onClickActionDeviceSetHeader1: function (oEvent) {
		var oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		var oViewCtx = this.getView().getBindingContext(),
				oM = oViewCtx.getModel(),
				sPath = oViewCtx.getPath();
				
			oM.remove(sPath, {
				error: function(e){
					sap.m.MessageToast.show(oRB.getText("ActionDeviceSetHeaderErrMsg"),{
						duration: 3000,
						at: "center center"
					});
					//console.log(e)
				},
				success: function(e){
					sap.m.MessageToast.show(oRB.getText("ActionDeviceSetHeaderSuccMsg"),{
						duration: 3000,
						at: "center center"
					});
					oM.refresh();
				}
			})
		
	}
});