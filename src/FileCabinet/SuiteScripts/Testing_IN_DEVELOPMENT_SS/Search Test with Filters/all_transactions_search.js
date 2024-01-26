define(['N/search', 'N/log'], function (search, log) {
    function transactionSearch(dateFrom, dateTo) {

        var filters =  [
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
            ["customermain.entityid","haskeywords","Ipad"]
         ]

        if (dateFrom || dateTo) {
            if (dateFrom) {
                filters.push('and', ['trandate', 'onorafter', dateFrom]);
            }
            if (dateTo) {
                filters.push('and', ['trandate', 'onorbefore', dateTo]);
            }
        }
        
        log.audit({title: 'Date Filters', details: {dateTo: dateTo, dateFrom: dateFrom}});

        var searchObj = search.create({
                type: "transaction",
                filterExpressions: filters,
                columns:
                [
                   search.createColumn({
                      name: "trandate",
                      sort: search.Sort.DESC,
                      summary: search.Summary.GROUP,
                      label: "Date"
                   }),
                   search.createColumn({
                        name: "tranid",
                        summary: "COUNT",
                        label: "transaction ID"
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
                      name: "formulacurrency",
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

             var searchResults = [];
    var pageSize = 100; // Number of records per page

    var pagedData = searchObj.runPaged({
        pageSize: pageSize
    });

    pagedData.pageRanges.forEach(function(pageRange) {
        var myPage = pagedData.fetch({
            index: pageRange.index
        });
        myPage.data.forEach(function(result) {
            searchResults.push(result);
        });
    });

    return searchResults;
    }

    return {
        transactionSearch: transactionSearch
    };
});
