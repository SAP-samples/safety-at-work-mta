sap.ui.define(["sap/ui/test/opaQunit","./pages/Master","./pages/Browser","./pages/Detail"],function(e){"use strict";QUnit.module("Phone navigation");e("Should see the objects list",function(e,t,i){e.iStartMyFLPApp({intent:"DevicesManagement-display"});i.onTheMasterPage.iShouldSeeTheList();i.onTheBrowserPage.iShouldSeeAnEmptyHash()});e("Should react on hash change",function(e,t,i){t.onTheMasterPage.iRememberTheIdOfListItemAtPosition(1);t.onTheBrowserPage.iChangeTheHashToTheRememberedItem();i.onTheDetailPage.iShouldSeeTheRememberedObject()});e("Detail Page Shows Object Details",function(e,t,i){i.onTheDetailPage.iShouldSeeTheObjectLineItemsList().and.theLineItemsListShouldHaveTheCorrectNumberOfItems().and.theLineItemsHeaderShouldDisplayTheAmountOfEntries()});e("Should navigate on press",function(e,t,i){t.onTheDetailPage.iPressTheHeaderActionButton("closeColumn");t.onTheMasterPage.iRememberTheIdOfListItemAtPosition(2).and.iPressOnTheObjectAtPosition(2);i.onTheDetailPage.iShouldSeeTheRememberedObject();i.iLeaveMyFLPApp()})});