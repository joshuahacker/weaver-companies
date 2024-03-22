/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function (record, log) {
	function beforeSubmit(context) {
		var newRecord = context.newRecord;

		// Check if the specific checkbox is checked before proceeding
		var isFeesEnabled = newRecord.getValue({ fieldId: 'custbody_apply_empire_fees' });
		if (!isFeesEnabled) {
			log.debug('Fee Calculation Skipped', 'The checkbox for enabling fees is not checked.');
			return; // Exit if checkbox is not checked
		}

		if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
			log.audit('Context Check', 'Exiting script because the context is not CREATE or EDIT.');
			return;
		}

		var itemCount = newRecord.getLineCount({ sublistId: 'item' });

		var skusToCheck = ['3715', '3716', '3717', '3718', '3719', '3720', '3721', '3722', '5002']; // Spirit SKUs
		var bottleFeeItemId = '6260';
		var taxFeeItemId = '6259';
		var subtotalItemId = 'subtotalitem';
		var caseUnitTypeId = '2';
		var bottleUnitTypeId = '1';

		log.debug('Processing Start', `Starting to process ${itemCount} line items.`);

		for (var i = itemCount - 1; i >= 0; i--) {
			var currentItemSKU = newRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });

			if (skusToCheck.includes(currentItemSKU)) {
				var nextItem1 = i + 1 < itemCount ? newRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i + 1 }) : null;
				var nextItem2 = i + 2 < itemCount ? newRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i + 2 }) : null;

				if (nextItem1 == bottleFeeItemId && nextItem2 == taxFeeItemId) {
					log.debug('Skipping', `Bottle fee and tax fee already exist for SKU ${currentItemSKU} at line ${i + 1} and ${i + 2}.`);
					continue;
				}

				var currentItemQuantity = newRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
				var currentItemUnitId = newRecord.getSublistValue({ sublistId: 'item', fieldId: 'units', line: i });
				var currentItemAmount = newRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i });
				var bottleFeeRate = currentItemUnitId === caseUnitTypeId ? 1.5 : 0.25;
				var bottleFeeAmount = currentItemQuantity * bottleFeeRate;
				var taxFeeAmount = (bottleFeeAmount + currentItemAmount) * 0.05;
				var taxRate = 0.05;

				// Add Bottle Fee Line
				insertFeeLine(newRecord, i + 1, bottleFeeItemId, bottleFeeAmount, bottleFeeRate);

				// Add Tax Fee Line
				insertTaxFeeLine(newRecord, i + 2, taxFeeItemId, taxFeeAmount, taxRate, taxFeeAmount / currentItemQuantity); // Assuming tax is a flat rate per item

				// Add Subtotal Line after the fees
				insertSubtotalLine(newRecord, i + 3, subtotalItemId);

				log.debug(
					'Charges and Subtotal Added',
					`Bottle fee, tax fee, and subtotal added after SKU ${currentItemSKU} at lines ${i + 1}, ${i + 2}, and ${i + 3}.`
				);
			}
		}

		log.audit('Processing Complete', 'Finished processing all items on the PO.');
	}

	function insertFeeLine(record, lineIndex, itemId, amount, rate) {
		record.insertLine({ sublistId: 'item', line: lineIndex });
		record.setSublistValue({ sublistId: 'item', fieldId: 'item', line: lineIndex, value: parseInt(itemId) });
		record.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: lineIndex, value: 1 });
		record.setSublistValue({ sublistId: 'item', fieldId: 'expectedreceiptdate', line: lineIndex, value: '' });
		record.setSublistValue({ sublistId: 'item', fieldId: 'rate', line: lineIndex, value: rate });
		record.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: lineIndex, value: amount });
	}

	function insertTaxFeeLine(record, lineIndex, itemId, amount, taxRate) {
		record.insertLine({ sublistId: 'item', line: lineIndex });
		record.setSublistValue({ sublistId: 'item', fieldId: 'item', line: lineIndex, value: parseInt(itemId) });
		record.setSublistValue({ sublistId: 'item', fieldId: 'quantity', line: lineIndex, value: 1 });
		record.getSublistValue({ sublistId: 'item', fieldId: 'expectedreceiptdate', line: lineIndex });
		record.setSublistText({ sublistId: 'item', fieldId: 'expectedreceiptdate', line: lineIndex, value: 'null' });
		record.setSublistValue({ sublistId: 'item', fieldId: 'rate', line: lineIndex, value: taxRate });
		record.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: lineIndex, value: amount });
	}

	function insertSubtotalLine(record, lineIndex) {
		record.insertLine({ sublistId: 'item', line: lineIndex });
		record.setSublistValue({ sublistId: 'item', fieldId: 'item', line: lineIndex, value: '-2' });
	}

	return {
		beforeSubmit: beforeSubmit
	};
});
