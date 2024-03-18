/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/render', 'N/record', 'N/log'], function (render, record, log) {
	function onRequest(context) {
		var request = context.request;
		var response = context.response;

		if (request.method === 'GET') {
			var purchaseOrderId = request.parameters.purchaseOrderId;
			var purchaseOrderRecord = record.load({
				type: record.Type.PURCHASE_ORDER,
				id: purchaseOrderId
			});

			var itemData = { items: [] };
			var itemCount = purchaseOrderRecord.getLineCount({ sublistId: 'item' });
			for (var i = 0; i < itemCount; i++) {
				var quantity = purchaseOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
				for (var q = 0; q < quantity; q++) {
					var item = {
						item: purchaseOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'displayname', line: i }), // This will be overwritten
						upccode: purchaseOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_po_upccode_field', line: i }),
						item: purchaseOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }), // This overwrites the previous 'item'
						rate: purchaseOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
						name: purchaseOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_displayname', line: i })
					};

					itemData.items.push(JSON.stringify(item));
				}
			}

			log.debug('itemData', itemData);
			var htmlContent =
				'<pdf>' +
				'<head>' +
				'<style type="text/css">' +
				'body {margin-left: 0.40in; margin-top: .40in; width: 8.5in; padding: .25in;}' +
				'table.main {width: 100%; height: auto; vertical-align: top; font-size: 6px; border: 0px; padding-bottom: 4px;}' +
				'td.label {width: 2.1in; height: 1in; text-align: center; border: 0px; padding: 15px;}' +
				'tr {text-align: center; vertical-align: middle;}' +
				'</style>' +
				'</head>' +
				'<body>' +
				'<table class="main" style="size: Letter;">';

			htmlContent +=
				'<#list itemData.items as item>' +
				'<#assign currentItem = item?eval />' +
				'<#if item_index % 3 == 0>' +
				'<tr>' +
				'</#if>' +
				'<td class="label">' +
				'<table>' +
				'<tr><td><barcode bar-width=".75" bar-height=".75" codetype="code128" showtext="false" value="${currentItem.upccode}"></barcode></td></tr>' +
				'<tr><td>${currentItem.name}</td></tr>' +
				'<tr><td>${currentItem.rate}</td></tr>' +
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
				alias: 'itemData',
				data: itemData
			});

			var pdfFile = renderer.renderAsPdf();
			response.setHeader({ name: 'Content-Type', value: 'application/pdf' });
			response.writeFile(pdfFile, true);
		}
	}

	return {
		onRequest: onRequest
	};
});
