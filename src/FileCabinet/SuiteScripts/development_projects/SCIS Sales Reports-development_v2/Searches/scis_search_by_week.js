define(['N/search', 'N/log', 'N/format'], function(search, log, format) {
    function runSalesSearch(dateFilter) {        
           // Create search columns for summary
            var summaryColumns =  [
                search.createColumn({
                   name: "trandate",
                   summary: "GROUP",
                   function: "weekOfYear",
                   sort: search.Sort.DESC,
                   label: "Date"
                }),

                search.createColumn({
                  name: "tranid",
                  summary: "COUNT",
                  label: "Transaction Count"
               }),

                search.createColumn({
                   name: "quantity",
                   summary: "SUM",
                   function: 'absoluteValue',
                 label: "Total Units Sold"
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
            log.audit({ title: 'Sales By Week Search: Columns Created'});

            // Create sales search
            var salesSearch = search.create({
                type: search.Type.TRANSACTION,
                filters:
                [
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
0
      
            // Format the dates in "MM/dd/yy" format
var formatDate = function(date) {
   var month = date.getMonth() + 1;
   var day = date.getDate();
   var year = date.getFullYear();
   return ('00' + month).slice(-2) + '/' + ('00' + day).slice(-2) + '/' + ('' + year).slice(-2);
};

if (dateFilter && dateFilter.fromDate && dateFilter.toDate) {
   var dateFilterColumn = search.createColumn({
     name: "trandate",
     summary: "GROUP",
     function: "weekOfYear",
     sort: search.Sort.DESC,
     label: "Date"
   });

   var formattedFromDate = formatDate(fromDate);
    var formattedToDate = formatDate(toDate);
      
   // Add the logical operator 'AND' and date filter conditions to the filters
   salesSearch.filters.push(search.createFilter({
     name: 'trandate',
     operator: search.Operator.WITHIN,
     values: [formattedFromDate, formattedToDate]
   }));
 } else {
   // Set a default date range if no date filter is provided
   var defaultFromDate = new Date();
   defaultFromDate.setDate(defaultFromDate.getDate() - 30);

   var formattedDefaultFromDate = formatDate(defaultFromDate);
   var formattedDefaultToDate = formatDate(new Date());
   
   var dateFilterColumn = search.createColumn({
     name: "trandate",
     summary: "GROUP",
     function: "weekOfYear",
     sort: search.Sort.DESC,
     label: "Date"
   });
   
   // Add the default date filter conditions to the filters using 'AND'
   salesSearch.filters.push(search.createFilter({
     name: 'trandate',
     operator: search.Operator.WITHIN,
     values: [formattedDefaultFromDate, formattedDefaultToDate]
   }));
 }

 log.debug(formattedToDate, formattedFromDate)

            log.audit({ title: 'Sales By Week Search: Search Created' });
  
            // Run the search and retrieve the results
            var summaryResults = [];
            var resultSet = salesSearch.run();

            var pageSize = 1000; // Adjust this to the appropriate page size
  
            resultSet.each(function(result) {
                var date = result.getValue(summaryColumns[0]);
          
                var summary = {
                    date: date,
                    transCount: result.getValue(summaryColumns[1]),
                    unitsSold: result.getValue(summaryColumns[2]),
                    grossSales: result.getValue(summaryColumns[3]),
                    totalReturns: result.getValue(summaryColumns[4]),
                    totalDiscounts: result.getValue(summaryColumns[5]),
                    totalTaxes: result.getValue(summaryColumns[6]),
                    netSales: result.getValue(summaryColumns[7]),
                    
                };
  
                summaryResults.push(summary);
                return true;
            }, -1);

            log.audit({ title: 'Sales By Week Search: Results Provided'});

            return summaryResults;
        }

         return {
                runSalesSearch: runSalesSearch
    };
});
