sap.ui.define(["sap/ui/test/opaQunit","sap/ui/Device","./pages/App","./pages/Master"],function(e,a){"use strict";var i=a.browser.msie||a.browser.edge?1500:1e3;QUnit.module("Desktop busy indication");e("Should see a global busy indication while loading the metadata",function(e,a,t){e.iStartMyFLPApp({intent:"ManageNotifactionofInfection-display",delay:i});t.onTheAppPage.iShouldSeeTheBusyIndicator()});e("Should see a busy indication on the master after loading the metadata",function(e,a,i){i.onTheMasterPage.iShouldSeeTheBusyIndicator();i.iLeaveMyFLPApp()})});