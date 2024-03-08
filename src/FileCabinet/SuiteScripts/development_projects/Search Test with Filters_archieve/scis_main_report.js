/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 'N/search', 'N/log', 'N/format'], function(serverWidget, search, log, format) {
 
  // Format the dates in "MM/dd/yy" format
  function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return ('00' + month).slice(-2) + '/' + ('00' + day).slice(-2) + '/' + ('' + year).slice(-2);
  }
 
  function onRequest(context) {
    if (context.request.method === 'GET') {
      // Create the Suitelet form
      var form = serverWidget.createForm({
          title: 'Nearest Green Distillery - Retail Sales'
      });

             // Form Tabs
             var reportsDateTab = form.addTab({
              id: 'custpage_datetab',
              label: 'Reports by Date'
          });
       
          var reportsAnalyticsTab = form.addTab({
              id: 'custpage_reportstab',
              label: 'Report Analytics'
          });
       
 
      // Add the date filter conditions to the filters
    if (dateFilter.fromDate && dateFilter.toDate && !isNaN(dateFilter.fromDate.getTime()) && !isNaN(dateFilter.toDate.getTime())) {
      log.debug('Valid dateFilter:', dateFilter);
      salesSearch.filters.push(search.createFilter({
        name: 'trandate',
        operator: search.Operator.WITHIN,
        values: [formatDate(dateFilter.fromDate), formatDate(dateFilter.toDate)]
      }));
    } else {
      log.debug('Invalid or missing dateFilter. Using default date range.');
      var defaultFromDate = new Date();
      defaultFromDate.setDate(defaultFromDate.getDate() - 30);
      salesSearch.filters.push(search.createFilter({
        name: 'trandate',
        operator: search.Operator.WITHIN,
        values: [formatDate(defaultFromDate), formatDate(new Date())]
      }));
    }

      log.debug(defaultFromDate)

      // Add Date Filter Fields
      var fromDateField = form.addField({
          id: 'custpage_from_date',
          type: serverWidget.FieldType.DATE,
          label: 'From Date',
          container: 'custpage_datetab'
      });
 
      var toDateField = form.addField({
          id: 'custpage_to_date',
          type: serverWidget.FieldType.DATE,
          label: 'To Date',
          container: 'custpage_datetab'
      });
 
  
 
    log.debug('Date Filter:', dateFilter)
 

    context.response.writePage(form);
    
  } else if (context.request.method === 'POST') {
      // Handle the POST request with the parameters
      var params = context.request.parameters;
 
 
      // Create the response
      var response = {
          message: 'Parameters received',
          params: params
      };
 
      // Send the response as JSON
      context.response.write(JSON.stringify(response));
  }
}
 
function runSalesSearch(dateFilter, form, serverWidget) {        
  // Create search columns for summary
  var summaryColumns =  [
    search.createColumn({ name: "trandate", summary: "GROUP", function: "weekOfYear", sort: search.Sort.DESC, label: "Date" }),
    search.createColumn({ name: "tranid", summary: "COUNT", label: "Transaction Count" }),
    search.createColumn({ name: "quantity", summary: "SUM", function: 'absoluteValue', label: "Total Units Sold" }),
    search.createColumn({ name: "grossamount", summary: "SUM", label: "Gross Sales" }),
    search.createColumn({ name: "formulacurrency1", summary: "SUM", formula: "Case When {type}='Credit Memo' then {amount} ELSE NULL END", label: "Total Returns" }),
    search.createColumn({ name: "formulacurrency2", summary: "SUM", formula: "Case When {item.type}='Discount' then ABS({amount}) else 0 end", label: "Total Discount" }),
    search.createColumn({ name: "formulacurrency3", summary: "SUM", formula: "{taxamount}", label: "Total Taxes" }),
    search.createColumn({ name: "netamount", summary: "SUM", label: "Net Sales" })    
  ];
 
  // Create sales search
  var salesSearch = search.create({
    type: search.Type.TRANSACTION,
    filters: [
      ["type","anyof","CashSale","CustInvc","CustCred"], 
      "AND", 
      ["account","noneof","110"], 
      "AND", 
      ["amount","notequalto","0.00"], 
      "AND", 
      ["mainline","is","F"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["item.type","noneof","Markup","Payment","Subtotal"], 
      "AND", 
      ["memo","doesnotcontain","VOID"], 
      "AND", 
      ["memomain","doesnotcontain","VOID"], 
      "AND", 
      ["location","anyof","14"], 
      "AND", 
      ["salesrep","anyof","@ALL@"], 
      "AND", 
      ["formulatext: CASE WHEN {entity} LIKE '%ipad%' OR {entity} LIKE '%golf club%' THEN {entity} ELSE '' END","is",""]
    ],
    columns: summaryColumns  
  });

  
  // Run the sales search
  var searchResults = salesSearch.run();
  
  // Iterate through the search results and create sublist fields
  var sublistFields = [];
  searchResults.each(function(result) {
    sublistFields.push(
      form.addField({
        id: 'custpage_date_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.LABEL,
        label: formatDate(new Date(result.getValue("GROUPTRANSACTIONDATE", "GROUP")))
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_transaction_count_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.INTEGER,
        label: 'Transaction Count'
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_total_units_sold_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.INTEGER,
        label: 'Total Units Sold'
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_gross_sales_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.CURRENCY,
        label: 'Gross Sales'
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_total_returns_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.CURRENCY,
        label: 'Total Returns'
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_total_discount_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.CURRENCY,
        label: 'Total Discount'
      })
    );  
    sublistFields.push(
      form.addField({
        id: 'custpage_total_taxes_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.CURRENCY,
        label: 'Total Taxes'
      })
    );
    sublistFields.push(
      form.addField({
        id: 'custpage_net_sales_' + result.getValue("GROUPTRANSACTIONDATE", "GROUP"),
        type: serverWidget.FieldType.CURRENCY,
        label: 'Net Sales'
      })
    );
  
    return true;
  });
  
  function createSublist(form, sublistFields) {
    // Create a sublist to display the search results
    var sublist = form.addSublist({
      id: 'custpage_sales_sublist',
      type: serverWidget.SublistType.LIST,
      label: 'Sales Summary'
    });
  
    // Add sublist fields to the sublist
    sublistFields.forEach(function(field) {
      sublist.addField({
        id: field.id,
        type: field.type,
        label: field.label
      });
    });
  
  }
  
  // Run the sales search and populate the form
  runSalesSearch(dateFilter);
  createSublist(form, sublistFields);
  
  // Display the form 
  context.response.writePage(form);

    }

    return {
      onRequest: onRequest
    }
});