/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @by Joshua Hacker
 * @Description Sublist View for All Transactions Search
 */

define(['N/ui/serverWidget', 'N/log', 'N/search'], function(serverWidget, log, search) {
function onRequest(context) {

    
    function runAllTransactions() {
// Create search columns for summary
    function runSalesSearch() { 
        
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
        
    log.audit({ title: 'Sales By Week Search: Search Created' });


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
        
                    log.audit({ title: 'Sales By Week Search: Results Provided'});
        
                    return summaryResults;
                }
        
                 return {
                        runSalesSearch: runSalesSearch
            };
        };

function createSublist(form) { 
 // SCIS Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_transactions',
                    type: serverWidget.SublistType.LIST,
                    label: 'All Transactions',
                    tab: 'custpage_reports_transactions'
                });

                sublist.addField({
                    id: 'custpage_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Date',
                    align: serverWidget.LayoutJustification.CENTER
                });

                sublist.addField({
                    id: 'custpage_units_sold',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Units Sold',
                    align: serverWidget.LayoutJustification.CENTER
                });

                sublist.addField({
                    id: 'custpage_gross_sales',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Gross Sales',
                    align: serverWidget.LayoutJustification.LEFT
                });

                sublist.addField({
                    id: 'custpage_total_returns',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Returns',
                    align: serverWidget.LayoutJustification.LEFT
                });

                sublist.addField({
                    id: 'custpage_total_discounts',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Discounts',
                    align: serverWidget.LayoutJustification.LEFT
                });

                sublist.addField({
                    id: 'custpage_total_taxes',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Taxes',
                    align: serverWidget.LayoutJustification.LEFT
                });

                sublist.addField({
                    id: 'custpage_net_sales',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Net Sales',
                    align: serverWidget.LayoutJustification.LEFT
                });

            log.debug({ title: 'Sublist Created: All Transactions' });

        
            var resultIndex = 0;
            var resultsPerPage = 100; // Number of results to display per page
            var pageIndex = 0;
      
            do {
                var startIndex = pageIndex * resultsPerPage;
                var endIndex = startIndex + resultsPerPage;
      
                for (var i = startIndex; i < endIndex; i++) {
                    if (i >= resultSet.length) {
                        break;
                    }
      
                    var result = resultSet.get(i);
      
                    sublist.setSublistValue({
                        id: 'custpage_doc_number',
                        line: resultIndex,
                        value: result.getValue({ name: 'tranid', summary: 'GROUP' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_units_sold',
                        line: resultIndex,
                        value: result.getValue({ name: 'quantity', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_gross_sales',
                        line: resultIndex,
                        value: result.getValue({ name: 'grossamount', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_returns',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency1', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_discounts',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency2', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_taxes',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency3', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_net_sales',
                        line: resultIndex,
                        value: result.getValue({ name: 'netamount', summary: 'SUM' })
                    });
      
                    resultIndex++;
                }
            
      
                pageIndex++;
            } while (resultSet.isIndexAvailable(pageIndex * resultsPerPage));
      
            log.audit({ title: 'All Transactions Search: Results Provided' });
        }

    return {
        createSublist: createSublist
    };
});
