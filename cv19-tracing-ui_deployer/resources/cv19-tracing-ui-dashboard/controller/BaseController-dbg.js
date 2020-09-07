sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"covid19/ui/dashboard/cv19-tracing-ui-dashboard/util/formatter",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment"
], function (jQuery, MessageBox, MessageToast, Controller, History, formatter, Sorter, Filter, Fragment) {
	"use strict";

	return Controller.extend("covid19.ui.dashboard.cv19-tracing-ui-dashboard.controller.BaseController", {

		__targetName: null,

		__MESSAGE_BOX_CHANNEL: "message_box",
		__MESSAGE_BOX_EVENT: "fired",

		__TOAST_ERROR: "error",
		__TOAST_INFO: "info",
		__TOAST_WARNING: "warning",
		__TOAST_SUCCESS: "success",
		
		_tableColumnsSettingsDialog: null,
		
		formatter: formatter,
		
		logger: null,
		
		onInit: function () {
			if (this.__targetName !== undefined && this.__targetName !== null) {
				var targets = typeof this.__targetName === 'string' ? [this.__targetName] : this.__targetName;
				for (var i = 0; i < targets.length; i++) {
					var oRoute = this.getRouter().getRoute(targets[i]);
					if (oRoute){
						oRoute.attachPatternMatched(this._onRouteMatched, this);
					}
				}
			}
			
			this.logger = this.getOwnerComponent().logger;
			
			this._onInit.apply(this);
		},
		
		_onInit: function(){
			// Do the magic
		},
		
		onAfterRendering: function() {
		},
		
		setAppBusy: function(bBusy){
			this.getComponentModel().setProperty("/busy", bBusy);
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		onNavBack: function(){
			this.getRouter().navTo(
				"Main",
				{},
				false
			);
		},

		navTo: function (sRoute, mData, bReplace) {
			this.getRouter().navTo(sRoute, mData, bReplace);
		},

		_onRouteMatched: function (oEvent) {
			var args = oEvent.getParameters().arguments;
			var argsValues = [oEvent, oEvent.getParameters().name];
			for (var key in args) {
				if (args.hasOwnProperty(key)) {
					var obj = args[key];
					argsValues.push(obj);
				}
			}
			this.onRouteMatched.apply(this, argsValues);
		},

		onRouteMatched: function (oEvent, routeName) {
			//Do something here ;)
		},

		getComponentModel: function (modelName) {
			var component = this.getOwnerComponent();
			var model = modelName == null || modelName === undefined ? component.getModel() : component.getModel(modelName);
			return model;
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Get the translation for sKey
		 * @public
		 * @param {string} sKey the translation key
		 * @param {array} aParameters translation paramets (can be null)
		 * @returns {string} The translation of sKey
		 */
		getTranslation: function (sKey, aParameters) {
			if (aParameters === undefined || aParameters === null) {
				return this.getResourceBundle().getText(sKey);
			} else {
				return this.getResourceBundle().getText(sKey, aParameters);
			}

		},
		
		getFragmentControlById: function(sFragmentId, sSelectListId){
			var sID = Fragment.createId(sFragmentId,sSelectListId);
			return sap.ui.getCore().byId(sID);
		},
		
		/*******************************************************
		 * EVENT BUS
		 *******************************************************/

		sendEvent: function (channel, event, data) {
			sap.ui.getCore().getEventBus().publish(channel, event, data);
		},

		subscribe: function (channel, event, handler, listener) {
			sap.ui.getCore().getEventBus().subscribe(channel, event, handler, listener);
		},

		unSubscribe: function (channel, event, handler, listener) {
			sap.ui.getCore().getEventBus().unsubscribe(channel, event, handler, listener);
		},
		
		/**
		 * Private methods
		 */
		
		_generateUuidv4: function () {
		  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		    return v.toString(16);
		  });
		},
		
		_setSelectedPage: function(sPage){
			var oModel = this.getComponentModel("local");
			oModel.setProperty("/selectedPage", sPage);
		},
		
		_getSelectedView: function(){
			return this.getOwnerComponent().__selectedView;         
		},
		
		_setSelectedView: function(sView){
			this.getOwnerComponent().__selectedView = sView;         
        }
        
	});
});