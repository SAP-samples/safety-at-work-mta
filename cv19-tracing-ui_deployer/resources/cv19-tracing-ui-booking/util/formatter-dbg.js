sap.ui.define([], function () {
	"use strict";

	return {
		
		formatCalendarRowIconByType: function(value){

			switch (value) {
				case "BEACON":
					return "sap-icon://meeting-room";

				default:
					return "sap-icon://decline";
			}
		},

		calendarAppointmentIconByApprovalStatus: function(value){
			switch(value){
				case 0: // Pending for approval
					return "sap-icon://pending";
				case 1:	// Approved
					return "sap-icon://approvals";
				case 2:	// Rejected
					return "sap-icon://decline";
				default:
					return "sap-icon://pending";
			}
		},
		
		calendarAppointmentTypeByApprovalStatus: function(value){
			switch(value){
				case 0: // Pending for approval
					return sap.ui.unified.CalendarDayType.Type01;
				case 1:	// Approved
					return sap.ui.unified.CalendarDayType.Type08;
				case 2:	// Rejected
					return sap.ui.unified.CalendarDayType.Type03;
				default:
					return sap.ui.unified.CalendarDayType.None;
			}
		},

		approvalStatusText: function(value) {
			return this.getTranslation("ApprovalStatus" + value);
		},

		approvalStatusObjectStatusState: function(value) {
			switch(value){
				case 0: // Pending for approval
					return sap.ui.core.ValueState.Warning;
				case 1:	// Approved
					return sap.ui.core.ValueState.Success;
				case 2:	// Rejected
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.Information;
			}
		},


	};
});