sap.ui.define([], function () {
	"use strict";

	return {

		translateText: function (value) {
			if (value) {
				return this.getTranslation(value);
			}
		},

		// capacity : 100 = measured : x -> x = (measured * 100) : capacity
		setPercentageFromMeasuredValue: function (measured, capacity) {
			if (!measured) {
				return 0;
			}
			return parseInt(
				(parseInt(measured) * 100) / capacity
			);
		},

		realTimeDeviceSituationColor: function (value) {
			/*
			    Returned colors (sap.m.ValueColor)
			        - Critical
			        - Error
			        - Good
			        - Neutral
			*/
			if (value <= 100) {
				return 'Good';
			}
			if (value > 100 && value <= 125) {
				return "Critical";
			}

			if (value > 125) {
				return "Error";
			}
		},

		getCapacityPercentage: function (aValues) {
			if (aValues != null) {
				console.log(aValues);
				var fAvg = aValues[0],
					iCapacity = aValues[1];
				return fAvg * 100 / iCapacity;
			} else {
				return null;
			}
		},
		
		getLocalTimeFrame: function(sValue){
			if(sValue && sValue!=null){
				var aHours = sValue.split(" - "),
				d = new Date(),
				n = d.getTimezoneOffset() / -60,
				iFrom = parseInt(aHours[0])+n,
				iTo = parseInt(aHours[1])+n;
				
				return iFrom + " - " + iTo;
			}else{
				return "";
			}
		}

	};
});