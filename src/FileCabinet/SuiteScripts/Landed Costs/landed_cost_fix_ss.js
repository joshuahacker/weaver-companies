/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
	"N/ui/serverWidget",
	"N/search",
	"N/record",
	"N/url",
	"N/log",
], function (serverWidget, search, record, url, log) {
	function onRequest(context) {
		if (context.request.method === "GET") {
			var form = serverWidget.createForm({
				title: "Landed Cost Adjustment",
			});

			var purchaseOrderToVendorBillMap = {};

			var vendorBillSearch = search.create({
				type: search.Type.VENDOR_BILL,
				filters: [
					["item", search.Operator.ANYOF, ["3393", "4995"]], // Freight and Custom Duties Item IDs
				],
				columns: [
					"internalid",
					"createdfrom",
					"tranid", // Transaction ID of the Vendor Bill
				],
			});

			vendorBillSearch.run().each(function (result) {
				var poId = result.getValue({ name: "createdfrom" });
				var billId = result.getValue({ name: "internalid" });
				var billTranId = result.getValue({ name: "tranid" });
				purchaseOrderToVendorBillMap[poId] = {
					billId: billId,
					billTranId: billTranId,
				};
				return true;
			});

			// Second Search: Item Receipts Linked to Those Purchase Orders
			var itemReceiptSearch = search.create({
				type: search.Type.ITEM_RECEIPT,
				filters: [
					["mainline", search.Operator.IS, "T"],
					"AND",
					[
						"createdfrom",
						search.Operator.ANYOF,
						Object.keys(purchaseOrderToVendorBillMap),
					],
				],
				columns: [
					search.createColumn({ name: "internalid" }),
					search.createColumn({ name: "tranid" }), // Item receipt transaction ID
					search.createColumn({ name: "trandate" }), // Transaction date
					search.createColumn({
						name: "tranid",
						join: "createdFrom", // Join with the created from record (Purchase Order)
					}),
					search.createColumn({
						name: "memo",
						join: "createdFrom", // Get memo from the Purchase Order
					}),
					search.createColumn({ name: "createdfrom" }),
				],
			});

			// Create a sublist to display item receipts
			var list = form.addSublist({
				id: "custpage_itemreceipt_list",
				type: serverWidget.SublistType.LIST,
				label: "Item Receipts",
			});

			// Add columns to the sublist
			list.addMarkAllButtons();
			list.addField({
				id: "custpage_select",
				type: serverWidget.FieldType.CHECKBOX,
				label: "Select",
			});
			list.addField({
				id: "custpage_date",
				type: serverWidget.FieldType.TEXT,
				label: "Date",
			});
			list.addField({
				id: "custpage_internal_id",
				type: serverWidget.FieldType.TEXT,
				label: "Internal ID",
			});

			list.addField({
				id: "custpage_tranid",
				type: serverWidget.FieldType.TEXT,
				label: "Tran ID",
			});

			list.addField({
				id: "custpage_po_tranid",
				type: serverWidget.FieldType.TEXT,
				label: "PO Tran ID",
			});
			list.addField({
				id: "custpage_vendor_bill_tranid",
				type: serverWidget.FieldType.TEXT,
				label: "Vendor Bill Number",
			});
			list.addField({
				id: "custpage_memo",
				type: serverWidget.FieldType.TEXT,
				label: "PO Memo",
			});

			var line = 0;
			itemReceiptSearch.run().each(function (result) {
				// Retrieve each field value or set a default value if it doesn't exist
				var internalId = result.getValue({ name: "internalid" }) || "";
				var tranId = result.getValue({ name: "tranid" }) || "";
				var trandate = result.getValue({ name: "trandate" }) || "";
				var poId = result.getValue({ name: "createdfrom" }) || "";
				var poTranId =
					result.getValue({
						name: "tranid",
						join: "createdFrom",
					}) || "";
				var memo =
					result.getValue({
						name: "memo",
						join: "createdFrom",
					}) || "";
				var billDetails = purchaseOrderToVendorBillMap[poId] || {};

				// Set values for each column in the sublist using the correct line number
				if (internalId) {
					list.setSublistValue({
						id: "custpage_internal_id",
						line: line,
						value: internalId,
					});
				}

				if (tranId) {
					list.setSublistValue({
						id: "custpage_tranid",
						line: line,
						value:
							'<a href="https://8025197-sb1.app.netsuite.com/app/accounting/transactions/itemrcpt.nl?whence=&id=' +
							internalId +
							'&=T&selectedtab=landedcost" target="_blank">' +
							tranId +
							"</a>",
					});
				}
				if (trandate) {
					list.setSublistValue({
						id: "custpage_date",
						line: line,
						value: trandate,
					});
				}
				if (memo) {
					list.setSublistValue({
						id: "custpage_memo",
						line: line,
						value: memo,
					});
				}
				if (poTranId) {
					list.setSublistValue({
						id: "custpage_po_tranid",
						line: line,
						value: poTranId,
					});
				}
				if (billDetails) {
					list.setSublistValue({
						id: "custpage_vendor_bill_tranid",
						line: line,
						value: billDetails.billTranId || "N/A",
					});
				}
				line++;
				return true;
			});

			form.addSubmitButton({ label: "Process Selected Receipts" });
			context.response.writePage(form);
		} else if (context.request.method === "POST") {
			var form = serverWidget.createForm({
				title: "Landed Cost Adjustment Results",
			});

			var list = form.addSublist({
				id: "custpage_results_list",
				type: serverWidget.SublistType.LIST,
				label: "Results",
			});

			list.addField({
				id: "custpage_receipt_id",
				type: serverWidget.FieldType.TEXT,
				label: "Receipt ID",
			});
			list.addField({
				id: "custpage_freight_amount",
				type: serverWidget.FieldType.TEXT,
				label: "Freight Amount",
			});
			list.addField({
				id: "custpage_custom_duties_amount",
				type: serverWidget.FieldType.TEXT,
				label: "Custom Duties Amount",
			});
			list.addField({
				id: "custpage_view_link",
				type: serverWidget.FieldType.TEXT,
				label: "View Item Receipt",
			});

			list.addField({
				id: "custpage_error_message",
				type: serverWidget.FieldType.TEXT,
				label: "Completed Message / Error",
			});

			var selectedReceiptIds = [];
			var lineCount = context.request.getLineCount({
				group: "custpage_itemreceipt_list",
			});

			for (var i = 0; i < lineCount; i++) {
				var isSelected = context.request.getSublistValue({
					group: "custpage_itemreceipt_list",
					name: "custpage_select",
					line: i,
				});

				if (isSelected === "T") {
					// Check if the checkbox is marked as selected
					var receiptId = context.request.getSublistValue({
						group: "custpage_itemreceipt_list",
						name: "custpage_internal_id",
						line: i,
					});
					selectedReceiptIds.push(receiptId);
				}
			}

			// Process selected item receipts
			var processResults = processLandedCosts(selectedReceiptIds);

			processResults.forEach(function (result, index) {
				list.setSublistValue({
					id: "custpage_receipt_id",
					line: index,
					value: result.itemReceiptId || "N/A",
				});
				list.setSublistValue({
					id: "custpage_freight_amount",
					line: index,
					value: result.freightAmount || "N/A",
				});
				list.setSublistValue({
					id: "custpage_custom_duties_amount",
					line: index,
					value: result.customDutiesAmount || "N/A",
				});
				list.setSublistValue({
					id: "custpage_view_link",
					line: index,
					value: result.itemReceiptId
						? '<a href="https://8025197-sb1.app.netsuite.com/app/accounting/transactions/itemrcpt.nl?whence=&id=' +
							result.itemReceiptId +
							'&=T&selectedtab=landedcost" target="_blank">View</a>'
						: "N/A",
				});
				list.setSublistValue({
					id: "custpage_error_message",
					line: index,
					value: result.errorMessage ? result.errorMessage + " You must select a cost category on the freight line item on the vendor bill" : "Landed Cost Applied",
				});
			});

			var backLinkField = form
				.addField({
					id: "custpage_back_link",
					type: serverWidget.FieldType.INLINEHTML,
					label: "Back Link",
				})
				.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW,
				})
				.updateBreakType({
					breakType: serverWidget.FieldBreakType.STARTROW,
				});

			var returnToSuitelet = form
				.addField({
					id: "custpage_return_to_suitelet",
					type: serverWidget.FieldType.INLINEHTML,
					label: "Return to Suitelet Link",
				})
				.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW,
				})
				.updateBreakType({
					breakType: serverWidget.FieldBreakType.STARTROW,
				});

			var returnHtml =
				'<a href="https://8025197-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1533&deploy=1">Return to Suitelet</a><br>';

			returnToSuitelet.defaultValue = returnHtml;

			context.response.writePage(form);
		}
	}

	function processLandedCosts(itemReceiptIds) {
		var results = [];

		itemReceiptIds.forEach(function (itemReceiptId) {
			try {
				var billId = findAssociatedBill(itemReceiptId);
				if (billId) {
					var updatedCosts = updateItemReceiptWithLandedCost(
						itemReceiptId,
						billId
					);

					if (updatedCosts) {
						results.push({
							itemReceiptId: itemReceiptId,
							freightAmount: updatedCosts.freightAmount,
							customDutiesAmount: updatedCosts.customDutiesAmount,
							errorMessage: updatedCosts.errorMessage || null,
						});
					}
				}
			} catch (e) {
				log.error(
					"Processing Error",
					"Error processing item receipt ID " +
						itemReceiptId +
						": " +
						e.message
				);
				results.push({
					itemReceiptId: itemReceiptId,
					error: e.message
				});
			}
			log.audit("Processed Receipts", results);
		});

		return results;
	}

	function findAssociatedBill(itemReceiptId) {
		// Load the item receipt to get the related purchase order's internal ID
		var itemReceipt = record.load({
			type: record.Type.ITEM_RECEIPT,
			id: itemReceiptId,
		});

		var createdFrom = itemReceipt.getValue("createdfrom");

		// Search for bills that were created from this purchase order
		var billSearch = search.create({
			type: search.Type.VENDOR_BILL,
			filters: [["createdfrom", search.Operator.ANYOF, createdFrom]],
			columns: ["internalid"],
		});

		var billSearchResult = billSearch.run().getRange({
			start: 0,
			end: 1,
		});

		if (billSearchResult && billSearchResult.length > 0) {
			var billIds = billSearchResult.map(function (result) {
				return result.getValue({ name: "internalid" });
			});

			// Log each bill ID
			billIds.forEach(function (billId) {
				log.audit("Associated Bill IDs", billId);
			});

			return billIds[0]; // Return the first bill ID
		} else {
			return null;
		}
	}

	function checkForLandedCostItems(billId) {
		var hasFreight = false;
		var hasCustomDuties = false;

		// Search for items on the bill
		var billItemSearch = search.create({
			type: search.Type.VENDOR_BILL,
			filters: [
				["internalid", search.Operator.ANYOF, billId],
				"AND",
				["item", search.Operator.ANYOF, ["3393", "4995"]], // Freight and Custom Duties item IDs
			],
			columns: [search.createColumn({ name: "item", label: "Item" })],
		});

		billItemSearch.run().each(function (result) {
			var itemId = result.getValue({ name: "item" });
			if (itemId === "3393") {
				hasFreight = true;
			} else if (itemId === "4995") {
				hasCustomDuties = true;
			}
			return true; // Continue searching until both items are found or all lines are checked
		});

		// Log the presence of freight and custom duties items
		log.audit({
			title: "Landed Cost Item Check",
			details:
				"Freight present: " +
				hasFreight +
				", Custom Duties present: " +
				hasCustomDuties,
		});

		return {
			hasFreight: hasFreight,
			hasCustomDuties: hasCustomDuties,
		};
	}

	function updateItemReceiptWithLandedCost(itemReceiptId, billId) {
		var result = {
			itemReceiptId: itemReceiptId,
			freightAmount: null,
			customDutiesAmount: null,
			errorMessage: null,
		};

		try {
			// Check if Freight and Custom Duties are on the bill
			var landedCostCheck = checkForLandedCostItems(billId);
			var itemReceipt = record.load({
				type: record.Type.ITEM_RECEIPT,
				id: itemReceiptId,
			});

			itemReceipt.setText({ fieldId: "landedcostmethod", text: "Quantity" });

			if (landedCostCheck.hasFreight) {
				itemReceipt.setValue({
					fieldId: "landedcostsource7",
					value: "OTHTRAN",
				});
				itemReceipt.setValue({
					fieldId: "landedcostsourcetran7",
					value: billId,
				});
			}

			if (landedCostCheck.hasCustomDuties) {
				itemReceipt.setValue({
					fieldId: "landedcostsource8",
					value: "OTHTRAN",
				});
				itemReceipt.setValue({
					fieldId: "landedcostsourcetran8",
					value: billId,
				});
			}

			itemReceipt.save();

			result.freightAmount = landedCostCheck.hasFreight
				? itemReceipt.getValue({ fieldId: "landedcostamount7" })
				: "N/A";
			result.customDutiesAmount = landedCostCheck.hasCustomDuties
				? itemReceipt.getValue({ fieldId: "landedcostamount8" })
				: "N/A";
		} catch (e) {
			result.errorMessage =
				"Error updating item receipt ID " +
				itemReceiptId +
				": " +
				e.message;
			log.error("Update Error", result.errorMessage);
		}

		return result;
	}

	return {
		onRequest: onRequest,
	};
});
