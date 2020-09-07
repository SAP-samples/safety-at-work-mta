sap.ui.define(["sap/ui/test/Opa5","sap/ui/test/actions/Press","./Common","sap/ui/test/matchers/AggregationLengthEquals","sap/ui/test/matchers/AggregationFilled","sap/ui/test/matchers/PropertyStrictEquals"],function(e,t,i,n,s,r){"use strict";var o="Detail";e.createPageObjects({onTheDetailPage:{baseClass:i,actions:{iPressTheHeaderActionButton:function(e){return this.waitFor({id:e,viewName:o,actions:new t,errorMessage:"Did not find the button with id"+e+" on detail page"})},iPressOnTheShareButton:function(){return this.waitFor({controlType:"sap.m.Button",viewName:o,matchers:new r({name:"icon",value:"sap-icon://action"}),actions:new t,errorMessage:"Did not find the share button on detail page"})},iPressOnTheSaveAsTileButton:function(){return this.waitFor({controlType:"sap.ushell.ui.footerbar.AddBookmarkButton",searchOpenDialogs:true,viewName:o,actions:new t,errorMessage:"Did not find the save as tile button on detail page"})}},assertions:{iShouldSeeNoBusyIndicator:function(){return this.waitFor({id:"detailPage",viewName:o,matchers:function(e){return!e.getBusy()},success:function(t){e.assert.ok(!t.getBusy(),"The detail view is not busy")},errorMessage:"The detail view is busy."})},theObjectPageShowsTheFirstObject:function(){return this.iShouldBeOnTheObjectNPage(0)},iShouldBeOnTheObjectNPage:function(t){return this.waitFor(this.createAWaitForAnEntitySet({entitySet:"InfectedSet",success:function(i){var n=i[t].Name;this.waitFor({controlType:"sap.m.ObjectHeader",viewName:o,matchers:new r({name:"title",value:i[t].Name}),success:function(){e.assert.ok(true,"was on the first object page with the name "+n)},errorMessage:"First object is not shown"})}}))},iShouldSeeTheRememberedObject:function(){return this.waitFor({success:function(){var e=this.getContext().currentItem.bindingPath;this._waitForPageBindingPath(e)}})},_waitForPageBindingPath:function(t){return this.waitFor({id:"detailPage",viewName:o,matchers:function(e){return e.getBindingContext()&&e.getBindingContext().getPath()===t},success:function(i){e.assert.strictEqual(i.getBindingContext().getPath(),t,"was on the remembered detail page")},errorMessage:"Remembered object "+t+" is not shown"})},iShouldSeeTheObjectLineItemsList:function(){return this.waitFor({id:"lineItemsList",viewName:o,success:function(t){e.assert.ok(t,"Found the line items list.")}})},theLineItemsListShouldHaveTheCorrectNumberOfItems:function(){return this.waitFor(this.createAWaitForAnEntitySet({entitySet:"",success:function(t){return this.waitFor({id:"lineItemsList",viewName:o,matchers:new s({name:"items"}),check:function(e){var i=e.getBindingContext().getProperty("ID");var n=t.filter(function(e){return e.ID===i}).length;return e.getItems().length===n},success:function(){e.assert.ok(true,"The list has the correct number of items")},errorMessage:"The list does not have the correct number of items.\nHint: This test needs suitable mock data in localService directory which can be generated via SAP Web IDE"})}}))},theLineItemsHeaderShouldDisplayTheAmountOfEntries:function(){return this.waitFor({id:"lineItemsList",viewName:o,matchers:new s({name:"items"}),success:function(t){var i=t.getItems().length;return this.waitFor({id:"lineItemsTitle",viewName:o,matchers:new r({name:"text",value:"<Plural> ("+i+")"}),success:function(){e.assert.ok(true,"The line item list displays "+i+" items")},errorMessage:"The line item list does not display "+i+" items."})}})},iShouldSeeHeaderActionButtons:function(){return this.waitFor({id:["closeColumn","enterFullScreen"],viewName:o,success:function(){e.assert.ok(true,"The action buttons are visible")},errorMessage:"The action buttons were not found"})},theShareTileButtonShouldContainTheRememberedObjectName:function(){return this.waitFor({controlType:"sap.ushell.ui.footerbar.AddBookmarkButton",searchOpenDialogs:true,viewName:o,matchers:function(e){var t=this.getContext().currentItem.title;var i=e.getTitle();return i&&i.indexOf(t)>-1}.bind(this),success:function(){e.assert.ok(true,"The Save as Tile button contains the oject name")},errorMessage:"The Save as Tile did not contain the object name"})},iShouldSeeTheShareActionButtons:function(){return this.waitFor({id:["shareEmail","shareTile"],viewName:o,success:function(){e.assert.ok(true,"The share action buttons are visible")},errorMessage:"One or more of the share action buttons is not visible"})},iShouldSeeTheFullScreenToggleButton:function(e){return this.waitFor({id:e,viewName:o,errorMessage:"The toggle button"+e+"was not found"})}}}})});