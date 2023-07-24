define(['N/search', 'N/log'], function(search, log) {
    function runSalesSearch(dateTo, dateFrom) {

       
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

        ];

        // Create sales search
        var salesSearch = search.create({
            type: search.Type.TRANSACTION,
            filters: [
                ["type", "anyof", "CashSale", "CustInvc", "CustCred"],
                "AND",
                ["account", "noneof", "110"],
                "AND",
                ["amount", "notequalto", "0.00"],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["item.type", "noneof", "Markup", "Payment", "Subtotal"],
                "AND",
                ["memo", "doesnotcontain", "VOID"],
                "AND",
                ["memomain", "doesnotcontain", "VOID"],
                "AND",
                ["location", "anyof", "14"],
                "AND",
                ["salesrep", "anyof", "@ALL@"],
                "AND",
                ["formulatext: CASE WHEN {entity} LIKE '%ipad%' OR {entity} LIKE '%golf club%' THEN {entity} ELSE '' END", "is", ""]
            ],
            columns: summaryColumns
        });

        // Set date filters if provided
        if (dateFrom && dateTo) {
            // Parse the date strings as text

            salesSearch.filters.push(["trandate", "within", parsedFromDate, parsedToDate]);
          }
        // Run the search and retrieve the results
        var resultSet = salesSearch.run();
        var summaryResults = [];

        resultSet.each(function (result) {
          var date = result.getValue(summaryColumns[0]);
         
            var summary = {
              date: date,
              trans: result.getValue({
                name: summaryColumns[1]
              })
            };
          
            summaryResults.push(summary);
            return true;
          }, -1);
          
        
        return summaryResults;
    }

    return {
        runSalesSearch: runSalesSearch
    };
});
