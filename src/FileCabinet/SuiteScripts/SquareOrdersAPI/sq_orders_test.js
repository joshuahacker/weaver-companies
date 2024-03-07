/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/log', 'N/record', 'N/ui/serverWidget'], function (https, log, record, serverWidget) {

    // Constants for Square integration
    var SQUARE_ACCESS_TOKEN = 'EAAAEa-iM-IsOHsG4R6icz6_TiubHr_-NV4nLqJ6Ht0vR6r0WjiAE5jRVhkV9ZVQ';
    var SQUARE_LOCATION_ID = 'J55ZSCT943J06';

    /**
     * Create a Cash Sale record in NetSuite.
     * @param {Object} orderInfo - Order information from Square.
     * @returns {number} - ID of the created Cash Sale record.
     */

    function createCashSale(orderInfo, itemMapping) {
        // Create a new Cash Sale record
        var cashSale = record.create({
            type: record.Type.CASH_SALE,
            isDynamic: false,
            defaultValues: {
                customform: 172,
                entity: 762,
                subsidiary: 5,
            }
        });

        // Set Cash Sale field values
        cashSale.setValue({
            fieldId: 'memo',
            value: 'Square Orders from Balloon Fest',
        });

        cashSale.setValue({
            fieldId: 'location',
            value: 14,
        });

        cashSale.setValue({
            fieldId: 'trandate',
            value: new Date(orderInfo['Order Date']),
        });

        var cashSaleItems = orderInfo['Order Items']; 
        log.debug('Items:', cashSaleItems);

        if (cashSaleItems && cashSaleItems.length > 0) {
            cashSaleItems.forEach(function (item, index) {
                          
                // Add line item to the 'item' sublist
                cashSale.insertLine({
                    sublistId: 'item',
                    line: index,
                });

                cashSale.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: index,
                    value: itemMapping[item['Item Name']], 
                });

                cashSale.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: index,
                    value: item['Quantity'],
                });

                cashSale.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: index,
                    value: item['Amount'],
                });
            });
        }

        // Save the Cash Sale record and return its ID
        var cashSaleId = cashSale.save();
        return cashSaleId;
    }

    /**
     * Get the transaction ID of a Cash Sale record.
     * @param {number} cashSaleId - ID of the Cash Sale record.
     * @returns {string} - Transaction ID of the Cash Sale.
     */
    function getCashSaleTranId(cashSaleId) {
        var cashSaleTranId = record.load({
            type: record.Type.CASH_SALE,
            id: cashSaleId,
        });

        var newTranId = cashSaleTranId.getValue({
            fieldId: 'tranid',
        });

        return newTranId;
    }

    /**
     * Suitelet main function to handle HTTP requests.
     * @param {Object} context - Suitelet context object.
     */
    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create a form for entering Square Order IDs
            var form = serverWidget.createForm({
                title: 'Square Order Ids',
                hideNavBar: false,
            });

            // Add a sublist for item mapping with two columns
            var itemMappingSublist = form.addSublist({
                id: 'custpage_item_mapping',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Item Mapping',
             })

             form.addField({
                id: "custpage_displaychange",
                type: serverWidget.FieldType.TEXT,
                label: 'display',
             }).updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
             }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
             })

            itemMappingSublist.addField({
                id: 'custpage_square_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Square Item Name',
              
            }).updateDisplaySize({
                height: 50,
                width: 100
             }).updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
             })
            itemMappingSublist.addField({
                id: 'custpage_netsuite_item',
                type: serverWidget.FieldType.SELECT,
                source: 'item',
                label: 'NetSuite Item',
            }).updateDisplaySize({
                height: 60,
                width: 50
             });

            form.addField({
                id: 'custpage_square_orders',
                label: 'Square Orders',
                type: serverWidget.FieldType.TEXTAREA,
                displaySize: {
                    height: 5,
                    width: 50,
                },
            });

            form.addSubmitButton({
                label: 'Submit',
            });

            context.response.writePage(form);
        } else if (context.request.method === 'POST') {
            // Retrieve the item mapping from the sublist
            var itemMapping = {};
            var itemCount = context.request.getLineCount({
                group: 'custpage_item_mapping'
            });

            for (var i = 0; i < itemCount; i++) {
                var squareItem = context.request.getSublistValue({
                    group: 'custpage_item_mapping',
                    name: 'custpage_square_item',
                    line: i
                });

                var netSuiteItem = context.request.getSublistValue({
                    group: 'custpage_item_mapping',
                    name: 'custpage_netsuite_item',
                    line: i
                });

                itemMapping[squareItem] = netSuiteItem;
            }

            // Log the custom item mapping
            log.debug('Custom Item Mapping:', itemMapping);

            // Parse order IDs from the request
            var orderIds = context.request.parameters.custpage_square_orders.split('\n')
                .map(function (orderId) {
                    return orderId.trim(); // Remove leading/trailing whitespace
                })
                .filter(function (orderId) {
                    return orderId !== ''; // Filter out empty strings
                });

            // Log Square Order IDs
            log.debug('Sq Orders:', orderIds);

            // Square API request setup
            var url = 'https://connect.squareup.com/v2/orders/batch-retrieve';
            var squareHeaders = {
                'Authorization': 'Bearer ' + SQUARE_ACCESS_TOKEN,
                'Square-Version': '2023-09-25',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            var requestSqData = {
                'location_id': SQUARE_LOCATION_ID,
                'order_ids': orderIds,
            };

            try {
                // Make a request to Square API to retrieve orders
                var sqResponse = https.post({
                    url: url,
                    headers: squareHeaders,
                    body: JSON.stringify(requestSqData),
                });

                if (sqResponse.code === 200) {
                    var sqOrderResponse = JSON.parse(sqResponse.body);

                    if (sqOrderResponse.orders && sqOrderResponse.orders.length > 0) {
                        sqOrderResponse.orders.forEach(function (order) {
                            var orderItems = order.line_items;

                            if (orderItems && orderItems.length > 0) {
                                var cashSaleItems = [];

                                orderItems.forEach(function (item) {
                                    var itemName = item.name;
                                    var quantity = item.quantity;
                                    var amount = item.base_price_money.amount / 100;

                                    // Push line items to the cashSaleItems array
                                    cashSaleItems.push({
                                        'Item Name': itemName,
                                        'Quantity': quantity,
                                        'Amount': amount,
                                    });
                                });

                                // Create Cash Sale for the entire order with aggregated line items
                                var cashSaleId = createCashSale({
                                    'Order Items': cashSaleItems, // Pass the array of line items
                                    'Order Date': order.created_at,
                                }, itemMapping);

                                var newSaleId = getCashSaleTranId(cashSaleId);
                                if (newSaleId) {
                                    log.audit('Cash Sale Created', 'Cash Sale ID: ' + newSaleId);
                                } else {
                                    log.error('Cash Sale Creation Error', 'Cash Sale creation failed.');
                                }
                            }
                        });

                        context.response.write(JSON.stringify(sqOrderResponse)); 
                    } else {
                        log.error('Square Order Error', 'No orders found in the response.');
                    }
                } else {
                    log.error('Square API Error', 'Status Code: ' + sqResponse.code);
                }
            } catch (ex) {
                log.error('Suitelet Error', ex.toString());
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
