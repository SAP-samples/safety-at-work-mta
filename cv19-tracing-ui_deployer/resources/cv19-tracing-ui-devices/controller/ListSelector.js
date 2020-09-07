sap.ui.define(["sap/ui/base/Object","sap/base/Log"],function(t,e){"use strict";return t.extend("covid19.ui.devicesmanagement.cv19-tracing-ui-devices.controller.ListSelector",{constructor:function(){this._oWhenListHasBeenSet=new Promise(function(t){this._fnResolveListHasBeenSet=t}.bind(this));this.oWhenListLoadingIsDone=new Promise(function(t,e){this._oWhenListHasBeenSet.then(function(i){i.getBinding("items").attachEventOnce("dataReceived",function(){if(this._oList.getItems().length){t({list:i})}else{e({list:i})}}.bind(this))}.bind(this))}.bind(this))},setBoundMasterList:function(t){this._oList=t;this._fnResolveListHasBeenSet(t)},selectAListItem:function(t){this.oWhenListLoadingIsDone.then(function(){var e=this._oList,i;if(e.getMode()==="None"){return}i=e.getSelectedItem();if(i&&i.getBindingContext().getPath()===t){return}e.getItems().some(function(i){if(i.getBindingContext()&&i.getBindingContext().getPath()===t){e.setSelectedItem(i);return true}})}.bind(this),function(){e.warning("Could not select the list item with the path"+t+" because the list encountered an error or had no items")})},clearMasterListSelection:function(){this._oWhenListHasBeenSet.then(function(){this._oList.removeSelections(true)}.bind(this))}})});