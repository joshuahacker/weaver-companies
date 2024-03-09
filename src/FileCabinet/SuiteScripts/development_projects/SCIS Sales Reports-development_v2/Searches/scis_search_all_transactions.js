define(['N/search', 'N/log'], function(search, log) {
    function runSalesSearch() {        
        var reportsAllTransactions = search.create({
           type: "transaction",
           filters:
           [
              ["type","anyof","CashSale","CustInvc","CustCred"], 
              "AND", 
              ["account","noneof","110"], 
              "AND", 
              ["amount","notequalto","0.00"], 
              "AND", 
              ["source","anyof","SCIS"], 
              "AND", 
              ["taxline","is","F"], 
              "AND", 
              ["item.type","noneof","Markup","Payment","Subtotal"], 
              "AND", 
              ["memo","doesnotcontain","VOID"], 
              "AND", 
              ["memomain","doesnotcontain","VOID"], 
              "AND", 
              ["custbody_ns_pos_transaction_status","anyof","3","6","7"], 
              "AND", 
              ["location","anyof","14"]
           ],
           columns:
           [
              search.createColumn({
                 name: "tranid",
                 summary: "GROUP",
                 label: "Document Number",
                 sort: search.Sort.DESC,
              }),
              search.createColumn({
                 name: "quantity",
                 summary: "SUM",
                 label: "Units Sold"
              }),
              search.createColumn({
                 name: "grossamount",
                 summary: "SUM",
                 label: "Gross Sales"
              }),
              search.createColumn({
                 name: "formulacurrency1",
                 summary: "SUM",
                 formula: "Case When {type}='Credit Memo' then {amount} ELSE NULL END",
                 label: "Total Returns"
              }),
              search.createColumn({
                 name: "formulacurrency2",
                 summary: "SUM",
                 formula: "Case When {item.type}='Discount' then ABS({amount}) else 0 end",
                 label: "Total Discount"
              }),
              search.createColumn({
                 name: "formulacurrency3",
                 summary: "SUM",
                 formula: "{taxamount}",
                 label: "Total Taxes"
              }),
              search.createColumn({
                 name: "netamount",
                 summary: "SUM",
                 label: "Net Sales"
              })
           ]
        });
            
            log.audit({ title: 'All Transactions Search: Search Created' });
  
            // Run the search and retrieve the results
            var resultSet = reportsAllTransactions.runPaged().count;
            var summaryResults = [];
  
            resultSet.each(function(result) {
                var date = result.getValue(summaryColumns[0]);
          
                var summary = {
                    date: date,
                    unitsSold: result.getValue(summaryColumns[1]),
                    grossSales: result.getValue(summaryColumns[2]),
                    totalReturns: result.getValue(summaryColumns[3]),
                    totalDiscounts: result.getValue(summaryColumns[4]),
                    totalTaxes: result.getValue(summaryColumns[5]),
                    netSales: result.getValue(summaryColumns[6]),
                    
                };
  
                summaryResults.push(summary);
                return true;
            }, -1);

            log.audit({ title: 'All Transactions Search: Results Provided'});

            return summaryResults;
        }

         return {
                runSalesSearch: runSalesSearch
    };
});
