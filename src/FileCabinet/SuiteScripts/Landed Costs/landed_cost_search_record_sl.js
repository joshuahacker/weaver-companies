define(["N/record", "N/log"], function (record, log) {
  function onRequest(context) {
    if (context.request.method === "GET") {
      // Example internal ID - replace with actual ID retrieval method
      var itemReceiptIds = ["INTERNAL_ID_OF_IR268"];
      processItemReceipts(itemReceiptIds);
    }
  }

  function processItemReceipts(itemReceiptIds) {
    var results = [];

    itemReceiptIds.forEach(function (itemReceiptId) {
      try {
        var itemReceipt = record.load({
          type: record.Type.ITEM_RECEIPT,
          id: itemReceiptId,
        });

        // Accessing the landedcostamount7 field
        var landedCostAmount7 = itemReceipt.getValue("landedcostamount7");

        results.push({
          itemReceiptId: itemReceiptId,
          landedCostAmount7: landedCostAmount7,
        });
      } catch (e) {
        log.error("Error loading item receipt", e.toString());
      }
    });

    // Log results as JSON
    log.debug("Landed Cost Amount 7 Results", JSON.stringify(results));
  }

  return {
    onRequest: onRequest,
  };
});
