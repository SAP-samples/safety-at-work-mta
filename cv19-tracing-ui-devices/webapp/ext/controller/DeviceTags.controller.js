sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (Controller,Fragment, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("covid19.ui.devicesmanagement.cv19-tracing-ui-devices.ext.controller.DeviceTags", {
	
		onAfterRendering: function () {
			
		},
		
		handleAddTag: function(oEvent){
			var oButton = oEvent.getSource();
			
			if (!this._oDialog) {
				Fragment.load({
					name: "covid19.ui.devicesmanagement.cv19-tracing-ui-devices.ext.fragment.TagDialog",
					controller: this
				}).then(function (oDialog){
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel());
					this.getView().addDependent(this._oDialog);
					
					this._oDialog.open();
				}.bind(this));
			} else {
				
				this._oDialog.open();
			}
		},
		
		handleDelete: function(oEvent){
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				oViewCtx = this.getView().getBindingContext(),
				oM = oViewCtx.getModel(),
				sPath = oItem.getBindingContext().getPath();
				
			oM.remove(sPath);
			oM.refresh();
		},

		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Value", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		
		onDialogConfirm: function(oEvent){
	
			var oSelItem = oEvent.getParameter("selectedItem"),
				oCtx = null,
				oViewCtx = this.getView().getBindingContext(),
				sDeviceId = oViewCtx.getProperty("DeviceID"),
				oM = oViewCtx.getModel();
			//if any tag is selected add it to device tag relation
			if(oSelItem!==null){
				oCtx = oSelItem.getBindingContext();
				var sKey = oCtx.getProperty("Key");
				oM.create("/DeviceTagSet", {
					DeviceID: sDeviceId,
					TagKey: sKey
				},{
					success: function(oData){
						MessageToast.show("Tag added to the device");
						oM.refresh(true);
					},
					error: function(oError){
						MessageToast.show("Selected tag is already assignes to current device");
					}
				})
			}
			
		}
	});

});