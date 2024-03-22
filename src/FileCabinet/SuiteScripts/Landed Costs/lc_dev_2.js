/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount

 * apply landed cost to multiple records. 
 */
define(['N/search', 'N/log'], function (search, log) {
	function onRequest(context) {
		var { poToBillsMap, itemReceiptDetails } = populatePoToBillsMapAndFetchReceipts();
		var filteredItemReceiptDetails = filterItemReceiptDetails(itemReceiptDetails);
		var combinedDataForDisplay = mergeData(filteredItemReceiptDetails, poToBillsMap);

		var htmlContent = '<html><head><title>Display Data</title></head><body>';
		htmlContent += '<h1>Combined Data for Display</h1>';

		Object.keys(poToBillsMap).forEach((poId) => {
			const bills = poToBillsMap[poId];
			htmlContent += `<h2>PO ID: ${poId}</h2>`;

			bills.forEach((bill) => {
				htmlContent += `<h3>Bill ID: ${bill.billId} (Tran ID: ${bill.billTranId})</h3>`;
				htmlContent += '<ul>';

				// Summarize Freight and Customs Duties
				let freightAmount = 0;
				let customDutyAmount = 0;

				bill.lineItems.forEach((item) => {
					if (item.type === 'Freight') {
						freightAmount += item.amount; // Only add to freightAmount if type is 'Freight'
					} else if (item.type === 'Customs Duties') {
						// Ensure this matches the exact string identifier used in your data
						customDutyAmount += item.amount; // Only add to customDutyAmount if type is 'Customs Duties'
					} else {
						// Display regular items
						htmlContent += `<li>Item ID: ${item.itemId}, Quantity: ${item.quantity}, Amount: ${item.amount}</li>`;
					}
				});

				// Display Freight summary
				if (freightAmount > 0) {
					htmlContent += `<li><strong>Freight Total: ${freightAmount}</strong></li>`;
				}

				// Display Customs Duty summary
				if (customDutyAmount > 0) {
					htmlContent += `<li><strong>Customs Duty Total: ${customDutyAmount}</strong></li>`;
				}

				htmlContent += '</ul>';
			});
		});

		htmlContent += '</body></html>';

		// Send the HTML content as the response
		context.response.write(htmlContent);
	}

	function populatePoToBillsMapAndFetchReceipts() {
		var startDate = '01/01/2023';
		var endDate = '05/01/2023';
		var poToBillsMap = {};

		var vendorBillSearch = search.create({
			type: search.Type.VENDOR_BILL,
			filters: [['item', search.Operator.ANYOF, ['3393', '4995']], 'AND', ['trandate', search.Operator.WITHIN, [startDate, endDate]]],
			columns: ['internalid', 'createdfrom', 'tranid']
		});

		vendorBillSearch.run().each(function (result) {
			var billId = result.getValue({ name: 'internalid' });
			var poId = result.getValue({ name: 'createdfrom' });
			var lineItems = fetchBillLineItems(billId); // This should return an array

			if (!poToBillsMap[poId]) {
				poToBillsMap[poId] = [];
			}
			poToBillsMap[poId].push({
				billId: billId,
				billTranId: result.getValue({ name: 'tranid' }),
				lineItems: lineItems // Ensure this is assigning the array returned by fetchBillLineItems
			});
			return true;
		});
		log.audit({ title: 'PO to Bill Map', details: JSON.stringify(poToBillsMap) });
		var itemReceiptDetails = fetchItemReceiptIdsForPOs(Object.keys(poToBillsMap));
		return { poToBillsMap, itemReceiptDetails };
	}

	function fetchItemReceiptIdsForPOs(poIds) {
		var itemReceiptDetails = [];
		var itemReceiptSearch = search.create({
			type: search.Type.ITEM_RECEIPT,
			filters: [['createdfrom', 'anyof', poIds], 'AND', ['mainline', search.Operator.IS, 'F']],
			columns: ['internalid', 'createdfrom', 'tranid', 'item', 'quantity']
		});

		itemReceiptSearch.run().each(function (result) {
			itemReceiptDetails.push({
				itemReceiptId: result.getValue({ name: 'internalid' }),
				poId: result.getValue({ name: 'createdfrom' }),
				tranId: result.getValue({ name: 'tranid' }),
				itemId: result.getValue({ name: 'item' }),
				quantity: result.getValue({ name: 'quantity' })
			});
			return true;
		});

		return itemReceiptDetails;
	}

	function filterItemReceiptDetails(itemReceiptDetails) {
		return itemReceiptDetails.filter((detail) => detail.quantity && detail.quantity !== '');
	}

	function mergeData(filteredItemReceiptDetails, poToBillsMap) {
		var combinedData = {};

		filteredItemReceiptDetails.forEach((receipt) => {
			var matchedBills = poToBillsMap[receipt.poId] || [];
			matchedBills.forEach((bill) => {
				bill.lineItems.forEach((lineItem) => {
					if (lineItem.itemId === receipt.itemId) {
						if (!combinedData[receipt.poId]) {
							combinedData[receipt.poId] = [];
						}
						combinedData[receipt.poId].push({
							receiptId: receipt.itemReceiptId,
							receiptTranId: receipt.tranId,
							billId: bill.billId,
							billTranId: bill.billTranId,
							itemId: lineItem.itemId,
							quantity: receipt.quantity,
							type: lineItem.type,
							amount: lineItem.amount
						});
					}
				});
			});
		});

		return combinedData;
	}

	function fetchBillLineItems(billId) {
		var lineItems = [];
		var billItemSearch = search.create({
			type: search.Type.VENDOR_BILL,
			filters: [
				['internalid', search.Operator.ANYOF, [billId]],
				'AND',
				['mainline', search.Operator.IS, 'F'] // Focus on line items only
			],
			columns: [
				search.createColumn({ name: 'item' }),
				search.createColumn({ name: 'quantity' }),
				search.createColumn({ name: 'amount' }),
				search.createColumn({ name: 'rate' }) // Include rate if needed
			]
		});

		billItemSearch.run().each(function (result) {
			var itemId = result.getValue({ name: 'item' });
			var quantity = result.getValue({ name: 'quantity' });
			var amount = parseFloat(result.getValue({ name: 'amount' }) || 0);

			// Add a type identifier for special handling of Freight and Customs Duties
			var type = '';
			if (itemId === '3393') {
				type = 'Freight';
			} else if (itemId === '4995') {
				type = 'Customs Duties';
			}

			lineItems.push({
				itemId: itemId,
				quantity: quantity,
				amount: amount,
				type: type // This helps identify the line item type in subsequent processing
			});
			return true;
		});

		return lineItems; // Returns all line items, including identified Freight and Customs Duties
	}

	return { onRequest: onRequest };
});
