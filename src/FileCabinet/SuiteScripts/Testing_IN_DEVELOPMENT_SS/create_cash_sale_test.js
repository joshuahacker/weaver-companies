/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record'], function (record) {

    function createCashSaleForTesting() {
        // New Cash Sale Record
        var cashSale = record.create({
            type: record.Type.CASH_SALE,
            isDynamic: false,
        });

        // Set the entity (customer) for the Cash Sale (replace with a valid customer ID)
        cashSale.setValue({
            fieldId: 'entity',
            value: 17 // Replace with a valid customer ID
        });

        cashSale.setValue({
            fieldId: 'location',
            value: 14
        });

        // Set the transaction date
        cashSale.setValue({
            fieldId: 'trandate',
            value: new Date() // Use the current date for testing
        });

        // Add an item to the Cash Sale (replace with a valid item ID)
        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: 0, // Use 0 for the first line
            value: 6059 // Replace with a valid item ID
        });

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: 0, // Use 0 for the first line
            value: 1 // Set the quantity
        });

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            line: 0, // Use 0 for the first line
            value: 100.00 // Set the rate (amount)
        });

        // Save the Cash Sale record
        var cashSaleId = cashSale.save();

        return cashSaleId;
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            try {
                var cashSaleId = createCashSaleForTesting();
                if (cashSaleId) {
                    log.audit('Cash Sale Created', 'Cash Sale ID: ' + cashSaleId);
                    context.response.write('Cash Sale Created: ' + cashSaleId);
                } else {
                    log.error('Cash Sale Creation Error', 'Cash Sale creation failed.');
                    context.response.write('Cash Sale Creation Error');
                }
            } catch (ex) {
                log.error('Suitelet Error', ex.toString());
                context.response.write('Suitelet Error: ' + ex.toString());
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
