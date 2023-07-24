define(['N/search', 'N/log'], function(search, log) {
    function runSalesSearch() {        
           // Create search columns for summary
            var summaryColumns = [
                search.createColumn({
                    name: 'trandate',
                    summary: search.Summary.GROUP,
                    function: "day",
                    sort: search.Sort.DESC
                }),

                search.createColumn({
                    name: "tranid",
                    summary: "COUNT",
                    label: "Transaction Count"
                 }),
  
                search.createColumn({
                    name: 'quantity',
                    function: 'absoluteValue',
                    label: 'Total Units Sold',
                    summary: search.Summary.SUM
                
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
                    name: 'netamount',
                    label: "Net Sales",
                    summary: search.Summary.SUM
                })
            ];
            log.audit({ title: 'Sales By Day Search: Columns Created'});

            // Create sales search
            var salesSearch = search.create({
                type: search.Type.TRANSACTION,
                filters:    [
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
            
            log.audit({ title: 'Sales By Day Search: Search Created' });
  
            // Run the search and retrieve the results
            var resultSet = salesSearch.run();
            var summaryResults = [];
  
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

            log.audit({ title: 'Sales By Day Search: Results Provided'});

            return summaryResults;
        }

         return {
                runSalesSearch: runSalesSearch
    };
});
