/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/https', 'N/ui/serverWidget', 'N/log'], function (record, https, serverWidget, log) {
  function createForm(context, title, isResultsForm) {
    var form = serverWidget.createForm({ title: title });

    if (!isResultsForm) {
      form.addField({ id: 'custpage_date_from', type: serverWidget.FieldType.DATE, label: 'From Date' });
      form.addField({ id: 'custpage_date_to', type: serverWidget.FieldType.DATE, label: 'To Date' });
      form.addSubmitButton({ label: 'Submit' });
    }

    return form;
  }

  function addSublist(form, id, label) {
    return form.addSublist({ id: id, type: serverWidget.SublistType.LIST, label: label });
  }

  function addFieldToSublist(sublist, id, type, label) {
    sublist.addField({ id: id, type: type, label: label });
  }

  function fetchDataAndAddToSublist(url, token, requestBody, sublist, sublistFields) {
    try {
      var response = https.post({
        url: url + '?token=' + token,
        headers: { accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.code !== 200) {
        throw new Error('API responded with a non-200 status code: ' + response.code);
      }

      var responseData = JSON.parse(response.body);
      if (responseData.error) {
        throw new Error('API Error: ' + responseData.message);
      }

      if (responseData.data && responseData.data.length > 0) {
        responseData.data.forEach((dataItem, index) => {
          sublistFields.forEach(field => {
            sublist.setSublistValue({ id: field.id, line: index, value: dataItem[field.dataKey] });
          });
        });
      } else {
        log.debug({ title: 'API Response', details: 'No data returned from API.' });
      }
    } catch (error) {
      log.error({ title: 'API Fetch Error', details: error.message });
      // Optionally, add an error message to the form
    }
  }

  function onRequest(context) {
    if (context.request.method === 'GET') {
      var form = createForm(context, 'API Data Display', false);

      context.response.writePage(form);
    } else if (context.request.method === 'POST') {
      var form = createForm(context, 'API Data Display Results', true);
      var dateFrom = context.request.parameters.custpage_date_from;
      var dateTo = context.request.parameters.custpage_date_to;

      var apiToken = '531ace6502b18009f058b21c1e13bf9e4806830b';

      if (dateFrom && dateTo) {
        var requestBody = { start_date: dateFrom, end_date: dateTo };

        // Pull Cash Report data from the API
        var cashSublist = addSublist(form, 'custpage_cash_report_list', 'Cash Report Data');
        addFieldToSublist(cashSublist, 'custpage_title', serverWidget.FieldType.TEXT, 'Title');
        addFieldToSublist(cashSublist, 'custpage_value', serverWidget.FieldType.CURRENCY, 'Value');

        var cashApiUrl =
          'https://navigator.parkstreet.com/router.php/public_apis/get_data/cash_report?token=' + apiToken;

        fetchDataAndAddToSublist(cashApiUrl, apiToken, requestBody, cashSublist, [
          { id: 'custpage_title', dataKey: 'title' },
          { id: 'custpage_value', dataKey: 'total.value' },
        ]);

        // Pull Invoice Report data from the API

        var invoiceApiUrl = 'https://api.parkstreet.com/public_apis/get_invoices?token=' + apiToken;

        var invoiceSublist = addSublist(form, 'custpage_invoice_report_list', 'Invoice Report Data');

        addFieldToSublist(invoiceSublist, 'custpage_invoice_num', serverWidget.FieldType.TEXT, 'Invoice Number');
        addFieldToSublist(invoiceSublist, 'custpage_invoice_date', serverWidget.FieldType.DATE, 'Invoice Date');
        addFieldToSublist(invoiceSublist, 'custpage_po_number', serverWidget.FieldType.TEXT, 'PO Number');
        addFieldToSublist(invoiceSublist, 'custpage_client_name', serverWidget.FieldType.TEXT, 'Client Name');
        addFieldToSublist(invoiceSublist, 'custpage_customer_name', serverWidget.FieldType.TEXT, 'Customer Name');
        addFieldToSublist(
          invoiceSublist,
          'custpage_license_state_name',
          serverWidget.FieldType.TEXT,
          'License State Name',
        );
        addFieldToSublist(invoiceSublist, 'custpage_origin', serverWidget.FieldType.TEXT, 'Origin');
        addFieldToSublist(invoiceSublist, 'custpage_qbid', serverWidget.FieldType.TEXT, 'QB Id');
        addFieldToSublist(invoiceSublist, 'custpage_total', serverWidget.FieldType.CURRENCY, 'Total');
        addFieldToSublist(invoiceSublist, 'custpage_qty', serverWidget.FieldType.TEXT, 'Qty');

        fetchDataAndAddToSublist(invoiceApiUrl, apiToken, requestBody, invoiceSublist, [
          { id: 'custpage_invoice_num', dataKey: 'invoice_num' },
          { id: 'custpage_invoice_date', dataKey: 'invoice_date' },
          { id: 'custpage_po_number', dataKey: 'po_number' },
          { id: 'custpage_client_name', dataKey: 'client_name' },
          { id: 'custpage_customer_name', dataKey: 'customer_name' },
          { id: 'custpage_license_state_name', dataKey: 'license_state_name' },
          { id: 'custpage_origin', dataKey: 'origin' },
          { id: 'custpage_qbid', dataKey: 'qbid' },
          { id: 'custpage_total', dataKey: 'total.value' },
          { id: 'custpage_qty', dataKey: 'qty' },
        ]);

        context.response.writePage(form);
      }
    }
  }

  return { onRequest: onRequest };
});
