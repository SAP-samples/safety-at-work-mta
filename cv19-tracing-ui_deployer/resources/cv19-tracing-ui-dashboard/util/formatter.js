sap.ui.define([],function(){"use strict";return{translateText:function(e){if(e){return this.getTranslation(e)}},setPercentageFromMeasuredValue:function(e,r){if(!e){return 0}return parseInt(parseInt(e)*100/r)},realTimeDeviceSituationColor:function(e){if(e<=100){return"Good"}if(e>100&&e<=125){return"Critical"}if(e>125){return"Error"}},getCapacityPercentage:function(e){if(e!=null){console.log(e);var r=e[0],t=e[1];return r*100/t}else{return null}},getLocalTimeFrame:function(e){if(e&&e!=null){var r=e.split(" - "),t=new Date,n=t.getTimezoneOffset()/-60,i=parseInt(r[0])+n,u=parseInt(r[1])+n;return i+" - "+u}else{return""}}}});