define(['N/log', 'N/ui/serverWidget','./ss_pl_scis_sales_searches_day.js'], function (log, sw, saleSearches) {
    
    function createSublist(form, dateFilter) {
    
log.audit({ title: 'createSublist', details: "here"});
     
        var sublist = form.addSublist({
            id: 'custpage_results_sublistday',
            type: sw.SublistType.LIST,
            label: 'PoS Sales by Day - Transaction IDs',
        });
     
        sublist.addField({ id: 'trandate', type: sw.FieldType.TEXT, label: 'Date' });
        sublist.addField({ id: 'tranid', type: sw.FieldType.TEXT, label: 'Transaction ID' });
        sublist.addField({ id: 'grossamount', type: sw.FieldType.CURRENCY, label: 'Sale Amount' });
        sublist.addField({ id: 'taxtotal', type: sw.FieldType.CURRENCY, label: 'Tax' });
        sublist.addField({ id: 'totalrevenue', type: sw.FieldType.CURRENCY, label: 'Revenue' });
        sublist.addField({ id: 'discounttotal', type: sw.FieldType.CURRENCY, label: 'Discount' });
        sublist.addField({ id: 'netrevenue', type: sw.FieldType.CURRENCY, label: 'Net Revenue' });
        sublist.addField({ id: 'cogstotal', type: sw.FieldType.CURRENCY, label: 'COGS Total' });
        sublist.addField({ id: 'custpage_cogsspacer', type: sw.FieldType.TEXT, label: ' ' });
        sublist.addField({ id: 'cogspercentage', type: sw.FieldType.TEXT, label: 'COGS %' });
        sublist.addField({ id: 'netmargin', type: sw.FieldType.CURRENCY, label: 'Net Margin' });
        sublist.addField({ id: 'netmarginpercentage', type: sw.FieldType.TEXT, label: 'Net Profit %' });

        var gaSearchResultsSummary = saleSearches.gaGetTotal(dateFilter);
        var dctSearchResultsSummary = saleSearches.dctGetTotal(dateFilter);

        log.debug({ title: 'gaSearchResultsSummary', details: gaSearchResultsSummary });
        log.debug({ title: 'dctSearchResultsSummary', details: dctSearchResultsSummary });

        for (var i = 0; i < gaSearchResultsSummary.length; i++) {
            var date = gaSearchResultsSummary[i].date;
            var grossAmount = gaSearchResultsSummary[i].grossamount || '0';
            var taxTotal = '0';

            for (var j = 0; j < dctSearchResultsSummary.length; j++) {
                if (dctSearchResultsSummary[j].tranid == gaSearchResultsSummary[i].tranid) {
                    taxTotal = dctSearchResultsSummary[j].taxtotal || '0'; // Ensure it's a string
                    break;
                }
            }
        
            var totalRevenue = parseFloat(grossAmount) - parseFloat(taxTotal);
            var discountTotal = '0';
            var cogsTotal = '0';

            for (var k = 0; k < dctSearchResultsSummary.length; k++) {
                if (gaSearchResultsSummary[i].tranid == dctSearchResultsSummary[k].tranid) {
                    discountTotal = dctSearchResultsSummary[k].discount || '0';
                    cogsTotal = dctSearchResultsSummary[k].cogs || '0';
                }
            }

            var netRevenue = totalRevenue - parseFloat(discountTotal);
            var netMargin = netRevenue - parseFloat(cogsTotal);
            var cogsPercentage = totalRevenue > 0 ? (parseFloat(cogsTotal) / totalRevenue) * 100 : 0;
            var netMarginPercentage = netMargin > 0? (parseFloat(netMargin) / totalRevenue) * 100 : 0;
            

            sublist.setSublistValue({ id: 'trandate', line: i, value: date.toString() });
            sublist.setSublistValue({ id: 'tranid', line: i, value: gaSearchResultsSummary[i].tranid.toString() });
            sublist.setSublistValue({ id: 'grossamount', line: i, value: grossAmount.toString() });
            sublist.setSublistValue({ id: 'taxtotal', line: i, value: taxTotal.toString() });
            sublist.setSublistValue({ id: 'totalrevenue', line: i, value: totalRevenue.toFixed(2) });
            sublist.setSublistValue({ id: 'discounttotal', line: i, value: discountTotal.toString() });
            sublist.setSublistValue({ id: 'netrevenue', line: i, value: netRevenue.toFixed(2) });
            sublist.setSublistValue({ id: 'cogstotal', line: i, value: cogsTotal.toString() });
            sublist.setSublistValue({ id: 'cogspercentage', line: i, value: cogsPercentage.toFixed(2) });
            sublist.setSublistValue({ id: 'netmargin', line: i, value: netMargin.toFixed(2) });
            sublist.setSublistValue({ id: 'netmarginpercentage', line: i, value: netMarginPercentage.toFixed(2) });
        }

    }

    return {
        createSublist: createSublist
    };

});
