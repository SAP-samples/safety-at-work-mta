sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"cv19/tracing/area/booking/cv19-tracing-area-booking/util/formatter",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (jQuery, MessageBox, MessageToast, Controller, History, formatter, Sorter, Filter, FilterOperator, Fragment) {
	"use strict";

	return Controller.extend("cv19.tracing.area.booking.cv19-tracing-area-booking.controller.BaseController", {

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
		
		onAfterRendering: async function() {
			try {
				var oModel = this.getComponentModel(),
					oUserInfos = await this._getUserInfos();

				oModel.setProperty(
					"/user",
					oUserInfos
				);

				this.__getMyBookings();
				
			} catch (err) {
				console.error(err);
			}
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
			this.__getMyBookings();
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

		_getUserInfos: function () {
			return new Promise(function (resolve, reject) {
				$.ajax({
					url: "/js_api/userInfo",
					method: "GET",
					dataType: "json",
					context: this,
					success: function (oData) {
						/**
							oData Structure
							{
								"id": "mario.rossi@sap.com",
								"name": {	
								"givenName": "Mario",
								"familyName": "Rossi"
								},
								"emails": [
									{
									"value": "mario.rossi@sap.com"
									}
								]
							}
						 */
						resolve(oData);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						var sMessage = "Error retrieving user info\nError" + jqXHR.status + " - " + jqXHR.responseText;
						reject(sMessage);
					}
				});
			});
		},
		
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
		},
		
		__getUTCDate(oDate){
			return new Date(oDate.getTime() + oDate.getTimezoneOffset() * 60000);
		},

		__getDateFromUTC(oDate){
			return new Date(oDate.getTime() - oDate.getTimezoneOffset() * 60000);
		},

		__addDaysToDate: function(oDate, iDays) {
			return new Date(oDate.getTime() + iDays * 24 * 3600 * 1000);
		},

		__handleCommunicationErrorMessageDisplay: function(sLocalizedStringKey, oErrorFromBE){
			var sMessage = "";
			try {
				// oData communication error
				sMessage = JSON.parse(oErrorFromBE.responseText).error.message.value;
			}
			catch(err){
				// Exception
				sMessage = oErrorFromBE.message;
			}

			MessageBox.error(
				this.getTranslation(sLocalizedStringKey,[sMessage])
			);
		},

		__setLayout: function(sLayout){
			this.getComponentModel().setProperty("/layout", sLayout);
		},

		__getMyBookings: async function(){
			var oNow = this.__getUTCDate(new Date()),
				aFilters = [],
				oModel = this.getComponentModel(),
				oUser = oModel.getProperty("/user");

			oNow.setHours(0, 0, 0);

			aFilters.push(
				new Filter({
					path: "Type",
					operator: FilterOperator.EQ,
					value1: "AREA"
				})
			);
			aFilters.push(
				new Filter({
					path: "DateStart",
					operator: FilterOperator.GE,
					value1: oNow
				})
			);
			aFilters.push(
				new Filter({
					path: "EmployeeID",
					operator: FilterOperator.EQ,
					value1: oUser.id
				})
			);

			aFilters = new Filter(aFilters, true);

			try {
				this.setAppBusy(true);
				var aMyBookings = await this.__fetchDataFromBackEnd(
					{
						path: "/RoomReservationSet",
						filters : aFilters,
						sorters: new Sorter(
							"DateStart",
							false
						)
					}
				);
						
				oModel.setProperty("/myBookings", aMyBookings.results);
				this.setAppBusy(false);
			}
			catch (err){
				this.__handleCommunicationErrorMessageDisplay(
					"errorFetchingMyBookings",
					err
				);
			}
		},

		__fetchDataFromBackEnd: function(oConfigObject) {
			return new Promise(
				function(resolve, reject) {
					var aFilters = oConfigObject.filters || null,
						aSorters = oConfigObject.sorters || null,
						oODataModel = this.getComponentModel("odata");

					oODataModel.read(
						oConfigObject.path,
						{
							filters: (aFilters) ? [aFilters] : null,

							sorters: (aSorters) ? [aSorters] : null,

							urlParameters: oConfigObject.urlParameters,

							success: function(data){
								console.log(oConfigObject.path + " -- data received", data);
								resolve(data);
							}.bind(this),

							error: function(error){
								reject(error);
							}
						}
					);
				}.bind(this)
			);
		},

		__fetchAreas: async function(){
			var oModel = this.getComponentModel(),
				oODataModel = this.getComponentModel("odata");

			this.setAppBusy(true);

			// Fetch all Bookable areas
			var oData = await this.__fetchDataFromBackEnd({
					path: "/DeviceSet",
					filters: [
						new Filter(
							"Type",
							FilterOperator.EQ,
							"AREA"
						)
					],
					urlParameters: {
						"$select": "DeviceID,Type,Description,Capacity"
					}
				}),
			oModel = this.getComponentModel();
			oModel.setProperty("/areas", oData.results);

			this.setAppBusy(false);
		},

		__getLastDayOfMonth: function (oFirstDay){
			var oLastDay = new Date(oFirstDay.getFullYear(), oFirstDay.getMonth() + 1, 0)
			oLastDay.setHours(23,59,59);
			return oLastDay;
		},

		__formatDateString: function(oDate){
			var oFormat = sap.ui.core.format.DateFormat.getInstance({
				format: "yMMMd"
			});
			return oFormat.format(oDate);
		},

		__formatDateTimeString: function(oDate){
			var oFormat = ssap.ui.core.format.DateFormat.getDateTimeInstance({
				format: "yMMMdHHmm"
			});
			return oFormat.format(oDate);
		},

		__getLocationUrl: function() {
			return window.location.protocol + "//" + window.location.host;
		}
        
	});
});