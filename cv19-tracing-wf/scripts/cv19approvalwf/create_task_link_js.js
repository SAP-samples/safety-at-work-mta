var sHash = "#WorkflowTask-DisplayMyInbox?sap-ui-app-id-hint=cross.fnd.fiori.inbox&/detail/NA/" + $.info.workflowInstanceId + "/TaskCollection(SAP__Origin='NA',InstanceID='" + $.info.workflowInstanceId + "')",
	sMyInboxUrl = $.context.appRouterUrl + sHash;
$.context.mIU = sMyInboxUrl; // My Inbox URL