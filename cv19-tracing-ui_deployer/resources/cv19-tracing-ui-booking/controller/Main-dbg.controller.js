sap.ui.define([
	"covid19/ui/booking/cv19-tracing-ui-booking/controller/BaseController",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
],
  function (BaseController, Sorter, Filter, FilterOperator, MessageBox, MessageToast, Fragment) {
	"use strict";

    return BaseController.extend(
      "covid19.ui.booking.cv19-tracing-ui-booking.controller.Main",
      {
		__targetName: "Main",

		__roomBookerFilters: [],
		__oDisplayedStartDate: null,
		__oDisplayedEndDate: null,

		__addReservationDialog: null,

		onBeforeRendering: function() {
			sap.ui.Device.resize.attachHandler(
				function(){
					this.__updateCalendarData();
				}.bind(this)
			);
		},

        onAfterRendering: async function () {
			var oPlanningCalendar = this.getView().byId("RoomBookerPlanningCalendar");

			this.__updateLocalDateRangeObjects(oPlanningCalendar);

			try {

				// Fetch all Bookable rooms
				var oData = await this.__fetchDataFromBackEnd({
						path: "/DeviceSet",
						filters: [
							new Filter(
								"Type",
								FilterOperator.EQ,
								"BEACON"
							)
						],
						urlParameters: {
							"$select": "DeviceID,Type,Description,Capacity"
						}
					}),
				oModel = this.getComponentModel();
				oModel.setProperty("/rooms", oData.results);

				// Fetch all available people
				oData = await this.__fetchDataFromBackEnd({
					path: "/DeviceSet",
					filters: [
						new Filter(
							"Type",
							FilterOperator.EQ,
							"USER"
						)
					],
					urlParameters: {
						"$select": "DeviceID,Type,Description"
					}
				}),
				oModel.setProperty("/users", oData.results);

				// Fetch initial data from back-end
				await this.__updateCalendarData();
			}
			catch (err){
				this.__handleCommunicationErrorMessageDisplay(
					"errorFetchingDeviceSet",
					err
				);
			}
		},
        /**
         * Handler method of search event fired by SearchField when the user interact with the bar above the calendar.
         * @param {Event} oEvent - all details of UI's fired event
         */
        onPlanningCalendarSearch: async function () {
			this.setAppBusy(true);
			this.__updateCalendarData();
        },

		/**
		 * This method opens the Create new appointment Dialog.
		 * @param {Event} oEvent all details of UI's fired event
		 */
        onAddNewReservationButtonPress: async function (oEvent) {

			if (!this.__addReservationDialog){
				await this.__loadAddNewReservationDialog()
			}

			this.__addReservationDialog.open();

			this.__resetNewReservationModelObject();

			this.__setDatePickerStartDate("startDateDatePickerMinDate", new Date());
		},

        /**
         * Fired when the Star Date of displayed calendar date range is changed by the user.
         * Here we prepare everything to query data from Back-end according to given timeframe.
         * @param {Event} oEvent - all details of UI's fired event
         */
        onCalendarStartDateChange: async function (oEvent) {
          	var oPlanningCalendar = oEvent.getSource();

			// Get displayed date range
			this.__updateLocalDateRangeObjects(oPlanningCalendar);
			this.setAppBusy(true);
			// Prepare filter object to query DB according to date range displayed to the user
			await this.__updateCalendarData();
		},

		////////////////////////////////////
		// ANCHOR Add reservation Dialog  //
		////////////////////////////////////

		onNewReservationDialogAfterOpen: function(oEvent) {
			var oReservationDetails = oEvent.getSource().getBindingContext().getObject(),
				sFragmentId = "D0_NewAppointmentCreationDialog",
				oStartDateDTP = this.getFragmentControlById(sFragmentId, "startDate"),
				oEndDateDTP = this.getFragmentControlById(sFragmentId, "endDate");

			oStartDateDTP.setDateValue(oReservationDetails.DateStart);
			oEndDateDTP.setDateValue(this.__addSecondsToDate(oReservationDetails.DateEnd, 1));
		},

		/**
		 * Handler for "change" event of Room Select ui control, triggered when the user choose a room to book.
		 * @param {Event} oEvent - all details of UI's fired event
		 */
		onSelectRoomSelectionChange: function(oEvent){
			var sRoomBindingPath = oEvent.getParameters().selectedItem.getBindingContext().getPath(),
				sFragmentId = "D0_NewAppointmentCreationDialog",
				oSlider = this.getFragmentControlById(sFragmentId, "nrOfPeopleSlider");

			oSlider.bindElement(sRoomBindingPath);
		},

		/**
		 * Handler for event "change" of DateTimePicker. 
		 * This method get the selected date and add/subtract 1 second in order to trick the PlanningCalendar row to display tasks one-by-one.
		 * @param {Event} oEvent - all details of UI's fired event
		 */
		onDateTimePickerChange: function(oEvent){
			var sWhichDate = oEvent.getSource().data("whichDate"),
				sPath = oEvent.getSource().getBindingContext().getPath(),
				sFragmentID = (sPath.indexOf("newReservation") !== -1 ) ? "D0_NewAppointmentCreationDialog" : "reservationDetailsPopover",
				oSelectedDate = oEvent.getSource().getDateValue(),
				iSecondsToAdd = (sWhichDate === "DateStart") ? 1 : 0,
				oModel = this.getComponentModel(),
				oNewReservation = oModel.getProperty(sPath);

			oNewReservation[sWhichDate] = this.__addSecondsToDate(oSelectedDate, iSecondsToAdd);
			if (sWhichDate === "DateStart"){
				if (!oNewReservation.ReservationID){ // New Reservation
					this.__setDatePickerStartDate("endDateDatePickerMinDate", oSelectedDate);
				}
				if (oNewReservation.DateEnd && (oNewReservation.DateEnd < oSelectedDate)){
					oNewReservation.DateEnd = oSelectedDate;
					this.__setDateTimePickerDateValue(sFragmentID, "endDate", oSelectedDate);
				}
			}
			else {
				if (oNewReservation.DateStart && (oNewReservation.DateStart > oSelectedDate)){
					oNewReservation.DateStart = oSelectedDate;
					this.__setDateTimePickerDateValue(sFragmentID, "startDate", oSelectedDate);
				}
			}

			/*
			_.find(aRooms, function(item){
				return item.DeviceID == oEvent.getSource().getBindingContext().getObject().RoomID
			})
			*/
			var aRooms = oModel.getProperty("/rooms"),
				oReservationDetails = oEvent.getSource().getBindingContext().getObject(),
				oRoom = _.find(aRooms, function(item){
					return item.DeviceID == oReservationDetails.RoomID;
				}),
				bValid = this.__checkIfReservationOverlaps(
					oRoom,
					oNewReservation.DateStart,
					oNewReservation.DateEnd,
					oReservationDetails
				);
			if (!bValid){
				MessageBox.error(
					this.getTranslation("roomAlreadyHasReservationsInThatTimeframe")
				);
			}
		},

		/**
		 * Handler of change event fired when the user insert in ParticipantsNumber Input field a value.
		 * It is used to transform stringified numbers in Integers.
		 * @param {Event} oEvent - all details of UI's fired event
		 */
		onParticipantsNumberValueChange: function(oEvent) {
			var sValue = oEvent.getSource().getValue(),
				iValue = parseInt(sValue),
				sPath = oEvent.getSource().getBindingContext().getPath(),
				oModel = this.getComponentModel();

			if (iValue && !isNaN(iValue)){
				var sFragmentId = (sPath.indexOf("newReservation") !== -1) ? "D0_NewAppointmentCreationDialog" : "reservationDetailsPopover",
					oSlider = this.getFragmentControlById(sFragmentId, "nrOfPeopleSlider"),
					iRoomCapacity = oSlider.getMax();

				iValue = (iValue < iRoomCapacity) ? iValue : iRoomCapacity;

				oModel.setProperty([sPath, "PartecipantsNumber"].join("/"), (iValue > 0) ? iValue : 1);
			}
			else {
				oModel.setProperty([sPath, "PartecipantsNumber"].join("/"), 1);
			}
		},

		/**
		 * 
		 * @param {Event} oEvent - all details of UI's fired event
		 */
		onNewReservationDialogSaveButton: function(oEvent){
			var bValid = this.__checkIfDialogFieldsAreOk();

			if (!bValid){
				MessageBox.error(
					this.getTranslation("newReservationCreationErrorMissingFields")
				);
				return;
			}

			var oModel = this.getComponentModel(),
				aRooms = oModel.getProperty("/rooms"),
				oNewReservation = oModel.getProperty("/newReservation"),
				oRoom = _.find(aRooms, function(item){
					return item.DeviceID == oNewReservation.RoomID;
				}),
				bOverlap = this.__checkIfReservationOverlaps(
					oRoom,
					oNewReservation.DateStart,
					oNewReservation.DateEnd,
					oNewReservation
				);

			if (!bOverlap){
				MessageBox.error(
					this.getTranslation("newReservationOverlapsExistingTasks")
				);
				return;
			}
			this.setAppBusy(true);
			
			var oODataModel = this.getComponentModel("odata"),
				oNewReservation = oModel.getProperty("/newReservation"),
				oUser = oModel.getProperty("/user"),
				oReservationObjectDetails = {
					ID: new Date().getTime(),
					Subject: oNewReservation.subject,
					DateStart: oNewReservation.DateStart,
					DateEnd: oNewReservation.DateEnd,
					PartecipantsNumber: oNewReservation.PartecipantsNumber,
					Notes: oNewReservation.Notes,
					RoomID: oNewReservation.RoomID,
					EmployeeID: oUser.id,
					ApprovalStatus: 0
				};

				/*
					ReservationSet data structure
					{
						"ID": "1",
						"Subject": "Test task",
						"DateStart": "/Date(1600783200009)/",
						"DateEnd": "/Date(1600797600009)/",
						"PartecipantsNumber": 1,
						"Notes": "Task creato per testare UI",
						"RoomID": "F304D93A-DF19-4A0B-9CB0-72FFA5A6D6DE",
						"EmployeeID": "mario.rossi@test.com",
						"ApprovalStatus": 1
					}
				*/

			this.__oRoom = oRoom;

			this.setAppBusy(true);

			oODataModel.create(
				"/ReservationSet",
				oReservationObjectDetails,
				{
					success: async function(data){
						MessageToast.show(
							this.getTranslation("newReservationSavedSuccessfully")
						);
						this.onNewReservationDialogCancelButton();
						oReservationObjectDetails.RoomName = this.__oRoom.Description;
						await this.__createWFTask(oReservationObjectDetails, oUser);
						this.setAppBusy(false);
						await this.__updateCalendarData();
					}.bind(this),

					error: function(err){
						this.__handleCommunicationErrorMessageDisplay(
							"newReservationNotSavedSuccessfully", 
							err
						);
						this.setAppBusy(false);
					}.bind(this)
				}
			)
		},

		/**
		 * Handler for "Cancel" button press in new reservation dialog.
		 * @param {Event} oEvent - all details of UI's fired event
		 */
		onNewReservationDialogCancelButton: function(){
			this.__resetNewReservationModelObject();
			this.__resetStartAndEndDateTimePickers();
			this.__addReservationDialog.close();
		},

		onCalendarIntervalSelect: async function(oEvent) {
			var oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				oRow = oEvent.getParameter("row"),
				oRoom = oRow.getBindingContext().getObject(),
				oModel = this.getComponentModel();
				

			oModel.setProperty(
				"/newReservation",
				{
					RoomID: oRoom.DeviceID,
					subject: "",
					DateStart: oStartDate,
					DateEnd: oEndDate,
					Notes: "",
					PartecipantsNumber: 1
				}
			);
			
			if (!this.__addReservationDialog){
				await this.__loadAddNewReservationDialog();
			}
			var sFragmentId = "D0_NewAppointmentCreationDialog",
				oSlider = this.getFragmentControlById(sFragmentId, "nrOfPeopleSlider");

			oSlider.bindElement(oRow.getBindingContext().getPath());

			this.__addReservationDialog.bindElement("/newReservation");
			this.__addReservationDialog.open();

			this.__setDatePickerStartDate("startDateDatePickerMinDate", new Date());
		},

		////////////////////////////////
		// ANCHOR Reservation Details //
		////////////////////////////////

		__selectedAppointment: null,

		onReservationSelect: async function(oEvent){
			var oRowReservation = oEvent.getParameter("appointment"),
				oReservationDetails = _.cloneDeep(oRowReservation.getBindingContext().getObject()),
				oModel = this.getComponentModel();

			this.__selectedAppointment = oRowReservation;

			if (oRowReservation === undefined) {
				return;
			}

			if (!oRowReservation.getSelected()) {
				this._oDetailsPopover.close();
				return;
			}

			if (!this._oDetailsPopover) {
				this._oDetailsPopover = await Fragment.load({
					id: "reservationDetailsPopover",
					name: "covid19.ui.booking.cv19-tracing-ui-booking.view.fragment.Main.D1_ReservationDetailsPopover",
					controller: this
				});

				this.getView().addDependent(this._oDetailsPopover);
			}

			oModel.setProperty("/editedReservation", oReservationDetails)
			this._oDetailsPopover.bindElement("/editedReservation");

			this.__setDatePickerStartDate("startDateDatePickerMinDate", null);
			this.__setDatePickerStartDate("endDateDatePickerMinDate", new Date());

			this._oDetailsPopover.openBy(oRowReservation);
		},

		onDetailsPopoverAfterOpen: function(oEvent){
			var oReservationDetails = oEvent.getSource().getBindingContext().getObject(),
				sFragmentId = "reservationDetailsPopover",
				oStartDateDTP = this.getFragmentControlById(sFragmentId, "startDate"),
				oEndDateDTP = this.getFragmentControlById(sFragmentId, "endDate");

			oStartDateDTP.setDateValue(oReservationDetails.DateStart);
			oEndDateDTP.setDateValue(oReservationDetails.DateEnd);
		},

		onDetailPopoverUpdateButtonPress: function(oEvent) {
			var oModel = this.getComponentModel(),
				oODataModel = this.getComponentModel("odata"),
				oUser = oModel.getProperty("/user"),
				oEditedReservation = oModel.getProperty("/editedReservation"),
				sReservationKey = oODataModel.createKey("ReservationSet",{ID: oEditedReservation.ReservationID}),
				oReservationObjectDetails = {
					ID: oEditedReservation.ReservationID,
					Subject: oEditedReservation.Subject,
					DateStart: oEditedReservation.DateStart,
					DateEnd: oEditedReservation.DateEnd,
					PartecipantsNumber: oEditedReservation.PartecipantsNumber,
					Notes: oEditedReservation.ReservationNotes,
					RoomID: oEditedReservation.RoomID,
					EmployeeID: oEditedReservation.EmployeeID,
					ApprovalStatus: 0
				},
				aRooms = oModel.getProperty("/rooms");

			this.__oRoom = _.find(aRooms, function(item){
				return item.DeviceID == oEditedReservation.RoomID;
			});

			this.setAppBusy(true);
			
			oODataModel.update(
				"/" + sReservationKey,
				oReservationObjectDetails,
				{
					success: async function(data){
						try{
							oReservationObjectDetails.RoomName = this.__oRoom.Description;
							await this.__createWFTask(oReservationObjectDetails, oUser);
							this.__updateCalendarData();
							this._oDetailsPopover.close();
							oModel.setProperty("/reservationEditMode", false);
							this.__selectedAppointment.setSelected(false);
						}
						catch(err){
							this.__handleCommunicationErrorMessageDisplay(
								"errorUpdatingReservationWF", 
								err
							);
							this.setAppBusy(false);
						}
						this.setAppBusy(false);
					}.bind(this),
					
					error: function(err){
						this.__handleCommunicationErrorMessageDisplay(
							"errorUpdatingReservation", 
							err
						);
						this.setAppBusy(false);
					}.bind(this)
				}
			);
		},

		onDetailPopoverCloseButtonPress: function() {
			this._oDetailsPopover.close();
		},

		onDetailsPopoverAfterClose: function(){
			if (this.__selectedAppointment){
				this.__selectedAppointment.setSelected(false);
			}
			this.getComponentModel().setProperty("/reservationEditMode", false);
		},

		onDeleteReservationButtonPress: function(oEvent) {
			var oODataModel = this.getComponentModel("odata"),
				oReservationDetails = oEvent.getSource().getBindingContext().getObject(),
				sReservationKey = oODataModel.createKey(
					"/ReservationSet", 
					{
						ID: oReservationDetails.ReservationID
					}
				);

			this.setAppBusy(true);

			oODataModel.remove(
				sReservationKey,
				{
					success: function(data){
						this.__updateCalendarData();
						this.setAppBusy(false);
						MessageToast.show(
							this.getTranslation("reservationDeletedSuccessfully")
						);
					}.bind(this),

					error: function(err){
						this.__handleCommunicationErrorMessageDisplay(
							"errorDeletingReservation", 
							err
						);
						this.setAppBusy(false);
					}.bind(this)
				}
			);
			
		},

    	//////////////////////////////
    	// ANCHOR Private methods ////
		//////////////////////////////

		__updateLocalDateRangeObjects: function(oPlanningCalendar) {
			var oDateRange = oPlanningCalendar._getFirstAndLastRangeDate();
			this.__oDisplayedStartDate = new Date(oDateRange.oStartDate.oDate),
			this.__oDisplayedEndDate = new Date(oDateRange.oEndDate.oDate);
		},

		__updateCalendarData: async function(){
			var oModel = this.getComponentModel(),
				sFilterQuery = oModel.getProperty("/roomBookerSearchString"),
				aTempFilters = [],
				aFilters = [];

			// DateStart filter
			aTempFilters.push(
				new Filter({
					path: "DateStart",
					operator: FilterOperator.BT,
					value1: this.__getUTCDate(this.__oDisplayedStartDate),
					value2: this.__oDisplayedEndDate,
					caseSensitive: false
				})
			);
			// DateEnd filter
			aTempFilters.push(
				new Filter({
					path: "DateEnd",
					operator: FilterOperator.BT,
					value1: this.__getUTCDate(this.__oDisplayedStartDate),
					value2: this.__oDisplayedEndDate,
					caseSensitive: false
				})
			);
			
			aFilters.push(new Filter(aTempFilters, false));
			
			aFilters.push(
				new Filter({
					path: "ApprovalStatus",
					operator: FilterOperator.NE,
					value1: 2,
					caseSensitive: false
				})
			)
			// User's search string
			if (sFilterQuery && sFilterQuery.length > 0) {
				var aFilterProperties = [
					"Description",
					"Subject",
					"ReservationNotes",
					"EmployeeID"
				],
				aTempFilters = [];

				for (var i in aFilterProperties) {
					aTempFilters.push(
						new Filter({
							path: aFilterProperties[i],
							operator: FilterOperator.Contains,
							value1: sFilterQuery,
							caseSensitive: false
						})
					);
				}

				aFilters.push(
					new Filter(aTempFilters, false)	// Put filters in OR
				);
			}

			aFilters = new Filter(aFilters, true);	// Put filters in AND

			try {
				var oData = await this.__fetchDataFromBackEnd({
					path: "/RoomReservationSet",
					filters: aFilters,
					sorters: new Sorter(
						"Description",
						false
					)
				}),
				aReservation = oData.results,
				oGrouped = _.groupBy(aReservation, "DeviceID"),
				aRooms = oModel.getProperty("/rooms");

				for (var i in aRooms){
					var oRoom = aRooms[i];
					oRoom.reservations = oGrouped[oRoom.DeviceID] || [];
				}

				oModel.refresh();

				this.setAppBusy(false);
			}
			catch (err){
				this.__handleCommunicationErrorMessageDisplay(
					"anErrorOccurredCallingODataService", 
					err
				);
				this.setAppBusy(false);
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

		__loadAddNewReservationDialog: async function() {
			this.__addReservationDialog = await Fragment.load({
				controller: this,
				name: "covid19.ui.booking.cv19-tracing-ui-booking.view.fragment.Main.D0_NewAppointmentCreationDialog",
				id: "D0_NewAppointmentCreationDialog"
			});

			this.getView().addDependent(this.__addReservationDialog);
		},

		__resetNewReservationModelObject: function() {
			var oModel = this.getComponentModel();

			oModel.setProperty(
				"/newReservation",
				{
					RoomID: null,
					subject: "",
					DateStart: null,
					DateEnd: null,
					Notes: "",
					PartecipantsNumber: 1
				}
			);

			oModel.refresh();
		},

		__resetStartAndEndDateTimePickers: function() {
			this.__setDateTimePickerDateValue("D0_NewAppointmentCreationDialog", "startDate", null);
			this.__setDateTimePickerDateValue("D0_NewAppointmentCreationDialog", "endDate", null);
		},

		__setDateTimePickerDateValue: function(sFragmentId, sDatePickerName, oDate){
			var oEndDateDTP = this.getFragmentControlById(sFragmentId, sDatePickerName);
			oEndDateDTP.setDateValue(oDate);
		},

		__addSecondsToDate: function(oDate, iSeconds) {
			return new Date(oDate.getTime() + iSeconds * 1000);
		},

		__checkIfDialogFieldsAreOk: function() {
			var oModel = this.getComponentModel(),
				oNewReservation = oModel.getProperty("/newReservation"),
				sFragmentId = "D0_NewAppointmentCreationDialog",
				oSlider = this.getFragmentControlById(sFragmentId, "nrOfPeopleSlider"),
				iRoomCapacity = oSlider.getMax(),
				bValid = (
					!!oNewReservation.RoomID &&
					oNewReservation.subject.length > 0 &&
					!!oNewReservation.DateStart &&
					!!oNewReservation.DateEnd &&
					oNewReservation.PartecipantsNumber <= iRoomCapacity 
				);

				return bValid;
		},

		__setDatePickerStartDate(sDatePicker, oDate) {
			var oModel = this.getComponentModel();
			oModel.setProperty("/" + sDatePicker, oDate);
		},

		__handleCommunicationErrorMessageDisplay: function(sLocalizedStringKey, oErrorFromBE){
			var sMessage = "";
			try {
				sMessage = JSON.parse(oErrorFromBE.responseText).error.message.value;
			}
			catch(err){
				// Do Nothing...
			}

			MessageBox.error(
				this.getTranslation(sLocalizedStringKey,[sMessage])
			);
		},

		__checkIfReservationOverlaps: function(oRow, oStartDate, oEndDate, oReservation){
			var	aReservations = _.sortBy(
				Object. assign({}, oRow.reservations),
				function(item){
					return item.DateStart;
				}
			);

			for (var i in aReservations){

				var oRowReservation = aReservations[i];

				if (oRowReservation.ReservationID !== oReservation.ReservationID){

					if (oEndDate < oRowReservation.DateStart){
						// EndDate is before the StartDate of the first task, so Person has room for new task
						return true;
					}
	
					if (oEndDate > oRowReservation.DateStart && oStartDate < oRowReservation.DateEnd){
						// Check if there is an overlap
						return false;
					};
				}
			}

			// No overlaps
			return true;
		},

		__createWFTask: function(oReservationDetails, oUser){

			return new Promise(
				function(resolve, reject){
					var oModel = this.getComponentModel(),
						/*
							{
								"definitionId": "roomapproval",
								"context": {
									"u": {
										"aN": "",
										"aM": "",
										"e": "",
										"n": ""
									},
									"r": {
										"i": -1,
										"s": "",
										"sd": "",
										"ed": "",
										"p": "",
										"rN": "",
										"n": ""
									},
									"originalTask": {}
								}
							}
						*/
						oWorkflowData = oModel.getProperty("/wfInitData");

						oWorkflowData.context.u = {
							aM: oUser.approver || "john.doe@sap.demo",					// Approver Email
							e: oUser.emails[0].value || "mary.pierce@sap.demo",			// User's email
							n: [oUser.name.givenName, oUser.name.familyName].join(" ")	// User's full name
						};

						oWorkflowData.context.r = {	
							i: oReservationDetails.ID,
							s: oReservationDetails.Subject,
							sd: this.__formatDateTimeString(oReservationDetails.DateStart),
							ed: this.__formatDateTimeString(oReservationDetails.DateEnd),
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

      }
    );
  }
);
