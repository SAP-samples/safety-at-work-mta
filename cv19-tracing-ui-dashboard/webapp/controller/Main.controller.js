sap.ui.define([
	"covid19/ui/dashboard/cv19-tracing-ui-dashboard/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"covid19/ui/dashboard/cv19-tracing-ui-dashboard/util/chartsData",
], function (BaseController, Filter, Sorter, chartsData) {
	"use strict";

	return BaseController.extend("covid19.ui.dashboard.cv19-tracing-ui-dashboard.controller.Main", {

		__targetName: "Main",

		// Array that contains all filters of FilterBar
		__savedFilters: [],
		__statusFilters: [],

		//set default initial dates to setup heatmap
		__initDateRange: {
			dStart: new Date("2020-01-01"),
			dEnd: new Date()
		},

		__selectedDateRange: {
			dStart: null,
			dEnd: null
		},

		onRouteMatched: function () {
			this.initHeatmapChart();
		},

		//////////////////////////////////
		// ANCHOR onAfterRendering event//
		//////////////////////////////////
		onAfterRendering: function () {
			var sFragmentId = this.getView().createId("F00_DynamicPageHeaderFilterBar"),
				oMultiComboBox = this.getFragmentControlById(sFragmentId, "tagsMultiComboBoxFilter");

			/*
			    Add custom filter function to:
			    - apply "Contains" filtering criteria,
			    - make it a case insensitive search,
			*/
			oMultiComboBox.setFilterFunction(function (sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				var sItemText = oItem.getText().toLowerCase(),
					sSearchTerm = sTerm.toLowerCase();

				return (sItemText.indexOf(sSearchTerm) > -1);
			});
		},

		//////////////////////////////////////
		// ANCHOR Search event of FilterBar //
		//////////////////////////////////////

		onFilterBarSearch: function (oEvent) {
			/*var oM = this.getView().getModel("odata");

			var oContext = oM.createEntry("/EventTempSet", {
				properties: {
					CreatedA: new Date(),
					Distance: null,
					SourceEID: "80 e8 2b 04 80 c4 d9 ae 1f 3e c5 28 76 bd 42 8a ",
					TargetIED: "6a b7 aa e9 f3 94 87 b5 a8 13 86 85 32 d8 b4 17 "
				}
			});
		
			// submit the changes (creates entity at the backend)
			oM.submitChanges({
				success: function (o) {
					console.log(o)
				},
				error: function (o) {
					console.log(o)
				}
			});*/

			var oTable = this._getRealTimeTable(),
				oHeatMapChart = this._getHistoricHeatmapChart();

			this.__savedFilters = this._getAllFilters(oEvent);

			this._applyFiltersToRealTimeTable(oTable, true);
			this._applyFiltersToHeatMapChart(oHeatMapChart, true);
		},

		//////////////////////////
		// ANCHOR Real time tab //
		//////////////////////////

		onTableColumnHeaderButtonPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				sFilterProperty = oButton.data("sorterProperty"),
				bDescending = !(oButton.data("descending") === 'true'),
				oTable = this._getRealTimeTable();

			this.__setAllColumnButtonsTransparent(oTable);

			oTable.getBinding("items").sort(
				new Sorter(
					sFilterProperty,
					bDescending
				)
			);

			oButton.getCustomData()[1].setValue("" + bDescending);

			oButton.setIcon(
				(bDescending) ? 'sap-icon://sort-descending' : 'sap-icon://sort-ascending'
			);
			oButton.setType("Emphasized");
		},

		////////////////////////////////////////////////////
		// ANCHOR Realtime table device statuse MCB Change//
		////////////////////////////////////////////////////
		onRealTimeTableDeviceStatusesMCBChange: function (oEvent) {
			var oMCB = oEvent.getSource(),
				aSelectedItems = oMCB.getSelectedItems(),
				oTable = this._getRealTimeTable(),
				aFilters = [];

			for (var i in aSelectedItems) {
				var sKey = aSelectedItems[i].getKey(),
					oFilter = null;

				switch (sKey) {
				case "ok":
					aFilters.push(
						new Filter(
							"MeasuredPercentage",
							"LE",
							100
						)
					);
					break;

				case "warning":
					var aTempFilters = [];
					aTempFilters.push(
						new Filter(
							"MeasuredPercentage",
							"GT",
							100
						)
					);
					aTempFilters.push(
						new Filter(
							"MeasuredPercentage",
							"LE",
							125
						)
					);
					aFilters.push(
						new Filter(aTempFilters, true)
					);
					break;

				case "error":
					aFilters.push(
						new Filter(
							"MeasuredPercentage",
							"GT",
							125
						)
					);
					break;
				}
			}

			this.__statusFilters = (aFilters.length > 0) ? new Filter(aFilters, false) : [];

			this._applyFiltersToRealTimeTable(oTable);
		},

		////////////////////////////////
		// ANCHOR Historic heatmap tab//
		////////////////////////////////
		initHeatmapChart: function () {

			var sFragmentId = this.getView().createId("F02_HistoryDataHeatmapTab"),
				oVizFrame = this.getFragmentControlById(sFragmentId, "heatmapChart");
			oVizFrame.setVizProperties(chartsData.vizProperties);

			var oPopOver = this.getFragmentControlById(sFragmentId, "heatmapPopOver");
			oPopOver.connect(oVizFrame.getVizUid());

			oVizFrame.getDataset().bindData({
				model: "odata",
				path: "/HistoryDevicesStatusParameters(StartDate='" + this.__initDateRange.dStart.toISOString() + "',%20EndDate='" + this.__initDateRange
					.dEnd.toISOString() + "')/Results",
				sorter: new Sorter("TimeFrame", false)
			});
			//oVizFrame.getDataset().getBinding('data').resume();
			// oPopOver.setFormatString(formatPattern.STANDARDFLOAT);
		},

		///////////////////////////////////////////////////////////////
		// ANCHOR Private method -  __setAllColumnButtonsTransparent //
		///////////////////////////////////////////////////////////////
		__setAllColumnButtonsTransparent: function (oTable) {
			var aColumns = oTable.getColumns();
			for (var i in aColumns) {
				var oColumn = aColumns[i],
					oButton = oColumn.getHeader();

				if (oButton.getMetadata().getElementName() !== "sap.m.Text") {
					oButton.setType("Transparent");
					oButton.setIcon("sap-icon://sorting-ranking");
				}
			}
		},

		////////////////////////////////////////////////
		// ANCHOR Private method - _getRealTimeTable  //
		////////////////////////////////////////////////
		_getRealTimeTable: function () {
			var sFragmentId = this.getView().createId("F01_RealTimeDevicesSituationTab"),
				oTable = this.getFragmentControlById(sFragmentId, "realTimeDeviceMonitorTable");

			return oTable;
		},

		///////////////////////////////////////////////////////
		// ANCHOR Private method - _getHistoricHeatmapChart  //
		///////////////////////////////////////////////////////
		_getHistoricHeatmapChart: function () {
			var sFragmentId = this.getView().createId("F02_HistoryDataHeatmapTab"),
				oChart = this.getFragmentControlById(sFragmentId, "heatmapChart");

			return oChart;
		},

		////////////////////////////////////////////
		// ANCHOR Private method - _getAllFilters //
		////////////////////////////////////////////
		_getAllFilters: function (oEvent) {
			var oFilterBar = oEvent.getSource(),
				aFGI = oFilterBar.getFilterGroupItems(),

				// Get filter items
				oDeviceDescriptionInput = aFGI[0].getControl(),
				oDeviceTagsMCB = aFGI[1].getControl(),
				oDateRangeDP = aFGI[2].getControl(),

				// Array of filter objects
				aFilters = [];

			///////////////////////////
			// Create Filter objects //
			///////////////////////////

			/* Device Description */
			var sQuery = oDeviceDescriptionInput.getValue();
			if (sQuery) {
				aFilters.push(
					new Filter({
						path: "Description",
						opeartor: "Contains",
						value1: sQuery,
						caseInsensitive: true
					})
				);
			}

			/* Event Date */
			var oStartDate = oDateRangeDP.getDateValue(),
				oEndDate = oDateRangeDP.getSecondDateValue();

			// save current selected time range in global var to use it when apply search
			if (oStartDate && oEndDate) {
				//in ca
				this.__selectedDateRange.dStart = oStartDate !== null ? oStartDate : this.__initDateRange.dStart;
				this.__selectedDateRange.dEnd = oEndDate !== null ? oEndDate : new Date();

			}

			/* Event Type */
			var oDeviceTags = oDeviceTagsMCB.getSelectedItems(),
				oDeviceTagsFilters = this.__getFiltersFromItemsCollection(oDeviceTags, "TagsString");

			if (oDeviceTagsFilters) {
				aFilters.push(oDeviceTagsFilters);
			}

			// Put filters in AND
			if (aFilters.length > 0) {
				aFilters = new Filter(aFilters, true);
				return aFilters;
			} else {
				return [];
			}
		},

		////////////////////////////////////////////////////////////
		// ANCHOR Private method - __getFiltersFromItemsCollection//
		////////////////////////////////////////////////////////////
		__getFiltersFromItemsCollection: function (aCollection, sPropertyName) {
			var aReturn = [];
			for (var i in aCollection) {
				aReturn.push(
					new Filter(
						sPropertyName,
						"Contains",
						aCollection[i].getKey()
					)
				);
			}
			return (aReturn.length > 0) ? new Filter(aReturn, false) : null;
		},

		//////////////////////////////////////////////////////////
		// ANCHOR Private method - _applyFiltersToRealTimeTable //
		//////////////////////////////////////////////////////////
		_applyFiltersToRealTimeTable: function (oTable, bResume) {
			var aFilters = [];

			if (this.__savedFilters.hasOwnProperty("aFilters") && this.__savedFilters.aFilters.length > 0) {
				aFilters.push(this.__savedFilters);
			}

			if (this.__statusFilters.hasOwnProperty("aFilters") && this.__statusFilters.aFilters.length > 0) {
				aFilters.push(this.__statusFilters);
			}

			if (aFilters.length > 0) {
				oTable.getBinding("items").filter(
					new Filter(
						aFilters,
						true
					)
				);
			}else{
				oTable.getBinding("items").filter([]);
			}


			if (bResume) {
				oTable.getBinding("items").resume();
			}

		},

		/////////////////////////////////////////////////////////
		// ANCHOR Private method - _applyFiltersToHeatMapChart //
		/////////////////////////////////////////////////////////
		_applyFiltersToHeatMapChart: function (oChart) {
			var aFilters = [];

			if (this.__savedFilters.hasOwnProperty("aFilters") && this.__savedFilters.aFilters.length > 0) {
				aFilters.push(this.__savedFilters);
			}

			if (this.__statusFilters.hasOwnProperty("aFilters") && this.__statusFilters.aFilters.length > 0) {
				aFilters.push(this.__statusFilters);
			}

			if (aFilters.length > 0 || (this.__selectedDateRange.dStart!=null || this.__selectedDateRange.dEnd!=null)) {
				var sStart = this.__selectedDateRange.dStart!=null?this.__selectedDateRange.dStart.toISOString():this.__initDateRange.dStart.toISOString();
				var sEnd = this.__selectedDateRange.dEnd!=null?this.__selectedDateRange.dEnd.toISOString():this.__initDateRange.dEnd.toISOString();
				oChart.getDataset().bindData({
					model: "odata",
					path: "/HistoryDevicesStatusParameters(StartDate='" + sStart + "', EndDate='" + sEnd + "')/Results",
					sorter: new Sorter("TimeFrame", false),
					filters: aFilters
				});
			}

		}

	});
});