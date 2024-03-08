
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget', 'N/log'], function(search, sw, log) {

function loadPOSTotal (){

  var summaryColumns = [ 
    search.createColumn({
      name: "trandate", 
      summary: "GROUP",  
      function: "month",
      sort: search.Sort.DESC,
      label: "Date"
    }),
    search.createColumn({ 
      name: "tranid", 
      summary: "COUNT", 
      label: "Document Number" 
    }),
    search.createColumn({ 
      name: "grossamount", 
      summary: "SUM", 
      label: "PoS Total" 
    }),

    search.createColumn({ 
      name: "item", 
      summary: "COUNT", 
      label: "Items", 
    }),
  ]

  var posTotal = search.create({
     type: search.Type.TRANSACTION,
     filters: [
      ["type","anyof","CashSale","CustInvc","CustCred"], 
      "AND", 
      ["item","noneof","@NONE@"], 
      "AND", 
      ["taxline","is","F"], 
      "AND", 
      ["account","anyof","817","54","936","898"], 
      "AND", 
      ["internalid","anyof","12042","13282","55055","61285","61618","60985"]
   ],
    columns: summaryColumns
});

var posTotalResults = posTotal.run();
var posTotalSummaryResults = [];

      posTotalResults.each(function(result) {
        var date = result.getValue(summaryColumns[0]);


        var summary = {
          date: date,
          tranid: result.getValue(summaryColumns[1]),
          grossamount: result.getValue(summaryColumns[2]),
          taxtotal: result.getValue(summaryColumns[3]),
          item: result.getValue(summaryColumns[4]),
        };

        posTotalSummaryResults.push(summary);

        return true;
      });

        return posTotalSummaryResults;

};

function loadDiscountTotal () {

    summaryColumns = 
   [

      search.createColumn({
          name: "trandate", 
          summary: "GROUP",  
          function: "month",
          sort: search.Sort.DESC,
          label: "Date"
        }),
      search.createColumn({
         name: "tranid",
         summary: "COUNT",
         label: "Document Number"
      }),
      search.createColumn({
         name: "formulacurrency1",
         summary: "SUM",
         formula: "Case When {item.type}='Discount' then ABS({amount}) else 0 end",
         label: "Formula (Currency)"
      }),
       search.createColumn({
         name: "costestimate",
         summary: "SUM",
         label: "Total Costs of Goods"
      })
   ];

  var discountTotal = search.create({
   type: "transaction",
   filters:
   [
      ["type","anyof","CashSale"], 
      "AND", 
      ["internalid","anyof","12042","13282","55055","61285","61618","60985"]
   ],
   columns: summaryColumns
});

var discountTotalResults = discountTotal.run();
var discountTotalSummaryResults = [];

      discountTotalResults.each(function(result) {

        var summary = {
          date: result.getValue(summaryColumns[0]),
          tranid: result.getValue(summaryColumns[1]),
          discount: result.getValue(summaryColumns[2]),
          cogs: result.getValue(summaryColumns[3]),
        };

        discountTotalSummaryResults.push(summary);

  log.debug({
            title: 'Discount and COGS for Transaction ' + summary.tranid,
            details: 'Discount: ' + summary.discount + ', COGS: ' + summary.cogs
        });
        return true;
      });

        return discountTotalSummaryResults;
  
}

function loadTotalCOGS () {
  var totalCOGS = search.create({
  });

  return;

}

function onRequest(context) {

   if(context.request.method === 'GET') {

    var form = sw.createForm({
      title: 'Transaction Summary',
      hideNavBar: false
    });
 
    // Add a sublist to display the results
      var sublist = form.addSublist({
          id: 'custpage_results_sublist',
          type: sw.SublistType.LIST,
          label: 'Transaction Summary'
      });

        // Add columns to the sublist
            sublist.addField({ id: 'trandate', type: sw.FieldType.TEXT, label: 'Date' });
            sublist.addField({ id: 'tranid', type: sw.FieldType.TEXT, label: 'Transaction ID' });
            sublist.addField({ id: 'grossamount', type: sw.FieldType.CURRENCY, label: 'PoS Sale Amount' });
            sublist.addField({ id: 'taxtotal', type: sw.FieldType.CURRENCY, label: 'Total Tax' });
            sublist.addField({ id: 'totalrevenue', type: sw.FieldType.CURRENCY, label: 'Total Revenue' });
            sublist.addField({ id: 'discounttotal', type: sw.FieldType.CURRENCY, label: 'Total Discount' });
            sublist.addField({ id: 'netrevenue', type: sw.FieldType.CURRENCY, label: 'Net Revenue' });
            sublist.addField({ id: 'cogstotal', type: sw.FieldType.CURRENCY, label: 'COGS Total' });
            sublist.addField({ id: 'netmargin', type: sw.FieldType.CURRENCY, label: 'Net Margin'});

        // Set sublist values

         var posTotalSummaryResults = loadPOSTotal();
        var discountTotalSummaryResults = loadDiscountTotal();

        for (var i = 0; i < posTotalSummaryResults.length; i++) {
            var date = posTotalSummaryResults[i].date;
            var grossAmount = posTotalSummaryResults[i].grossamount;
            var taxTotal = posTotalSummaryResults[i].taxtotal;
            var totalRevenue = grossAmount - taxTotal;

            var discountTotal = 0;
            var cogsTotal = 0;

            // Find the discount and COGS totals for the corresponding date
            for (var j = 0; j < discountTotalSummaryResults.length; j++) {
                if (posTotalSummaryResults[i].date === discountTotalSummaryResults[j].date) {
                    discountTotal += discountTotalSummaryResults[j].discount;
                    cogsTotal += discountTotalSummaryResults[j].cogs;
                }
            }

            var netRevenue = totalRevenue - discountTotal;
            var netMargin = netRevenue - cogsTotal;

            sublist.setSublistValue({ id: 'trandate', line: i, value: date });
            sublist.setSublistValue({ id: 'tranid', line: i, value: posTotalSummaryResults[i].tranid });
            sublist.setSublistValue({ id: 'grossamount', line: i, value: grossAmount });
            sublist.setSublistValue({ id: 'taxtotal', line: i, value: taxTotal });
            sublist.setSublistValue({ id: 'totalrevenue', line: i, value: totalRevenue });
            sublist.setSublistValue({ id: 'discounttotal', line: i, value: discountTotal });
            sublist.setSublistValue({ id: 'netrevenue', line: i, value: netRevenue });
            sublist.setSublistValue({ id: 'cogstotal', line: i, value: cogsTotal });
            sublist.setSublistValue({ id: 'netmargin', line: i, value: netMargin });
        }
        
      // Display the form
      context.response.writePage(form);
    }

}

  return {
    onRequest: onRequest
 };

});