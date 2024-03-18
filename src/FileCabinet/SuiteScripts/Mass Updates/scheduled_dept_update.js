/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/search', 'N/log'], function (record, search, log) {
	function execute(context) {
		var savedSearchId = 'customsearch_department_update';
		var newDepartmentId = '11';

		var mySavedSearch = search.load({ id: savedSearchId });
		var processResult = mySavedSearch.run().getRange({
			start: 0,
			end: 250
		});

		processResult.forEach(function (result) {
			try {
				var transactionRecord = record.load({
					type: result.recordType,
					id: result.id,
					isDynamic: false
				});

				transactionRecord.setValue({
					fieldId: 'department',
					value: newDepartmentId
				});
				transactionRecord.save();

				log.audit({ title: 'updated: ', details: result.id });
			} catch (error) {
				log.error({
					title: 'Error updating transaction ' + result.id,
					details: error.message
				});
			}
		});
	}

	return {
		execute: execute
	};
});
