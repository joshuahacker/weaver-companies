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
    upccode: escapeXml(purchaseOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_po_upccode_field', line: i})), 
    item: escapeXml(purchaseOrderRecord.getSublistText({sublistId: 'item', fieldId: 'item', line: i})), 
    rate: escapeXml(purchaseOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i})),
        name: escapeXml(purchaseOrderRecord.getSublistValue({sublistId: 'item', fieldId: 'custcol_displayname', line: i}))

};
                    
                    itemData.items.push(JSON.stringify(item)); 
                }
            }
            
            log.debug('itemData', itemData); 
        var htmlContent = '<pdf>' +
    '<head>' +
    '<style type="text/css">' +
    'body {margin-left: 0.30in; margin-top: 0.40in; width: 8.5in; padding: 25px;}' +
    'table.main {width: 100%; height: auto; verticalalign: top; font-size: 14px; border: 0px; padding-bottom: 4px; }' +
    'td.label {width: 2.5in; height: 1in; border: 0px; ;}' +
    'tr {vertical-align: middle; border: 0px}' +
    'td {padding: 2px}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<table class="main" style="size: Letter;">';

htmlContent += '<#list itemData.items as item>' +
            '<#assign currentItem = item?eval />' +
    '<#if item_index % 3 == 0>' +
    '<tr>' +
    '</#if>' +
    '<td class="label">' +
    '<table>' +
    '<tr><td style="padding-bottom: 2px"><barcode bar-width="1" bar-height="1.5" codetype="code128" showtext="false" value="${currentItem.upccode}"></barcode></td></tr>' +
    '<tr><td style="padding-left: 15px; padding-top: 4px;">${currentItem.item?substring(0, currentItem.item?index_of(" "))}</td></tr>' +
    '<tr><td style="padding-left: 10px;" >${currentItem.name} </td></tr>' +
    '<tr><td style="margin-left: .60in;" colspan="2">$${currentItem.rate}</td></tr>' +
    '</table>' +
    '</td>' +
    '<#if (item_index % 3 == 2) || (item_index + 1) == itemData.items?size>' +
    '</tr>' +
    '</#if>' +
    '</#list>' +
    '</table>' +
    '</body>' +
    '</pdf>';


        

            log.debug('htmlContent', htmlContent); 

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

  function escapeXml(unsafeStr) {
    var safeStr = String(unsafeStr);
    return safeStr.replace(/[<>&'"]/g, function(c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}


    return {
        onRequest: onRequest
    };
    
});