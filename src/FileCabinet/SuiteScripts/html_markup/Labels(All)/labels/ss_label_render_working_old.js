/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/render', 'N/record', 'N/log'], function(render, record, log) {
    function onRequest(context) {
        var request = context.request;
        var response = context.response;

        if (request.method === 'GET') {
            var purchaseOrderId = request.parameters.purchaseOrderId;
            var purchaseOrderRecord = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: purchaseOrderId
            });

var itemData = {items: []};
            var itemCount = purchaseOrderRecord.getLineCount({sublistId: 'item'});
            for (var i = 0; i < itemCount; i++) {
                var quantity = purchaseOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                for (var q = 0; q < quantity; q++) {
                    var item = {
                        item: purchaseOrderRecord.getSublistText({sublistId: 'item', fieldId: 'item', line: i}),
                        rate: purchaseOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i})
                    };
                    itemData.items.push(JSON.stringify(item)); // Convert item object to JSON string
                }
            }
            
            log.debug('itemData', itemData); // Log itemData object to check its contents
            

            var htmlContent = '<pdf>' +
            '<html>' +
            '<head>' +
            '<style>' +
            'body {font-family: Arial, sans-serif;}' +
            'table {border-collapse: collapse; width: 100%;}' +
            'th, td {border: 1px solid #dddddd; text-align: left; padding: 8px;}' +
            '</style>' +
            '</head>' +
            '<body>' +
            '<table>' +
            '<tr>'+
            '<th>Item</th>' +
            '<th>Rate</th>' +
            '</tr>';

            htmlContent += '<#list itemData.items as itemString>' + // Use a different variable name to represent each JSON string
            '<#assign item = itemString?eval />' + // Parse the JSON string to an object
            '<tr>' +
            '<td>${item.item}</td>' +
            '<td>${item.rate}</td>' +
            '</tr>' +
            '</#list>'
            
        htmlContent +=  '</table>' + 
          '</body>' + 
          '</html>' +
          '</pdf>';

            log.debug('htmlContent', htmlContent); // Log htmlContent string to check its structure

            var renderer = render.create();

            renderer.templateContent = htmlContent;
            
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "itemData",
                data:  itemData
            });

            var pdfFile = renderer.renderAsPdf();
            response.setHeader({name: 'Content-Type', value: 'application/pdf'});
            response.writeFile(pdfFile, true);
        }
    }

    return {
        onRequest: onRequest
    };
    
});