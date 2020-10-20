{
	"contents": {
		"29da5e06-b7c1-4ae7-8e9a-1011cb847cda": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "cv19approvalwf",
			"subject": "cv19approvalwf",
			"name": "cv19approvalwf",
			"documentation": "Approve Room reservation requests",
			"lastIds": "9c7b65ba-6a21-448c-86bc-24b5d80fc6b4",
			"events": {
				"e044ee94-a8bc-4fd9-905e-08cd8842dd2b": {
					"name": "StartEvent1"
				},
				"1d3a61a4-5097-4c52-9fef-aef7685847cf": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"60502212-d642-414f-8ba9-8f060c6234d1": {
					"name": "Send Creation email"
				},
				"0c2f0e4c-55c3-464d-9fb1-2ef9ae693a9e": {
					"name": "Apply decision"
				},
				"a0db6fed-3ef0-4fd0-91e7-92639992d626": {
					"name": "Send Confirmation email"
				},
				"50a75e7c-efba-4399-a513-e64c6d94b0c0": {
					"name": "Format context data"
				},
				"da566d11-6751-4860-8337-8446fa1793d3": {
					"name": "Update reservation status"
				},
				"4be59b7f-7cca-48e7-aef4-01e9574ce469": {
					"name": "Create task link"
				}
			},
			"sequenceFlows": {
				"e9c306f1-0e73-4a1c-8dc3-7a5a37ec6417": {
					"name": "SequenceFlow4"
				},
				"a3487bb1-f67e-433b-99ad-cd53208fc1ea": {
					"name": "SequenceFlow5"
				},
				"7d9ed207-3c38-485b-b638-9ebef6b18c46": {
					"name": "SequenceFlow11"
				},
				"c74677cf-c3b7-4451-b1a3-0d8f6d2ad9ea": {
					"name": "SequenceFlow14"
				},
				"3b598322-e1f7-4fff-9d9c-7b8cc34afe17": {
					"name": "SequenceFlow15"
				},
				"face8d80-d8c2-43f0-9ca9-304ac36ef2b0": {
					"name": "SequenceFlow16"
				},
				"e6479bcf-bc06-4433-80e0-5eb08057f369": {
					"name": "SequenceFlow17"
				}
			},
			"diagrams": {
				"71c7fdfd-83ee-4260-b1e8-e69c792d3d13": {}
			}
		},
		"e044ee94-a8bc-4fd9-905e-08cd8842dd2b": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1"
		},
		"1d3a61a4-5097-4c52-9fef-aef7685847cf": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"60502212-d642-414f-8ba9-8f060c6234d1": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask1",
			"name": "Send Creation email",
			"mailDefinitionRef": "5fa613d8-ebab-4ab8-9722-d8693f2b7873"
		},
		"0c2f0e4c-55c3-464d-9fb1-2ef9ae693a9e": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "New reservation request from ${context.u.n}",
			"priority": "HIGH",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "${context.u.aM}",
			"formReference": "/forms/cv19approvalwf/reservationRequestForm.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "reservationrequestform"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"id": "usertask1",
			"name": "Apply decision"
		},
		"a0db6fed-3ef0-4fd0-91e7-92639992d626": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"id": "mailtask2",
			"name": "Send Confirmation email",
			"mailDefinitionRef": "c6738ff7-2a2f-4caa-be44-c76bc240c1d6"
		},
		"50a75e7c-efba-4399-a513-e64c6d94b0c0": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/cv19approvalwf/create_response_object.js",
			"id": "scripttask1",
			"name": "Format context data"
		},
		"da566d11-6751-4860-8337-8446fa1793d3": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "safetyAtWork",
			"path": "${context.cv19Data.backendData.hanaUrl}",
			"httpMethod": "POST",
			"requestVariable": "${context.cv19Data.backendData.requestBody}",
			"responseVariable": "${context.cv19Data.backendData.responseBody}",
			"id": "servicetask3",
			"name": "Update reservation status"
		},
		"e9c306f1-0e73-4a1c-8dc3-7a5a37ec6417": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "60502212-d642-414f-8ba9-8f060c6234d1",
			"targetRef": "0c2f0e4c-55c3-464d-9fb1-2ef9ae693a9e"
		},
		"a3487bb1-f67e-433b-99ad-cd53208fc1ea": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow5",
			"name": "SequenceFlow5",
			"sourceRef": "0c2f0e4c-55c3-464d-9fb1-2ef9ae693a9e",
			"targetRef": "50a75e7c-efba-4399-a513-e64c6d94b0c0"
		},
		"7d9ed207-3c38-485b-b638-9ebef6b18c46": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow11",
			"name": "SequenceFlow11",
			"sourceRef": "a0db6fed-3ef0-4fd0-91e7-92639992d626",
			"targetRef": "1d3a61a4-5097-4c52-9fef-aef7685847cf"
		},
		"c74677cf-c3b7-4451-b1a3-0d8f6d2ad9ea": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow14",
			"name": "SequenceFlow14",
			"sourceRef": "50a75e7c-efba-4399-a513-e64c6d94b0c0",
			"targetRef": "da566d11-6751-4860-8337-8446fa1793d3"
		},
		"3b598322-e1f7-4fff-9d9c-7b8cc34afe17": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow15",
			"name": "SequenceFlow15",
			"sourceRef": "da566d11-6751-4860-8337-8446fa1793d3",
			"targetRef": "a0db6fed-3ef0-4fd0-91e7-92639992d626"
		},
		"71c7fdfd-83ee-4260-b1e8-e69c792d3d13": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"f59f86b5-7321-4639-aa10-ca5fc1d4dc6b": {},
				"a81b9bda-eb11-4990-83d7-d64223306e13": {},
				"84570788-5abf-429c-af22-fbb6422190c7": {},
				"23e18ed0-19fd-4e58-8ef4-4e9cf024b112": {},
				"b22d86be-b2ed-4cd2-9bac-7cb0068951d8": {},
				"b7cb330d-47cf-47a0-88a4-1208b1a36ac6": {},
				"fb63fc87-ab89-4a60-a8de-5c2f6b0dfc94": {},
				"2c1d99aa-15c8-452e-aebc-e5cee5f335f9": {},
				"f6685563-9e4d-4e94-9014-f9325960658b": {},
				"2ce1de98-56a1-41f9-a8f5-fb16af655c91": {},
				"3eb388cf-df76-4b11-9bf6-c7862afb9730": {},
				"149498d4-69a1-4792-b556-69ae9ebc582b": {},
				"6a0f5d41-942e-4e2f-b86e-2010e6ba978c": {},
				"bad7571b-cefe-4185-a9eb-a36c8705d8f3": {},
				"862a6d18-03fb-4abb-a86b-a0fdc5c0f4f0": {}
			}
		},
		"f59f86b5-7321-4639-aa10-ca5fc1d4dc6b": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 12,
			"y": 26,
			"width": 32,
			"height": 32,
			"object": "e044ee94-a8bc-4fd9-905e-08cd8842dd2b"
		},
		"a81b9bda-eb11-4990-83d7-d64223306e13": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 994,
			"y": 24.5,
			"width": 35,
			"height": 35,
			"object": "1d3a61a4-5097-4c52-9fef-aef7685847cf"
		},
		"84570788-5abf-429c-af22-fbb6422190c7": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 244,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "60502212-d642-414f-8ba9-8f060c6234d1"
		},
		"23e18ed0-19fd-4e58-8ef4-4e9cf024b112": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 394,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "0c2f0e4c-55c3-464d-9fb1-2ef9ae693a9e"
		},
		"b22d86be-b2ed-4cd2-9bac-7cb0068951d8": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "344,42 394,42",
			"sourceSymbol": "84570788-5abf-429c-af22-fbb6422190c7",
			"targetSymbol": "23e18ed0-19fd-4e58-8ef4-4e9cf024b112",
			"object": "e9c306f1-0e73-4a1c-8dc3-7a5a37ec6417"
		},
		"b7cb330d-47cf-47a0-88a4-1208b1a36ac6": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "494,42 544,42",
			"sourceSymbol": "23e18ed0-19fd-4e58-8ef4-4e9cf024b112",
			"targetSymbol": "f6685563-9e4d-4e94-9014-f9325960658b",
			"object": "a3487bb1-f67e-433b-99ad-cd53208fc1ea"
		},
		"fb63fc87-ab89-4a60-a8de-5c2f6b0dfc94": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 844,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "a0db6fed-3ef0-4fd0-91e7-92639992d626"
		},
		"2c1d99aa-15c8-452e-aebc-e5cee5f335f9": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "944,42 994,42",
			"sourceSymbol": "fb63fc87-ab89-4a60-a8de-5c2f6b0dfc94",
			"targetSymbol": "a81b9bda-eb11-4990-83d7-d64223306e13",
			"object": "7d9ed207-3c38-485b-b638-9ebef6b18c46"
		},
		"f6685563-9e4d-4e94-9014-f9325960658b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 544,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "50a75e7c-efba-4399-a513-e64c6d94b0c0"
		},
		"2ce1de98-56a1-41f9-a8f5-fb16af655c91": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 694,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "da566d11-6751-4860-8337-8446fa1793d3"
		},
		"3eb388cf-df76-4b11-9bf6-c7862afb9730": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "644,42 694,42",
			"sourceSymbol": "f6685563-9e4d-4e94-9014-f9325960658b",
			"targetSymbol": "2ce1de98-56a1-41f9-a8f5-fb16af655c91",
			"object": "c74677cf-c3b7-4451-b1a3-0d8f6d2ad9ea"
		},
		"149498d4-69a1-4792-b556-69ae9ebc582b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "794,42 844,42",
			"sourceSymbol": "2ce1de98-56a1-41f9-a8f5-fb16af655c91",
			"targetSymbol": "fb63fc87-ab89-4a60-a8de-5c2f6b0dfc94",
			"object": "3b598322-e1f7-4fff-9d9c-7b8cc34afe17"
		},
		"9c7b65ba-6a21-448c-86bc-24b5d80fc6b4": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"maildefinition": 2,
			"sequenceflow": 17,
			"startevent": 1,
			"endevent": 1,
			"usertask": 1,
			"servicetask": 4,
			"scripttask": 2,
			"mailtask": 2,
			"exclusivegateway": 1
		},
		"5fa613d8-ebab-4ab8-9722-d8693f2b7873": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition1",
			"to": "${context.u.aM}",
			"cc": "${context.u.e}",
			"subject": "New reservation request from ${context.u.n}",
			"reference": "/webcontent/cv19approvalwf/wf_approval_email_template.html",
			"id": "maildefinition1"
		},
		"c6738ff7-2a2f-4caa-be44-c76bc240c1d6": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition2",
			"to": "${context.u.e}",
			"cc": "${context.u.aM}",
			"subject": "${context.cv19Data.emailSubject}",
			"reference": "/webcontent/cv19approvalwf/response_email_body.html",
			"id": "maildefinition2"
		},
		"4be59b7f-7cca-48e7-aef4-01e9574ce469": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/CV19ApprovalWF/create_task_link_js.js",
			"id": "scripttask2",
			"name": "Create task link"
		},
		"6a0f5d41-942e-4e2f-b86e-2010e6ba978c": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 94,
			"y": 12,
			"width": 100,
			"height": 60,
			"object": "4be59b7f-7cca-48e7-aef4-01e9574ce469"
		},
		"face8d80-d8c2-43f0-9ca9-304ac36ef2b0": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow16",
			"name": "SequenceFlow16",
			"sourceRef": "e044ee94-a8bc-4fd9-905e-08cd8842dd2b",
			"targetRef": "4be59b7f-7cca-48e7-aef4-01e9574ce469"
		},
		"bad7571b-cefe-4185-a9eb-a36c8705d8f3": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "44,42 94,42",
			"sourceSymbol": "f59f86b5-7321-4639-aa10-ca5fc1d4dc6b",
			"targetSymbol": "6a0f5d41-942e-4e2f-b86e-2010e6ba978c",
			"object": "face8d80-d8c2-43f0-9ca9-304ac36ef2b0"
		},
		"e6479bcf-bc06-4433-80e0-5eb08057f369": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow17",
			"name": "SequenceFlow17",
			"sourceRef": "4be59b7f-7cca-48e7-aef4-01e9574ce469",
			"targetRef": "60502212-d642-414f-8ba9-8f060c6234d1"
		},
		"862a6d18-03fb-4abb-a86b-a0fdc5c0f4f0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "194,42 244,42",
			"sourceSymbol": "6a0f5d41-942e-4e2f-b86e-2010e6ba978c",
			"targetSymbol": "84570788-5abf-429c-af22-fbb6422190c7",
			"object": "e6479bcf-bc06-4433-80e0-5eb08057f369"
		}
	}
}