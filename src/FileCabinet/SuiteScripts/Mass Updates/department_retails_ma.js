/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */

define(["N/record", "N/log"], function (record, log) {
  var newDepartmentId = "11"; // New Department ID

  function each(params) {
    var recordId = params.id;

    try {
      // Update the department of the record
      record.submitFields({
        type: record.Type.ITEM_RECEIPT,
        id: recordId,
        values: {
          department: newDepartmentId,
        },
        options: {
          enableSourcing: false,
          ignoreMandatoryFields: true,
        },
      });

      // Load the record to access the transid field
      var updatedRecord = record.load({
        type: record.Type.ITEM_RECEIPT,
        id: recordId,
      });
      var transid = updatedRecord.getValue({ fieldId: "tranid" }); // Ensure this is the correct field ID for transid

      log.audit({
        title: "Department Updated",
        details:
          "Record ID " +
          recordId +
          "/" +
          transid +
          " updated to department " +
          newDepartmentId,
      });
    } catch (e) {
      log.error({
        title: "Error updating record",
        details: e,
      });
    }
  }

  return {
    each: each,
  };
});
