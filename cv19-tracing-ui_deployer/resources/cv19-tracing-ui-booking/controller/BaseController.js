sap.ui.define(["jquery.sap.global","sap/m/MessageBox","sap/m/MessageToast","sap/ui/core/mvc/Controller","sap/ui/core/routing/History","covid19/ui/booking/cv19-tracing-ui-booking/util/formatter","sap/ui/model/Sorter","sap/ui/model/Filter","sap/ui/core/Fragment"],function(e,t,n,o,r,i,a,s,u){"use strict";return o.extend("covid19.ui.dashboard.cv19-tracing-ui-dashboard.controller.BaseController",{__targetName:null,__MESSAGE_BOX_CHANNEL:"message_box",__MESSAGE_BOX_EVENT:"fired",__TOAST_ERROR:"error",__TOAST_INFO:"info",__TOAST_WARNING:"warning",__TOAST_SUCCESS:"success",_tableColumnsSettingsDialog:null,formatter:i,logger:null,onInit:function(){if(this.__targetName!==undefined&&this.__targetName!==null){var e=typeof this.__targetName==="string"?[this.__targetName]:this.__targetName;for(var t=0;t<e.length;t++){var n=this.getRouter().getRoute(e[t]);if(n){n.attachPatternMatched(this._onRouteMatched,this)}}}this.logger=this.getOwnerComponent().logger;this._onInit.apply(this)},_onInit:function(){},onAfterRendering:async function(){try{var e=this.getComponentModel(),t=await this._getUserInfos();e.setProperty("/user",t)}catch(e){console.error(e)}},setAppBusy:function(e){this.getComponentModel().setProperty("/busy",e)},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(){this.getRouter().navTo("Main",{},false)},navTo:function(e,t,n){this.getRouter().navTo(e,t,n)},_onRouteMatched:function(e){var t=e.getParameters().arguments;var n=[e,e.getParameters().name];for(var o in t){if(t.hasOwnProperty(o)){var r=t[o];n.push(r)}}this.onRouteMatched.apply(this,n)},onRouteMatched:function(e,t){},getComponentModel:function(e){var t=this.getOwnerComponent();var n=e==null||e===undefined?t.getModel():t.getModel(e);return n},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},getTranslation:function(e,t){if(t===undefined||t===null){return this.getResourceBundle().getText(e)}else{return this.getResourceBundle().getText(e,t)}},getFragmentControlById:function(e,t){var n=u.createId(e,t);return sap.ui.getCore().byId(n)},sendEvent:function(e,t,n){sap.ui.getCore().getEventBus().publish(e,t,n)},subscribe:function(e,t,n,o){sap.ui.getCore().getEventBus().subscribe(e,t,n,o)},unSubscribe:function(e,t,n,o){sap.ui.getCore().getEventBus().unsubscribe(e,t,n,o)},_getUserInfos:function(){return new Promise(function(e,t){$.ajax({url:"/js_api/userInfo",method:"GET",dataType:"json",context:this,success:function(t){e(t)},error:function(e,n,o){var r="Error retrieving user info\nError"+e.status+" - "+e.responseText;t(r)}})})},_generateUuidv4:function(){return"xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=Math.random()*16|0,n=e=="x"?t:t&3|8;return n.toString(16)})},_setSelectedPage:function(e){var t=this.getComponentModel("local");t.setProperty("/selectedPage",e)},_getSelectedView:function(){return this.getOwnerComponent().__selectedView},_setSelectedView:function(e){this.getOwnerComponent().__selectedView=e},__getUTCDate(e){return new Date(e.getTime()+e.getTimezoneOffset()*6e4)},__formatDateString:function(e){var t=sap.ui.core.format.DateFormat.getInstance({format:"yMMMd"});return t.format(e)},__formatDateTimeString:function(e){var t=sap.ui.core.format.DateFormat.getDateTimeInstance({format:"yMMMdHHmm"});return t.format(e)},__getLocationUrl:function(){return window.location.protocol+"//"+window.location.host}})});