var bApproved = $.usertasks.usertask1.last.decision == "approve",
	oData = {
		backEndStatus: (bApproved) ? 1 : 2,
		emailMessage: (bApproved) ? "Your request has been approved by the manager." : "Unfortunately your request has been rejected.\nPlease call your manager for further details.",
		emailSubject: (bApproved) ? "Reservation request approved" : "Reservation request rejected",
		backendData: {
			hanaUrl: "/xsjs/functions.xsjs",
			requestBody: {
				function: "setApprovalStatus",
				payload: {
			        ApprovalStatus: (bApproved) ? 1 : 2,
					ID: $.context.r.i
				}
			},
			responseBody: {}
		}
	};
$.context.cv19Data = oData;