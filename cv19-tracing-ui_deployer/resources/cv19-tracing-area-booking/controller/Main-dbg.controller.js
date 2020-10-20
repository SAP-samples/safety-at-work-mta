sap.ui.define(
	[
		"cv19/tracing/area/booking/cv19-tracing-area-booking/controller/BaseController",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		'sap/m/GroupHeaderListItem',
		"sap/ui/core/Fragment",
		"sap/m/MessageToast"
	],
	function (BaseController, FilterOperator, Filter, Sorter, GroupHeaderListItem, Fragment, MessageToast) {
		"use strict";

		return BaseController.extend(
			"cv19.tracing.area.booking.cv19-tracing-area-booking.controller.Main",
			{
				__targetName: "Main",

				getGroupHeader: function (oGroup){
					return new GroupHeaderListItem({
						title: this.getTranslation("areaName",[oGroup.key]),
						upperCase: false
					});
				},

				onRouteMatched: function () {
					this.__setLayout("OneColumn");
				},

				onMyBoogingListItemPress: async function(oEvent){
					var oItem = oEvent.getSource(),
						oBooking = oItem.getBindingContext().getObject();

					this.__bookingDetails = oBooking;

					if (!this._oActionSheet) {
						this._oActionSheet = await Fragment.load({
							id: "reservationMenuActionSheet",
							name: "cv19.tracing.area.booking.cv19-tracing-area-booking.view.fragment.Main.F0_ReservationMenuActionSheet",
							controller: this
						});
		
						this.getView().addDependent(this._oActionSheet);
					}
					this._oActionSheet.openBy(oItem);
				},

				onNewBookingButtonPress: function(){
					this.getRouter().navTo(
						"New",
						{},
						false
					);
				},

				onDeleteBookingMenuItemPress: function(oEvent){

					var oODataModel = this.getComponentModel("odata"),
						oBookingDetails = this.__bookingDetails,
						sReservationKey = oODataModel.createKey(
							"/ReservationSet",
							{
								ID: oBookingDetails.ReservationID
							}
						);

					this.setAppBusy(true);

					oODataModel.remove(
						sReservationKey,
						{
							success: function(){
								this.__getMyBookings();
								this.setAppBusy(false);
								MessageToast.show(
									this.getTranslation("reservationDeletedSuccessfully")
								);
							}.bind(this),

							error: function(err){
								this.__handleCommunicationErrorMessageDisplay(
									"errorDeletingReservation", 
									err
								);
								this.setAppBusy(false);
							}.bind(this)
						}
					);

				},
				
			}
		);
	}
);
