/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

/**
@function sets approval status of a reservation

@param {Object} object representing the reservation and its new status to update

@return: {Object} - [possibleInfected] number of potential EID infected
*/

function execute(obj){
	var connection = $.hdb.getConnection();
	
	if (!obj.ID || obj.ID == null) {
		var e = new Error()
		e.message = "Missing reservation ID";
		throw e;
	}
	
	if (!obj.ApprovalStatus || obj.ApprovalStatus == null) {
		var e = new Error()
		e.message = "Missing approval status to assign";
		throw e;
	}
	try{
		//check if any EID assigned to the provided DeviceID are parte of the EIDMatched column of table ProximityDetected
		var sSQL = 'UPDATE "demo.sap.presales.covid19.model::covid19.Reservation" R ';
			sSQL += ' SET "ApprovalStatus" = ? ';
			sSQL += ' where R."ID" = ?';
	
		var iResult = connection.executeUpdate(sSQL, obj.ApprovalStatus, obj.ID);
		connection.commit()
		return {
			updatedRecords: iResult
		};
	}catch(e){
		connection.rollback();
		throw e;
	}
}