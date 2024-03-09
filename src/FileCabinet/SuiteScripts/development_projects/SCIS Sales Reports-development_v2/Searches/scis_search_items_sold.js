define(['N/search', 'N/log'], function(search, log) {
    function runItemsSoldSearch() {        
// Create search columns for summary
        var summaryColumns =  [
            search.createColumn({
                name: "item",
                summary: "GROUP",
                label: "Item"
            }),
            search.createColumn({
                name: "displayname",
                join: "item",
                summary: "GROUP",
                label: "Display Name"
            }),
            search.createColumn({
                name: "class",
                join: "item",
                summary: "GROUP",
                label: "Class"
            }),
            search.createColumn({
                name: "quantity",
                summary: "SUM",
                sort: search.Sort.ASC,
                label: "Quantity"
            })
        ]
// Create sales search
            var ItemsSoldSearch = search.create({
                type: "transaction",
                filters: [
                    ["type","anyof","CashSale"], 
                    "AND", 
                    ["mainline","is","F"], 
                    "AND", 
                    ["custbody_ns_pos_transaction_status","anyof","3"], 
                    "AND", 
                    ["item","noneof","105","106","2","-5","-4","4995","-3","5661","3","3393","117","4","113","107","4997","4294","5837","-6","5","6","7","4998","4999"], 
                    "AND", 
                    ["taxitem.taxagency","noneof","2"], 
                    "AND", 
                    ["taxline","is","F"], 
                    "AND", 
                    ["quantity","greaterthanorequalto","1"], 
                    "AND", 
                    ["account","noneof","110"]
                ],
                columns: summaryColumns
            });
            
            log.audit({ title: 'Quantity Sold by Item: Search Created' });
  
            // Run the search and retrieve the results
            var resultSet = ItemsSoldSearch.run();
            var summaryResults = [];
  
            resultSet.each(function(result) {
                var summary = {
                    itemSKU: result.getValue(summaryColumns[0]),
                    itemName: result.getValue(summaryColumns[1]),
                    itemClass: result.getValue(summaryColumns[2]),
                    qtySold: result.getValue(summaryColumns[3]),
                  
                };
  
                summaryResults.push(summary);
                return true;
            }, -1);

            log.audit({ title: 'Quantity Sold by Item: Results Provided'});

            return summaryResults;
        }

         return {
            runItemsSoldSearch: runItemsSoldSearch
    };
});
