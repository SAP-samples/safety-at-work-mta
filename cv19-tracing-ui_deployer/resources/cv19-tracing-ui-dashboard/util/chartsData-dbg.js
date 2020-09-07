sap.ui.define([
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format'
], function (ChartFormatter,Format) {
	"use strict";
    // Format.numericFormatter(ChartFormatter.getInstance());
    // var formatPattern = ChartFormatter.DefaultPattern;
	return {
        vizProperties: {
            plotArea: {
                /*
                dataPointStyle: {
                    "rules" : [
                        {
                            "dataContext":
                                {"Revenue": {min: 5800000}},
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticGood"
                            },
                            "displayName": "> 5.8M"
                        },
                        {
                            "dataContext":
                                {"Revenue": {min: 2700000, max: 5800000}},
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticCritical"
                            },
                            "displayName": "2.7M - 5.8M"
                        },
                        {
                            "dataContext":
                                {"Revenue": {max: 2700000}},
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticBad"
                            },
                            "displayName": "< 2.7M"
                        }
                    ]
                }
                */
                dataPointStyle: {
                    "rules" : [
                        {
                            "dataContext":{
                                "Avg": {
                                    min: 126
                                }
                            },
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticBad"
                            },
                            "displayName": "> 125%"
                        },
                        {
                            "dataContext":{
                                "Avg": {
                                    min: 101,
                                    max: 125
                                }
                            },
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticCritical"
                            },
                            "displayName": "100 - 125%"
                        },
                        {
                            "dataContext":{
                                "Avg": {
                                    min: 0,
                                    max: 100
                                }
                            },
                            "properties": {
                                    "color":"sapUiChartPaletteSemanticGood"
                            },
                            "displayName": "< 100%"
                        },
                        {
                            "dataContext":{
                                "Avg": ""
                            },
                            "properties": {
                                    "color":"#000000"
                            },
                            "displayName": "No Values Available"
                        }
                    ]
                },

                background: {
                    border: {
                        top: {
                            visible: false
                        },
                        bottom: {
                            visible: false
                        },
                        left: {
                            visible: false
                        },
                        right: {
                            visible: false
                        }
                    }
                },
                dataLabel: {
                    // formatString:formatPattern.SHORTFLOAT_MFD2,
                    visible: false
                }
            },
            categoryAxis: {
                title: {
                    visible: false
                }
            },
            categoryAxis2: {
                title: {
                    visible: false
                }
            },
            legend: {
                visible: true,
                // formatString:formatPattern.SHORTFLOAT,
                title: {
                    visible: false
                }
            },
            title: {
                visible: false,
                text: 'Avg by City and Store Name'
            }
        }
    };
});