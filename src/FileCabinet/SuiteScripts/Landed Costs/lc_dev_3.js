/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/log'], function (serverWidget, search, record, log) {
	function onRequest(context) {
		if (context.request.method === 'GET') {
			createGetResponseForm(context);
		} else if (context.request.method === 'POST') {
			createPostResponseForm(context);
		}
	}

	function createGetResponseForm(context) {
		var form = serverWidget.createForm({ title: 'Landed Cost Adjustment' });

		var pageNumber = parseInt(context.request.parameters.pg) || 1; // Get current page number from URL parameter, default to 1

		var { itemReceiptSearch: itemReceiptSearch, poToBillsMap: poToBillsMap } = createItemReceiptSearch();

		addItemReceiptsToList(form, itemReceiptSearch, poToBillsMap, pageNumber);
		form.addSubmitButton({ label: 'Process Selected Receipts' });

		form.clientScriptModulePath = './cs_landed_cost_button.js';

		context.response.writePage(form);
  }
  
/// stopped here from customsearch999 - new search to load, need to map values 

	function createItemReceiptSearch() {
		var startDate = '01/01/23'; // Adjust to your required start date
    var endDate = '12/01/23'; // Adjust to your required end date

    var poToBillsMap = [];
    var purchaseorderSearchObj = search.create({
      
    type: "purchaseorder",
   filters:
   [
      ["type","anyof","PurchOrd"], 
      "AND", 
      ["fulfillingtransaction.custbody_islandedcostapplied","is","F"], 
      "AND", 
      ["applyingtransaction.type","anyof","VendBill"], 
      "AND", 
      ["subsidiary","anyof","5"], 
      "AND", 
      ["fulfillingtransaction.type","noneof","ItemShip","VendBill"], 
      "AND", 
      ["item.type","anyof","InvtPart"]
   ],
   columns:
   [
      search.createColumn({
         name: "tranid",
         summary: "GROUP",
         label: "Document Number"
      }),
      search.createColumn({
         name: "tranid",
         join: "applyingTransaction",
         summary: "GROUP",
         label: "Bill Reference #"
      }),
      search.createColumn({
         name: "fulfillingtransaction",
         summary: "GROUP",
         label: "Item Receipt"
      }),
      search.createColumn({
         name: "applyingtransaction",
         summary: "GROUP",
         label: "Bill"
      })
   ]
});
/// stopped here from customsearch999 - new search to load, need to map values 
	function addItemReceiptsToList(form, itemReceiptSearch, poToBillsMap) {
		var list = form.addSublist({
			id: 'custpage_itemreceipt_list',
			type: serverWidget.SublistType.LIST,
			label: 'Item Receipts'
		});

		list.addMarkAllButtons();
		addFieldsToList(list);

		var line = 0;

		var pageSize = 25;

		var pagedData = itemReceiptSearch.runPaged({
			pageSize: pageSize
		});

		for (var i = 0; i < pagedData.pageRanges.length; i++) {
			var currentPage = pagedData.fetch({ index: i });

			currentPage.data.forEach(function (result) {
				setListValues(list, result, line++, poToBillsMap);
			});
		}
	}

	function addFieldsToList(list) {
		var fields = [
			{ id: 'custpage_select', type: serverWidget.FieldType.CHECKBOX, label: 'Select' },
			{ id: 'custpage_date', type: serverWidget.FieldType.TEXT, label: 'Date' },
			{ id: 'custpage_internal_id', type: serverWidget.FieldType.TEXT, label: 'Internal ID' },
			{ id: 'custpage_tranid', type: serverWidget.FieldType.TEXT, label: 'Tran ID' },
			{ id: 'custpage_po_tranid', type: serverWidget.FieldType.TEXT, label: 'PO Tran ID' },
			{ id: 'custpage_memo', type: serverWidget.FieldType.TEXT, label: 'PO Memo' },
			{ id: 'custpage_vendor_bill_tranid', type: serverWidget.FieldType.TEXT, label: 'Vendor Bill Number' }
		];

		fields.forEach(function (field) {
			list.addField(field);
		});
	}

	function setListValues(list, result, line, poToBillsMap) {
		var internalId = result.getValue({ name: 'internalid' });
		var tranId = result.getValue({ name: 'tranid' });
		var trandate = result.getValue({ name: 'trandate' });
		var poId = result.getValue({ name: 'createdfrom' });
		var poTranId = result.getValue({ name: 'tranid', join: 'createdFrom' });
		var memo = result.getValue({ name: 'memo', join: 'createdFrom' });
		var billDetails = poToBillsMap[poId] || {};

		if (internalId) {
			list.setSublistValue({ id: 'custpage_internal_id', line: line, value: internalId });
		}
		if (tranId) {
			list.setSublistValue({ id: 'custpage_tranid', line: line, value: createViewLink(internalId, tranId) });
		}
		if (trandate) {
			list.setSublistValue({ id: 'custpage_date', line: line, value: trandate });
		}
		if (poTranId) {
			list.setSublistValue({ id: 'custpage_po_tranid', line: line, value: poTranId });
		}
		if (memo) {
			list.setSublistValue({ id: 'custpage_memo', line: line, value: memo });
		}
		if (billDetails) {
			list.setSublistValue({ id: 'custpage_vendor_bill_tranid', line: line, value: billDetails.billTranId });
		}
	}

	function createViewLink(internalId, tranId) {
		return (
			'<a href="https://8025197.app.netsuite.com/app/accounting/transactions/itemrcpt.nl?whence=&id=' +
			internalId +
			'&=T&selectedtab=landedcost" target="_blank">' +
			tranId +
			'</a>'
		);
	}

	function createPostResponseForm(context) {
		var form = serverWidget.createForm({ title: 'Landed Cost Adjustment Results' });
		var list = form.addSublist({
			id: 'custpage_results_list',
			type: serverWidget.SublistType.LIST,
			label: 'Results'
		});

		form.addButton({
			id: 'custpage_return_button',
			label: 'Return',
			functionName: 'redirectToSuitelet'
		});

		form.clientScriptModulePath = './cs_landed_cost_button.js';

		addResultFieldsToList(list);

		var selectedReceiptIds = getSelectedReceiptIds(context);
		var processResults = processLandedCosts(selectedReceiptIds);

		processResults.forEach(function (result, index) {
			setResultsValues(list, result, index);
		});

		context.response.writePage(form);
	}

	function addResultFieldsToList(list) {
		var fields = [
			{ id: 'custpage_receipt_id', type: serverWidget.FieldType.TEXT, label: 'Receipt ID' },
			{ id: 'custpage_freight_amount', type: serverWidget.FieldType.TEXT, label: 'Freight Amount' },
			{ id: 'custpage_custom_duties_amount', type: serverWidget.FieldType.TEXT, label: 'Custom Duties Amount' },
			{ id: 'custpage_view_link', type: serverWidget.FieldType.TEXT, label: 'View Item Receipt' },
			{ id: 'custpage_error_message', type: serverWidget.FieldType.TEXT, label: 'Completed Message / Error' }
		];

		fields.forEach(function (field) {
			list.addField(field);
		});
	}

	function getSelectedReceiptIds(context) {
		var selectedReceiptIds = [];
		var lineCount = context.request.getLineCount({ group: 'custpage_itemreceipt_list' });

		for (var i = 0; i < lineCount; i++) {
			if (context.request.getSublistValue({ group: 'custpage_itemreceipt_list', name: 'custpage_select', line: i }) === 'T') {
				selectedReceiptIds.push(context.request.getSublistValue({ group: 'custpage_itemreceipt_list', name: 'custpage_internal_id', line: i }));
			}
		}

		return selectedReceiptIds;
	}

	function setResultsValues(list, result, index) {
		list.setSublistValue({ id: 'custpage_receipt_id', line: index, value: result.itemReceiptId || 'N/A' });
		list.setSublistValue({ id: 'custpage_freight_amount', line: index, value: result.freightApplied || 'N/A' });
		list.setSublistValue({ id: 'custpage_custom_duties_amount', line: index, value: result.dutiesApplied || 'N/A' });
		list.setSublistValue({ id: 'custpage_view_link', line: index, value: createViewLink(result.itemReceiptId, result.itemReceiptId) });
		list.setSublistValue({
			id: 'custpage_error_message',
			line: index,
			value: result.errorMessage + '. please enter cost category on freight line item on bill' || 'Landed Cost Applied'
		});
	}

	function processLandedCosts(itemReceiptIds) {
		var results = [];

		itemReceiptIds.forEach(function (itemReceiptId) {
			try {
				var billId = findAssociatedBill(itemReceiptId);
				if (billId) {
					var updatedCosts = updateItemReceiptWithLandedCost(itemReceiptId, billId);

					if (updatedCosts) {
						results.push({
							itemReceiptId: itemReceiptId,
							freightApplied: updatedCosts.freightApplied,
							dutiesApplied: updatedCosts.dutiesApplied,
							errorMessage: updatedCosts.errorMessage || null
						});
					}
				}
			} catch (e) {
				log.error('Processing Error', 'Error processing item receipt ID ' + itemReceiptId + ': ' + e.message);
				results.push({
					itemReceiptId: itemReceiptId,
					error: e.message
				});
			}
			log.audit('Processed Receipts', results);
		});

		return results;
	}

	function updateItemReceiptWithLandedCost(itemReceiptId, billId) {
		var result = {
			itemReceiptId: itemReceiptId,
			freightApplied: null,
			dutiesApplied: null,
			errorMessage: null
		};

		try {
			// Check if Freight and Custom Duties are on the bill
			var landedCostCheck = checkForLandedCostItems(billId);
			var itemReceipt = record.load({
				type: record.Type.ITEM_RECEIPT,
				id: itemReceiptId
			});

			itemReceipt.setText({ fieldId: 'landedcostmethod', text: 'Quantity' });

			if (landedCostCheck.hasFreight) {
				itemReceipt.setValue({
					fieldId: 'landedcostsource7',
					value: 'OTHTRAN'
				});
				itemReceipt.setValue({
					fieldId: 'landedcostsourcetran7',
					value: billId
				});
			}

			if (landedCostCheck.hasCustomDuties) {
				itemReceipt.setValue({
					fieldId: 'landedcostsource8',
					value: 'OTHTRAN'
				});
				itemReceipt.setValue({
					fieldId: 'landedcostsourcetran8',
					value: billId
				});
			}

			itemReceipt.save();

			var itemReceipt = record.load({
				type: record.Type.ITEM_RECEIPT,
				id: itemReceiptId
			});

			// Assigning the values after saving the record
			result.freightApplied = landedCostCheck.hasFreight ? itemReceipt.getValue({ fieldId: 'landedcostamount7' }) : 'N/A';
			result.dutiesApplied = landedCostCheck.hasCustomDuties ? itemReceipt.getValue({ fieldId: 'landedcostamount8' }) : 'N/A';
		} catch (e) {
			result.errorMessage = 'Error updating item receipt ID ' + itemReceiptId + ': ' + e.message;
			log.error('Update Error', result.errorMessage);
		}

		return result;
	}

	return {
		onRequest: onRequest
	};
});
