/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/search", "N/record", "N/log"], function (
  serverWidget,
  search,
  record,
  log
) {
  
  function onRequest(context) {
    if (context.request.method === "GET") {
      // Create form
      var form = serverWidget.createForm({
        title: "Landed Cost Adjustment",
      });

      // Form field for parameters
      form.addField({
        id: "custpage_itemreceipt_ids",
        type: serverWidget.FieldType.TEXT,
        label: "Item Receipt Internal IDs (comma-separated)",
      });

      // Form submit button
      form.addSubmitButton({
        label: "Submit",
      });

      context.response.writePage(form);
    } else if (context.request.method === "POST") {
      var itemReceiptIdsInput =
        context.request.parameters.custpage_itemreceipt_ids;
      if (!itemReceiptIdsInput) {
        log.error("Input Error", "No item receipt IDs provided.");
        return; // Stop processing if no input is provided
      }

      var itemReceiptIds = itemReceiptIdsInput.split(",").map(function (id) {
        return id.trim();
      });

      processLandedCosts(itemReceiptIds);
    }
  }

  function processLandedCosts(itemReceiptIds) {
    var results = [];

    itemReceiptIds.forEach(function (itemReceiptId) {
      try {
        var itemReceipt = record.load({
          type: record.Type.ITEM_RECEIPT,
          id: itemReceiptId,
        });

        var landedCostAmount7 = itemReceipt.getValue("landedcostamount7");

        var billId = findAssociatedBill(itemReceiptId);
        if (billId) {
          var freightAmount = getFreightAmountFromBill(billId);
          if (freightAmount) {
            updateItemReceiptWithLandedCost(
              itemReceiptId,
              freightAmount,
              billId
            );
          }
        }

        results.push({
          itemReceiptId: itemReceiptId,
          landedCostAmount7: landedCostAmount7,
          freightAmount: freightAmount,
        });
      } catch (e) {
        log.error(
          "Processing Error",
          "Error processing item receipt ID " + itemReceiptId + ": " + e.message
        );
        results.push({
          itemReceiptId: itemReceiptId,
          error: e.message,
        });
      }
    });

    log.audit("Landed Cost Processing Results", JSON.stringify(results));
  }

  function findAssociatedBill(itemReceiptId) {
    // First, load the item receipt to get the related purchase order's internal ID
    var itemReceipt = record.load({
      type: record.Type.ITEM_RECEIPT,
      id: itemReceiptId,
    });

    var createdFrom = itemReceipt.getValue("createdfrom");

    // Now, search for bills that were created from this purchase order
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
      log.audit("Associated Bills Found", JSON.stringify(billSearchResult));

      return billSearchResult[0].getValue({ name: "internalid" });
    } else {
      return null;
    }
  }

  function getFreightAmountFromBill(billId) {
    var billRecord = record.load({
      type: record.Type.VENDOR_BILL,
      id: billId,
    });

    var numLines = billRecord.getLineCount({ sublistId: "item" });
    for (var i = 0; i < numLines; i++) {
      var itemName = billRecord.getSublistValue({
        sublistId: "item",
        fieldId: "item-display",
        line: i,
      });

      if (itemName === "Freight") {
        var freightAmount = billRecord.getSublistValue({
          sublistId: "item",
          fieldId: "amount",
          line: i,
        });

        return freightAmount;
      }
    }

    return null;
  }

  function updateItemReceiptWithLandedCost(itemReceiptId, landedCost, billId) {
    try {
      var itemReceipt = record.load({
        type: record.Type.ITEM_RECEIPT,
        id: itemReceiptId,
      });

      itemReceipt.setValue({
        fieldId: "landedcostamount7",
        value: landedCost,
      });

      itemReceipt.setValue({
        fieldId: "landedcostsourceamount7",
        value: billId,
      });

      itemReceipt.save();
    } catch (e) {
      log.error(
        "Update Error",
        "Error updating item receipt ID " + itemReceiptId + ": " + e.message
      );
    }
  }
  return {
    onRequest: onRequest,
  };
});
