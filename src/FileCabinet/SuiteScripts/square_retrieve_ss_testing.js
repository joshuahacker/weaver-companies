/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/log', 'N/record'], function (https, log, record) {

    var itemMapping = {
        'BF Drink Ticket': '6059'
    };

    function createCashSale(orderInfo) {
        // New Cash Sale Record
        var cashSale = record.create({
            type: 'cashsale',
            isDynamic: false,
            defaultValues: {
                customform: 172,
                entity: 17, 
                subsidiary: 5,
           }
        });

        cashSale.setValue({
            fieldId: 'trandate',
            value: new Date(orderInfo['Order Date'])
        });


        var squareItemName = orderInfo['Item Name'];
        var netSuiteItemValue = itemMapping[squareItemName];
      
   log.debug('Item Name:', netSuiteItemValue)
      
        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: 1,
            value: netSuiteItemValue
        });
      

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            line: 1,
            value: orderInfo['Quantity']
        });

        cashSale.setSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            line: 1,
            value: orderInfo['Amount']
        });

    

        // Save the Cash Sale record
        var cashSaleId = cashSale.save();

        return cashSaleId;
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var sqToken = 'EAAAEa-iM-IsOHsG4R6icz6_TiubHr_-NV4nLqJ6Ht0vR6r0WjiAE5jRVhkV9ZVQ';
            var sqLocation = 'J55ZSCT943J06';

            var url = 'https://connect.squareup.com/v2/orders/batch-retrieve';
            var squareHeaders = {
                'Authorization': 'Bearer ' + sqToken,
                'Square-Version': '2023-09-25',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            var requestSqData = {
                'location_id': sqLocation,
                'order_ids': [
                    'NxnhZ8cnqPCN2tQE9LYHcSlyk77YY',
                ]
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
                        var orderDetails = [];

                        sqOrderResponse.orders.forEach(function (order) {
                            var itemName = order.line_items[0].name;
                            var quantity = order.line_items[0].quantity;
                            var amount = order.line_items[0].base_price_money.amount / 100;
                            var orderDate = order.created_at;

                            orderDetails.push({
                                'Item Name': itemName,
                                'Quantity': quantity,
                                'Amount': amount,
                                'Order Date': orderDate
                            });
                        });

                        log.audit('Square Order #:', sqResponse.body);

                        // Create Cash Sale for each order
                        orderDetails.forEach(function (orderInfo) {
                            var cashSaleId = createCashSale(orderInfo);
                            if (cashSaleId) {
                                log.audit('Cash Sale Created', 'Cash Sale ID: ' + cashSaleId);
                            } else {
                                log.error('Cash Sale Creation Error', 'Cash Sale creation failed.');
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
