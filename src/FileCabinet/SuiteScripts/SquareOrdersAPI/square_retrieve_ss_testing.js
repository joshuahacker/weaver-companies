/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/log', 'N/record', 'N/ui/serverWidget'], function (https, log, record, serverWidget) {

    var itemMapping = {
        'BF Drink Ticket': '1432',
        'BF Food Ticket': '6077'
    };

   

    function createCashSale(orderInfo) {
        // New Cash Sale Record
        var cashSale = record.create({
            type: record.Type.CASH_SALE,
            isDynamic: false,
            defaultValues: {
                customform: 172,
                entity: 762, 
                subsidiary: 5,
           }
        });

        cashSale.setValue({
            fieldId: 'memo',
            value: 'Square Orders from Balloon Fest',
        })

        cashSale.setValue({
            fieldId: 'location',
            value: 14
        })

        cashSale.setValue({
            fieldId: 'trandate',
            value: new Date(orderInfo['Order Date'])
        });


        var squareItemName = orderInfo['Item Name'];
        var netSuiteItemValue = itemMapping[squareItemName];
 
        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: 0,
            value: netSuiteItemValue
        });
      

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: 0,
            value: orderInfo['Quantity']
        });

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            line: 0,
            value: orderInfo['Amount']
        });

        // Save the Cash Sale record
        var cashSaleId = cashSale.save();

        return cashSaleId;
    }

    function cashSaleTranId (cashSaleId) {

    var cashSaleTranId = record.load({
        type: record.Type.CASH_SALE,
        id: cashSaleId,
        });

       var newTranId = cashSaleTranId.getValue({
            fieldId: 'tranid'
        });

        return newTranId
    };

//Connect Square API and get Orders
    function onRequest(context) {
        if (context.request.method === 'GET'){

            var form = serverWidget.createForm({
                title: 'Square Order Ids',
                hideNavBar: false
            });

            form.addField({
                id: 'custpage_square_orders',
                label: 'Square Orders',
                type: serverWidget.FieldType.TEXTAREA, 
                displaySize: { 
                    height: 5,
                    width: 50
                }
                });

                form.addSubmitButton({
                    label: 'Submit'
                })

                context.response.writePage(form)

        } else if (context.request.method === 'POST') {

            var orderIds = context.request.parameters.custpage_square_orders.split('\n')
                .map(function(orderId) {
                    return orderId.trim(); // Remove leading/trailing whitespace
                })
                .filter(function(orderId) {
                    return orderId !== ''; // Filter out empty strings
                });


            var sqToken = 'EAAAEa-iM-IsOHsG4R6icz6_TiubHr_-NV4nLqJ6Ht0vR6r0WjiAE5jRVhkV9ZVQ';

            log.debug('Sq Orders:', orderIds)

            var sqLocation = 'J55ZSCT943J06';

            var url = 'https://connect.squareup.com/v2/orders/batch-retrieve';
            var squareHeaders = {
                'Authorization': 'Bearer ' + sqToken,
                'Square-Version': '2023-09-25',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

// NxnhZ8cnqPCN2tQE9LYHcSlyk77YY


            var requestSqData = {
                'location_id': sqLocation,
                'order_ids': orderIds
            };


            try {
                var sqResponse = https.post({
                    url: url,
                    headers: squareHeaders,
                    body: JSON.stringify(requestSqData)
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
                                        'Amount': amount
                                    });
                                });
                
                                // Create Cash Sale for the entire order with aggregated line items
                                var cashSaleId = createCashSale({
                                    'Order Items': cashSaleItems, // Pass the array of line items
                                    'Order Date': order.created_at
                                });
                
                                var newSaleId = cashSaleTranId(cashSaleId);
                                if (newSaleId) {
                                    log.audit('Cash Sale Created', 'Cash Sale ID: ' + newSaleId);
                                } else {
                                    log.error('Cash Sale Creation Error', 'Cash Sale creation failed.');
                                }
                            }
                        });

                        context.response.write(JSON.stringify(orderDetails));
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
