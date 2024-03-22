/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/log'], function (record, log) {
	function execute(context) {
		var transactionIds = [
			1778, 3919, 4016, 4638, 5599, 5695, 5699, 6340, 6341, 6784, 7660, 8638, 8926, 9419, 9420, 10073, 13627, 15336, 17519, 24717, 29219, 35243, 35914,
			38329, 39343, 39500, 39611, 40822, 41897, 45330, 45394, 45395, 46262, 46267, 46273, 46442, 47383, 48506, 48511, 49085, 51417, 51479, 51482, 51486,
			51556, 51557, 52272, 53072, 53772, 55043, 55068, 55747, 56141, 56142, 56143, 56839, 56954, 57725, 58285, 58505, 59130, 59131
		];

		transactionIds.forEach(function (id) {
			try {
				var transactionRecord = record.load({
					type: 'itemreceipt',
					id: id,
					isDynamic: false
				});

				transactionRecord.setValue({
					fieldId: 'custbody_islandedcostapplied',
					value: true
				});

				transactionRecord.save();

				log.audit({
					title: 'Landed cost applied',
					details: 'Transaction ' + id
				});
			} catch (error) {
				log.error({
					title: 'Error updating transaction ' + id,
					details: error.message
				});
			}
		});
	}

	return {
		execute: execute
	};
});
