/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

/**
@function import events from an external source, for example a queue of messages
@param {Object} JSON containing the list of events
@returns {int} number of imported records
*/

function execute(obj) {
	var connection = $.hdb.getConnection(),
		deviceId = obj.deviceId,
		iRes = 0;

	if (!obj.events || obj.events == null) {
		var e = new Error()
		e.message = "Missing events to import";
		throw e;
	}

	var aToImport = obj.events;

	var iCountInserted = 0,
		aSkippedRecords = [];
	for (var i = 0; i < aToImport.length; i++) {
		try {
			var oRecord = aToImport[i];
			//check if every recordo has the mandatory fields and these fileds have valid value
			if(oRecord.hasOwnProperty("CreatedAt") && oRecord.hasOwnProperty("SourceEID") && oRecord.hasOwnProperty("TargetIED") &&
				oRecord.CreatedAt && oRecord.SourceEID && oRecord.TargetIED &&
				oRecord.CreatedAt!=null && oRecord.SourceEID!=null && oRecord.TargetIED!=null){
				var oSQL = createInsertStatement(oRecord, "demo.sap.presales.covid19.model::covid19.Event");
				connection.executeUpdate(oSQL.sql, [oSQL.record]);
				iCountInserted++;
	
				connection.commit()
				
			}else{
				aSkippedRecords.push(oRecord);
			}
		} catch (e) {
			connection.rollback();
			throw e;
		}

	}

	iRes = iCountInserted;
	return {
		countImportedEvents : iRes,
		skippedRecords: aSkippedRecords
	};
}

function createInsertStatement(oSample, sTable) {
	if (oSample && oSample != null) {
		var sSql = "INSERT INTO \"" + sTable + "\" (<keys>) VALUES (<values>);";
		var aKeys = Object.keys(oSample),
			sKeys = "";
		var sValues = "";
		for (var i = 0; i < aKeys.length; i++) {
			if (aKeys[i].indexOf("metadata") < 0) {
				sValues += "?,";
				sKeys += '"' + aKeys[i] + '",';
			}
		}

		//remove last comma
		sValues = sValues.substring(0, sValues.length - 1);
		sKeys = sKeys.substring(0, sKeys.length - 1);

		//replace the placeholders
		sSql = sSql.replace("<keys>", sKeys).replace("<values>", sValues);

		//$.trace.debug("sql insert:" + sSql);

		//get bidimensional array of records values

		var aRecord = [];
		for (var name in oSample) {
			if (name.indexOf("metadata") < 0)
				aRecord.push(oSample[name]);
		}

		return {
			sql: sSql,
			record: aRecord
		};

	} else {
		return null;
	}

}