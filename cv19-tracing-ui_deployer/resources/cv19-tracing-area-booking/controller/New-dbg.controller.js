sap.ui.define([
	"cv19/tracing/area/booking/cv19-tracing-area-booking/controller/BaseController",
	'sap/ui/unified/CalendarLegendItem',
	'sap/ui/unified/DateTypeRange',
	'sap/m/MessageBox',
	'sap/m/MessageToast'
], function (Controller, CalendarLegendItem, DateTypeRange, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("cv19.tracing.area.booking.cv19-tracing-area-booking.controller.New", {

		__targetName: "New",

		_bDateIsSelectable: false,
		_bFirstTime: true,

		onRouteMatched: function(oEvent){
			this.__setLayout("TwoColumnsBeginExpanded");
			this.__eraseNewBookingObject();

			var oNow = new Date();
			oNow.setDate(1);
			oNow.setHours(0,0,0);
			this.__setCalendarDateIntervalInModel(oNow);

			this._bFirstTime = true;
		},

		onBeforeRendering: function(){
			this.__fetchAreas();
		},

		onNavBack: function(){
			this.getRouter().navTo(
				"Main",
				{},
				false
			);
		},

		onSelectAreaSelectionChange: function(oEvent){
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oSelectedArea = oSelectedItem.getBindingContext().getObject();

			this.__getAreaCapacityDetails(oSelectedArea);

			if (this._bFirstTime){
				setTimeout(
					function(){
						this.byId("datePickerCalendar").destroySelectedDates();
						this._bFirstTime = false;
					}.bind(this),
					100
				);
			}
		},

		onCalendarStartDateChange: function(oEvent){
			var oStartDate = oEvent.getSource().getStartDate();
			this.__setCalendarDateIntervalInModel(oStartDate);
		},

		onDatePickerCalendarSelect: function(oEvent){
			var oCalendar = oEvent.getSource(),
				sSelectedArea = this.getView().byId("selectArea").getSelectedItem().getText(),
				oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate(),
				aSpecialDates = oCalendar.getSpecialDates();
				
			this._bDateIsSelectable = this.__checkIfSelectedDateIsOk(oSelectedDate, aSpecialDates);

			if (!this._bDateIsSelectable){
				MessageBox.error(
					this.getTranslation(
						"noCapacityAvailableForSelectedDate",
						[sSelectedArea, oSelectedDate.toDateString()]
					)
				);

				return;
			}

			var oModel = this.getComponentModel(),
				oNewBookingDetails = oModel.getProperty("/newBooking"),
				oStartDate = new Date(oSelectedDate.setHours(0,0,0)),
				oEndDate = new Date(oSelectedDate.setHours(23,59,59));

			oNewBookingDetails.DateStart = oStartDate;
			oNewBookingDetails.DateEnd = oEndDate;

			oModel.refresh();
		},

		onSaveButtonPress: function(oEvent){
			var oModel = this.getComponentModel(),
				oODataModel = this.getComponentModel("odata"),
				oUser = oModel.getProperty("/user"),
				oNewBookingDetails = oModel.getProperty("/newBooking"),
				bAllOk = this.__checkIfAllFieldsAreOk(oNewBookingDetails);

			if (!bAllOk) {
				MessageBox.error(
					this.getTranslation("someMandatoryFieldsAreMissing")
				);
				return;
			}

			this.__setBookingDateInterval(oNewBookingDetails);

			var aAreas = oModel.getProperty("/areas"),
				oArea = _.find(aAreas, function(item){
					return item.DeviceID == oNewBookingDetails.AreaID;
				}),
				oReservationObjectDetails = {
					ID: new Date().getTime(),
					Subject: this.getTranslation("userInArea", [oUser.name.familyName, oUser.name.givenName]),
					DateStart: this.__getDateFromUTC(oNewBookingDetails.DateStart),
					DateEnd: this.__getDateFromUTC(oNewBookingDetails.DateEnd),
					PartecipantsNumber: 1,
					Notes: oNewBookingDetails.Notes,
					RoomID: oNewBookingDetails.AreaID,
					EmployeeID: oUser.id,
					ApprovalStatus: 0
				};

			this.__oArea = oArea;

			this.setAppBusy(true);

			oODataModel.create(
				"/ReservationSet",
				oReservationObjectDetails,

				{
					success: async function(){
						try{
							oReservationObjectDetails.RoomName = this.__oArea.Description;
							await this.__createWFTask(oReservationObjectDetails, oUser);
						}
						catch(err){
							this.__handleCommunicationErrorMessageDisplay(
								"errorCreatingWFForYourRequest",
								err
							);
						}
						this.setAppBusy(false);
						MessageToast.show(
							this.getTranslation("newBookingSavedSuccessfully")
						);
						this.onNavBack();
						await this.__getMyBookings();
					}.bind(this),

					error: function(err){
						this.__handleCommunicationErrorMessageDisplay(
							"newBookingNotSavedSuccessfully",
							err
						);
						this.setAppBusy(false);
					}.bind(this)
				}
			)
		},

		////////////////////////////
		// ANCHOR Private methods //
		////////////////////////////

		__eraseNewBookingObject: function(){
			var oModel = this.getComponentModel();
			oModel.setProperty(
				"/newBooking",
				{
					AreaID: null,
					DateStart: null,
					DateEnd: null,
					Notes: "",
					timeframe: "wholeDay"
				}
			);
		},

		__getAreaCapacityDetails: async function(oSelectedArea) {
			var oODataModel = this.getComponentModel("odata"),
				oModel = this.getComponentModel(),
				oStartDate = oModel.getProperty("/calendarStartDate"),
				oEndDate = oModel.getProperty("/calendarEndDate"),
				sPath = oODataModel.createKey(
					"/OccupationByDateParameters",
					{
						StartDate: oStartDate,
						EndDate: oEndDate,
						AreaId: oSelectedArea.DeviceID
					}
				);


			this.setAppBusy(true);


			try{
				var oData = await this.__fetchDataFromBackEnd({
						path: sPath + "/Results"
					}),
					aCalendarCapacity = oData.results;


				this.__updateCalendar(
					oSelectedArea, 
					aCalendarCapacity
				);
			}
			catch (err) {
				this.__handleCommunicationErrorMessageDisplay(
					"errorFetchingCalendarDatesCapacity",
					err
				);
			}
		},

		__updateCalendar: function(oSelectedArea, aCalendarData){
			var oCalendar = this.getView().byId("datePickerCalendar"),
				oLegend = this.getView().byId("datePickerCalendarLegend");

			oCalendar.destroySpecialDates();
			oLegend.destroyItems();

			for (var i in aCalendarData){
				var oData = aCalendarData[i],
					oCalendarType = this.__getCalendarTypeDetails(
						oData.capacity,
						oSelectedArea.Capacity
					);

				if (oCalendarType){
					oCalendar.addSpecialDate(new DateTypeRange({
						startDate: oData.startDate,
						color: oCalendarType.color,
						tooltip: oCalendarType.tooltip
					}));
				}
			}

			oLegend.addItem(new CalendarLegendItem({
				text: this.getTranslation("calendarWarningTooltip"),
				color: "#e9730c"
			}));
			oLegend.addItem(new CalendarLegendItem({
				text: this.getTranslation("calendarErrorTooltip"),
				color: "#bb0000"
			}));

			this.setAppBusy(false);
		},

		__getCalendarTypeDetails: function(iParticipants, iCalendarCapacity) {
			var fPercentage = iParticipants / iCalendarCapacity * 100;

			if (fPercentage < 85){
				return null;
			}

			if (fPercentage >= 85 && fPercentage < 100) {
				return {
					color: "#e9730c",
					tooltip: this.getTranslation("calendarWarningTooltip")
				};
			}

			return {
				color: "#bb0000",
				tooltip: this.getTranslation("calendarErrorTooltip")
			}
		},

		__setCalendarDateIntervalInModel: function(oStartDate){
			var oEndDate = this.__getLastDayOfMonth(oStartDate),
				oModel = this.getComponentModel();
			oModel.setProperty("/calendarStartDate", this.__addDaysToDate(oStartDate, -1));
			oModel.setProperty("/calendarEndDate", this.__addDaysToDate(oEndDate, 1));
		},

		__checkIfSelectedDateIsOk: function(oSelectedDate, aSpecialDates) {
			var iSelectedDay = oSelectedDate.getDate(),
				iSelectedMonth = oSelectedDate.getMonth();

			for (var i in aSpecialDates){
				var oSpecialDate = aSpecialDates[i].getStartDate(),
					bDateIsFull = aSpecialDates[i].getColor() === "#bb0000",
					iDay = oSpecialDate.getDate(),
					iMonth = oSpecialDate.getMonth();

				if (bDateIsFull){
					if (iDay === iSelectedDay && iMonth === iSelectedMonth){
						return false;
					}
				}
			}

			return true;
		},

		__checkIfAllFieldsAreOk: function(oNewBookingDetails) {
			return (
				!!oNewBookingDetails.AreaID &&
				!!oNewBookingDetails.DateStart &&
				!!oNewBookingDetails.DateEnd &&
				!!this._bDateIsSelectable
			);
		},

		__setBookingDateInterval: function(oNewBookingDetails) {
			var oStartDate = oNewBookingDetails.DateStart,
				oEndDate = oNewBookingDetails.DateEnd,
				sSelectedTimeFrame = oNewBookingDetails.timeframe;

			// eslint-disable-next-line default-case
			switch (sSelectedTimeFrame){
				case "wholeday":
					oStartDate.setHours(0,0,0);
					oEndDate.setHours(23,59,59);
				break;

				case "morning":
					oStartDate.setHours(0,0,0);
					oEndDate.setHours(12,0,0);
				break;

				case "afternoon":
					oStartDate.setHours(12,0,1);
					oEndDate.setHours(23,59,59);
				break;
			}

			oNewBookingDetails.DateStart = oStartDate;
			oNewBookingDetails.DateEnd = oEndDate;
		},

		__createWFTask: function(oReservationDetails, oUser){

			return new Promise(
				function(resolve, reject){
					var oModel = this.getComponentModel(),
						oWorkflowData = oModel.getProperty("/wfInitData");

						/*

						ID: new Date().getTime(),
						Subject: this.getTranslation("userInArea", [oUser.name.familyName, oUser.name.givenName]),
						DateStart: this.__getDateFromUTC(oNewBookingDetails.DateStart),
						DateEnd: this.__getDateFromUTC(oNewBookingDetails.DateEnd),
						PartecipantsNumber: 1,
						Notes: oNewBookingDetails.Notes,
						RoomID: oNewBookingDetails.AreaID,
						EmployeeID: oUser.id,
						ApprovalStatus: 0
					*/

						oWorkflowData.context.u = {
							aM: oUser.approver || "john.doe@sap.demo",					// Approver Email
							e: oUser.emails[0].value || "mary.pierce@sap.demo",			// User's email
							n: [oUser.name.givenName, oUser.name.familyName].join(" ")	// User's full name
						};

						oWorkflowData.context.r = {	
							i: oReservationDetails.ID,
							s: oReservationDetails.Subject,
							sd: this.__formatDateString(oReservationDetails.DateStart),
							ed: this.__formatDateString(oReservationDetails.DateEnd),
							p: "" + oReservationDetails.PartecipantsNumber,
							n: oReservationDetails.Notes || "",
							rN: oReservationDetails.RoomName
						};

						oWorkflowData.context.originalTask = oReservationDetails;

						var sAppRouterUrl = this.__getLocationUrl();
						oWorkflowData.context.appRouterUrl = sAppRouterUrl;

					$.ajax({
						url: "/bpmworkflowruntime/v1/xsrf-token",
						method: "GET",
						headers: {
							"X-CSRF-Token": "Fetch"
						},
						success: function (result, xhr, data) {
							var token = data.getResponseHeader("X-CSRF-Token");
							if (token === null) return;
	 
							// Start workflow 
							$.ajax({
								url: "/bpmworkflowruntime/v1/workflow-instances",
								type: "POST",
								data: JSON.stringify(oWorkflowData),
								 headers: {
									"X-CSRF-Token": token,
									"Content-Type": "application/json"
								},
								async: false,
								success: function () {
									MessageBox.information(
										this.getTranslation("approvalRequestHasBeenSent")
									)
									resolve(true);
								}.bind(this),
								error: function (err) {
									reject(err);
								}.bind(this)
							});
						}.bind(this)
					});
				}.bind(this)
			)

		}

	});
});
