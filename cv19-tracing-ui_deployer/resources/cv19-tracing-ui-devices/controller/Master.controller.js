sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/model/Filter","sap/ui/model/Sorter","sap/ui/model/FilterOperator","sap/m/GroupHeaderListItem","sap/ui/Device","sap/ui/core/Fragment","../model/formatter"],function(e,t,i,o,a,s,r,n,l,u){"use strict";return e.extend("covid19.ui.devicesmanagement.cv19-tracing-ui-devices.controller.Master",{formatter:u,onInit:function(){var e=this._createViewModel();this.setModel(e,"masterView");this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched,this);this.getRouter().attachBypassed(this.onBypassed,this)},onSelectionChange:function(e){this._showDetail(e.getParameter("listItem")||e.getSource())},onBypassed:function(){this._oList.removeSelections(true)},createGroupHeader:function(e){return new r({title:e.text,upperCase:false})},onNavBack:function(){var e=i.getInstance().getPreviousHash(),t=sap.ushell.Container.getService("CrossApplicationNavigation");if(e!==undefined||!t.isInitialNavigation()){history.go(-1)}else{t.toExternal({target:{shellHash:"#Shell-home"}})}},_createViewModel:function(){return new t({isFilterBarVisible:false,filterBarLabel:"",delay:0,title:this.getResourceBundle().getText("masterTitleCount",[0]),noDataText:this.getResourceBundle().getText("masterListNoDataText"),sortBy:"Description",groupBy:"None"})},_onMasterMatched:function(){this.getModel("appView").setProperty("/layout","OneColumn")},_showDetail:function(e){var t=!n.system.phone;this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");this.getRouter().navTo("object",{objectId:e.getBindingContext().getProperty("DeviceID")},t)}})});