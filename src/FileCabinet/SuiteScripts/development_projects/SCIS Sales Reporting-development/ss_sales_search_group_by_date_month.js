/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget', 'N/log'], function(search, sw, log) {
    

    function loadPOSTotal() {
        var summaryColumns = [
             search.createColumn({
                name: "trandate", 
                summary: "GROUP",  
                function: "day",
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
        ];

        var posTotal = search.create({
            type: search.Type.TRANSACTION,
            filters: [
                ["type", "anyof", "CashSale", "CustInvc"],
                "AND",
                ["item", "noneof", "@NONE@"],
                "AND",
                ["amount","notequalto","0.00"], 
                 "AND",
                ["taxline", "is", "F"],
                "AND",
                ["account", "anyof", "817", "54", "936", "898"],
                "AND",
                ["customermain.entityid","haskeywords","Ipad"],
                "AND",
                ["memo","doesnotcontain","VOID"], 
                "AND", 
                ["account","noneof","110"], 
                 "AND", 
                ["location","anyof","14"], 
                  "AND", 
                ["trandate","within","12/17/2023","12/31/2023"]
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
                item: result.getValue(summaryColumns[3]),
            };
            posTotalSummaryResults.push(summary);
            return true;
        });

        log.audit({title: 'posTotalSummaryResults', details: posTotalSummaryResults});


        return posTotalSummaryResults;
    }

    function loadDiscountTotal() {
        var summaryColumns = [
            search.createColumn({
                name: "trandate", 
                summary: "GROUP",  
                function: "day",
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
            }),
            search.createColumn({
                name: "formulacurrency",
                summary: "SUM",
                formula: "{taxamount}",
                label: "Formula (Currency)"
            })
        ];

        var discountTotal = search.create({
            type: "transaction",
            filters: [
                ["type", "anyof", "CashSale"],
                "AND",
                 ["amount","notequalto","0.00"], 
                 "AND",
                ["customermain.entityid","haskeywords","Ipad"],
                "AND",
                ["memo","doesnotcontain","VOID"], 
                "AND", 
                ["account","noneof","110"], 
                 "AND", 
                ["location","anyof","14"], 
                "AND", 
                ["trandate","within","12/17/2023","12/17/2023"]
            ],
            columns: summaryColumns
        });

        var discountTotalResults = discountTotal.run();
        var discountTotalSummaryResults = [];

        discountTotalResults.each(function(result) {
           var date = result.getValue(summaryColumns[0]);

            var summary = {
                date: date,
                tranid: result.getValue(summaryColumns[1]),
                discount: result.getValue(summaryColumns[2]),
                cogs: result.getValue(summaryColumns[3]),
                taxtotal: result.getValue(summaryColumns[4]),
            };
            discountTotalSummaryResults.push(summary);
            return true;
        });

        log.audit({title: 'discountTotalSummaryResults', details: discountTotalSummaryResults});

        return discountTotalSummaryResults;
    }

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = sw.createForm({
                title: 'Transaction Summary',
                hideNavBar: false
            });

            var sublist = form.addSublist({
                id: 'custpage_results_sublist',
                type: sw.SublistType.LIST,
                label: 'Transaction Summary'
            });

            sublist.addField({ id: 'trandate', type: sw.FieldType.TEXT, label: 'Date' });
            sublist.addField({ id: 'tranid', type: sw.FieldType.TEXT, label: 'Transaction ID' });
            sublist.addField({ id: 'grossamount', type: sw.FieldType.CURRENCY, label: 'PoS Sale Amount' });
            sublist.addField({ id: 'taxtotal', type: sw.FieldType.CURRENCY, label: 'Total Tax' });
            sublist.addField({ id: 'totalrevenue', type: sw.FieldType.CURRENCY, label: 'Total Revenue' });
            sublist.addField({ id: 'discounttotal', type: sw.FieldType.CURRENCY, label: 'Total Discount' });
            sublist.addField({ id: 'netrevenue', type: sw.FieldType.CURRENCY, label: 'Net Revenue' });
            sublist.addField({ id: 'cogstotal', type: sw.FieldType.CURRENCY, label: 'COGS Total' });
            sublist.addField({ id: 'cogspercentage', type: sw.FieldType.TEXT, label: 'COGS %' });
            sublist.addField({ id: 'netmargin', type: sw.FieldType.CURRENCY, label: 'Net Margin' });

            var posTotalSummaryResults = loadPOSTotal();
            var discountDataByDate = {};


        // Populate discountDataByDate with discountTotalSummaryResults
        loadDiscountTotal().forEach(function(discount) {
            discountDataByDate[discount.date] = discount;
        });

        posTotalSummaryResults.forEach(function(posResult, i) {
            var date = posResult.date;
            var discountData = discountDataByDate[date] || { discount: '0', cogs: '0', taxtotal: '0' };

            var totalRevenue = parseFloat(posResult.grossamount) - parseFloat(discountData.taxtotal);
            var netRevenue = totalRevenue - parseFloat(discountData.discount);
            var netMargin = netRevenue - parseFloat(discountData.cogs);
            var cogsPercentage = totalRevenue > 0 ? (parseFloat(discountData.cogs) / totalRevenue) * 100 : 0;

            // Ensure proper data type/format conversion before setting sublist values...

            sublist.setSublistValue({ id: 'trandate', line: i, value: date });
            sublist.setSublistValue({ id: 'tranid', line: i, value: posResult.tranid });
            sublist.setSublistValue({ id: 'grossamount', line: i, value: posResult.grossamount.toString() });
            sublist.setSublistValue({ id: 'taxtotal', line: i, value: discountData.taxtotal.toString() });
            sublist.setSublistValue({ id: 'totalrevenue', line: i, value: totalRevenue.toString() });
            sublist.setSublistValue({ id: 'discounttotal', line: i, value: discountData.discount.toString() });
            sublist.setSublistValue({ id: 'netrevenue', line: i, value: netRevenue.toString() });
            sublist.setSublistValue({ id: 'cogstotal', line: i, value: discountData.cogs.toString() });
            sublist.setSublistValue({ id: 'cogspercentage', line: i, value: cogsPercentage.toFixed(2) });
            sublist.setSublistValue({ id: 'netmargin', line: i, value: netMargin.toString() });
        });

            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };

});
