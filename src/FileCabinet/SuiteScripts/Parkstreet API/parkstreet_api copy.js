/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/https", "N/ui/serverWidget", "N/log"], function (
  record,
  https,
  serverWidget,
  log
) {
  function onRequest(context) {
    if (context.request.method === "GET") {
      // main form created
      var form = serverWidget.createForm({
        title: "API Data Display",
      });

      // date to and date from fields
      var dateFromField = form.addField({
        id: "custpage_date_from",
        type: serverWidget.FieldType.DATE,
        label: "From Date",
      });

      var dateToField = form.addField({
        id: "custpage_date_to",
        type: serverWidget.FieldType.DATE,
        label: "To Date",
      });

      // form submit
      form.addSubmitButton({
        label: "Submit",
      });

      context.response.writePage(form);
    } else if (context.request.method === "POST") {
      // Handle POST request
      var form = serverWidget.createForm({
        title: "API Data Display Results",
      });

      // check if submitted parameters already
      var dateFrom = context.request.parameters.custpage_date_from;
      var dateTo = context.request.parameters.custpage_date_to;

      if (dateFrom && dateTo) {
        // cash sublist
        var cashSublist = form.addSublist({
          id: "custpage_cash_report_list",
          type: serverWidget.SublistType.LIST,
          label: "Cash Report Data",
        });

        // sublist columns + loop thru
        cashSublist.addField({
          id: "custpage_title",
          type: serverWidget.FieldType.TEXT,
          label: "Title",
        });

        cashSublist.addField({
          id: "custpage_value",
          type: serverWidget.FieldType.TEXT,
          label: "Value",
        });

        // Define API request body
        var requestBody = {
          sort_date_type: ["payment_date"],
          start_date: dateFrom,
          end_date: dateTo,
        };

        // Fetch data from the modified external API
        var cashToken = "531ace6502b18009f058b21c1e13bf9e4806830b";
        var cashApiUrl =
          "https://navigator.parkstreet.com/router.php/public_apis/get_data/cash_report?token=" +
          cashToken;

        var response = https.post({
          url: cashApiUrl,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // Log the API response
        log.debug({
          title: "API Response",
          details: response.body,
        });

        if (response.body) {
          var responseData = JSON.parse(response.body);

          // Check for API error
          if (responseData.hasError) {
            // Display the error message
            cashSublist.addField({
              id: "custpage_api_error",
              label: "API Error",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue: "<div>" + responseData.msg + "</div>",
            });
          } else if (
            responseData.balances &&
            responseData.balances.length > 0
          ) {
            // Iterate through the response data and add it to the sublist
            for (var i = 0; i < responseData.balances.length; i++) {
              cashSublist.setSublistValue({
                id: "custpage_title",
                line: i,
                value: responseData.balances[i].title,
              });

              cashSublist.setSublistValue({
                id: "custpage_value",
                line: i,
                value: responseData.balances[i].total.value,
              });
            }
          } else {
            // If no data were found, display a message
            form.addField({
              id: "custpage_no_data_message",
              label: "No Data Found",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue: "<div>No data were found from the API.</div>",
            });

            // Handle errors or empty response from the API
            form.addField({
              id: "custpage_api_error",
              label: "API Error",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue: "<div>Error fetching data from the API.</div>",
            });
          }
        }

        // Add a sublist to display expense report data
        var expenseSublist = form.addSublist({
          id: "custpage_expense_report_list",
          type: serverWidget.SublistType.LIST,
          label: "Expense Report Data",
        });

        // Define expense sublist columns
        expenseSublist.addField({
          id: "custpage_amount",
          type: serverWidget.FieldType.TEXT,
          label: "Amount",
        });

        expenseSublist.addField({
          id: "custpage_vendor",
          type: serverWidget.FieldType.TEXT,
          label: "Vendor",
        });

        // Define API request body for the expense report
        var expenseRequestBody = {
          date_from: dateFrom,
          date_to: dateTo,
        };

        // Fetch data from the expense report API endpoint
        var expenseToken = "531ace6502b18009f058b21c1e13bf9e4806830b";
        var expenseApiUrl =
          "https://navigator.parkstreet.com/router.php/public_apis/get_data/expense_report?token=" +
          expenseToken;

        var expenseResponse = https.post({
          url: expenseApiUrl,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseRequestBody),
        });

        // Log the API response for expense report
        log.debug({
          title: "Expense API Response",
          details: expenseResponse.body,
        });

        if (expenseResponse.body) {
          var expenseData = JSON.parse(expenseResponse.body);

          if (expenseData.data && expenseData.data.length > 0) {
            for (var i = 0; i < expenseData.data.length; i++) {
              expenseSublist.setSublistValue({
                id: "custpage_amount",
                line: i,
                value: expenseData.data[i].amount,
              });

              expenseSublist.setSublistValue({
                id: "custpage_vendor",
                line: i,
                value: expenseData.data[i].vendor,
              });
            }
          } else {
            // If no expense data were found, display a message / API error
            form.addField({
              id: "custpage_no_expense_data_message",
              label: "No Expense Data Found",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue:
                "<div>No expense data were found from the API.</div>",
            });

            form.addField({
              id: "custpage_expense_api_error",
              label: "Expense API Error",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue:
                "<div>Error fetching expense data from the API.</div>",
            });
          }
        }

        // Invoices
        var invoiceSublist = form.addSublist({
          id: "custpage_invoice_report_list",
          type: serverWidget.SublistType.LIST,
          label: "Invoice Report Data",
        });

        // Define API request body for the invoice report
        var invoiceRequestBody = {
          date_from: dateFrom,
          date_to: dateTo,
        };

        // Fetch data from the invoice report API endpoint
        var invoiceToken = "531ace6502b18009f058b21c1e13bf9e4806830b";
        var invoiceApiUrl =
          "https://api.parkstreet.com/public_apis/get_invoices?token=" +
          invoiceToken;

        var invoiceResponse = https.post({
          url: invoiceApiUrl,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceRequestBody),
        });

        // Log the API response for invoice report
        log.debug({
          title: "Invoice API Response",
          details: invoiceResponse.body,
        });

        if (invoiceResponse.body) {
          var invoiceData = JSON.parse(invoiceResponse.body);

          if (invoiceData.data && invoiceData.data.length > 0) {
            // Define sublist columns
            invoiceSublist.addField({
              id: "custpage_invoice_num",
              type: serverWidget.FieldType.TEXT,
              label: "Invoice Number",
            });

            invoiceSublist.addField({
              id: "custpage_invoice_date",
              type: serverWidget.FieldType.TEXT,
              label: "Invoice Date",
            });

            invoiceSublist.addField({
              id: "custpage_po_number",
              type: serverWidget.FieldType.TEXT,
              label: "PO Number",
            });

            invoiceSublist.addField({
              id: "custpage_client_name",
              type: serverWidget.FieldType.TEXT,
              label: "Client Name",
            });

            invoiceSublist.addField({
              id: "custpage_customer_name",
              type: serverWidget.FieldType.TEXT,
              label: "Customer Name",
            });

            invoiceSublist.addField({
              id: "custpage_license_state_name",
              type: serverWidget.FieldType.TEXT,
              label: "License State Name",
            });

            invoiceSublist.addField({
              id: "custpage_origin",
              type: serverWidget.FieldType.TEXT,
              label: "Origin",
            });

            invoiceSublist.addField({
              id: "custpage_qbid",
              type: serverWidget.FieldType.TEXT,
              label: "QB Id",
            });

            invoiceSublist.addField({
              id: "custpage_total",
              type: serverWidget.FieldType.TEXT,
              label: "Total",
            });

            invoiceSublist.addField({
              id: "custpage_qty",
              type: serverWidget.FieldType.TEXT,
              label: "Qty",
            });

            // Loop through invoice data and add rows to the sublist
            for (var i = 0; i < invoiceData.data.length; i++) {
              var invoice = invoiceData.data[i];

              // Add a new row to the sublist
              invoiceSublist.setSublistValue({
                id: "custpage_invoice_num",
                line: i,
                value: invoice.invoice_num,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_invoice_date",
                line: i,
                value: invoice.invoice_date,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_po_number",
                line: i,
                value: invoice.po_number,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_client_name",
                line: i,
                value: invoice.client_name,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_customer_name",
                line: i,
                value: invoice.customer_name,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_license_state_name",
                line: i,
                value: invoice.license_state_name,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_origin",
                line: i,
                value: invoice.origin,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_qbid",
                line: i,
                value: invoice.QB_Id,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_total",
                line: i,
                value: invoice.total,
              });

              invoiceSublist.setSublistValue({
                id: "custpage_qty",
                line: i,
                value: invoice.qty,
              });
            }
          } else {
            // If no invoice data were found, display a message
            form.addField({
              id: "custpage_no_invoice_data_message",
              label: "No Invoice Data Found",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue:
                "<div>No invoice data were found from the API.</div>",
            });

            // Handle errors or empty response for invoice report
            form.addField({
              id: "custpage_invoice_api_error",
              label: "Invoice API Error",
              type: serverWidget.FieldType.INLINEHTML,
              defaultValue:
                "<div>Error fetching invoice data from the API.</div>",
            });

            form.addField({
              id: "custpage_error",
              type: serverWidget.FieldType.INLINEHTML,
              label: "Error",
              defaultValue:
                "<div>Please provide both From Date and To Date.</div>",
            });
          }
        }
        context.response.writePage(form);
      }
    }
  }

  return {
    onRequest: onRequest,
  };
});
