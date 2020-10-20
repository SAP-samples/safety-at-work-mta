sap.ui.define([], function () {
	"use strict";

	return {

		formatApprovalStatusText: function(value) {
			return this.getTranslation("ApprovalStatus" + value);
		},

		formatApprovalStatusState: function(value){
			switch (value){
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

		formatApprovalStatusIcon: function(value){
			switch (value){
				case 0: // Pending for approval
					return "sap-icon://pending";
				case 1:	// Approved
					return "sap-icon://accept";
				case 2:	// Rejected
					return "sap-icon://decline";
				default:
					return "sap-icon://pending";
			}
		}

	};
});