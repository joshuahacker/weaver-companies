define(['N/ui/serverWidget', 'N/log', './ss_pl_scis_sales_searches.js'], function(sw, log, saleSearches) {
    
 function createSublist(form, dateFilter) {
     
        var sublist = form.addSublist({
          id: 'custpage_results_sublist',
          type: sw.SublistType.LIST,
          label: 'PoS Sales by Day - Totals',
        });

        var dateFieldGroup = form.addFieldGroup({
          id: 'custpage_date_group',
          label: 'Filters',
    });
        dateFieldGroup.isCollapsible = false;
        dateFieldGroup.isBorderHidden = true;

        var fromDateField = form.addField({
            id: 'custpage_date_from',
            type: sw.FieldType.DATE,
            label: 'From Date',
            container: 'custpage_date_group'
        });
    
        fromDateField.updateLayoutType({
            layoutType: sw.FieldLayoutType.OUTSIDE
        });
    
        var toDateField = form.addField({
            id: 'custpage_date_to',
            type: sw.FieldType.DATE,
            label: 'To Date',
            container: 'custpage_date_group'
        });
    
        toDateField.updateLayoutType({
            layoutType: sw.FieldLayoutType.OUTSIDE
        });

         var hiddenField = form.addField({
            id: 'custpage_hidden_field',
            type: sw.FieldType.TEXT,
            label: 'Hidden',
            container: 'custpage_date_group'
        });
            hiddenField
                 .updateDisplayType({
                        displayType: sw.FieldDisplayType.HIDDEN
                }).updateDisplaySize({
                        height: 100,
                        width: 100
                }).updateLayoutType({
                        layoutType: sw.FieldLayoutType.MIDROW
                });
    
        var searchButton = form.addField({
            id: 'custpage_button_searchbutton',
            type: sw.FieldType.INLINEHTML,
            label: 'button',
            container: 'custpage_date_group'
        });

        searchButton.defaultValue =
            '<input id="custpage_applyFilter" onclick="handleApplyFilterClick()" type="button" name="applyFilter" value="Search" style="width:105px; height:30px; cursor: pointer; margin-left: 10px; margin-top: 18px; paddign-bottom: 3px; background-color:#378FFA;border:1px solid #9DBFF2; border-radius: 2px; color:#FFFFFF; font-weight: bold;">';
    
        searchButton.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE});

        function handleApplyFilterClick() {require(['/SuiteScripts/SCIS Sales Reports/filter_button'], function(client) {client.applyFilter();});}

            form.clientScriptModulePath = './filter_button.js';
    
        var exportButton = form.addField({
            id: 'custpage_button_exportbutton',
            type: sw.FieldType.INLINEHTML,
            label: 'button',
            container: 'custpage_date_group'
        });

        exportButton.defaultValue =
                 '<input id="custpage_applyFilter" onclick="handleApplyFilterClick()" type="button" name="applyFilter" value="Export" style="width:105px; height:30px; cursor: pointer; margin-left: 10px; margin-top: 18px; paddign-bottom: 3px; background-color:#006666;border:1px solid #9DBFF2; border-radius: 2px; color:#FFFFFF; font-weight: bold;">';
            
        exportButton.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE});
        

            sublist.addField({ id: 'trandate', type: sw.FieldType.TEXT, label: 'Date' });
            sublist.addField({ id: 'tranid', type: sw.FieldType.TEXT, label: 'Transaction ID' });
            sublist.addField({ id: 'grossamount', type: sw.FieldType.CURRENCY, label: 'PoS Sale Amount' });
            sublist.addField({ id: 'taxtotal', type: sw.FieldType.CURRENCY, label: 'Total Tax' });
            sublist.addField({ id: 'totalrevenue', type: sw.FieldType.CURRENCY, label: 'Total Revenue' });
            sublist.addField({ id: 'discounttotal', type: sw.FieldType.CURRENCY, label: 'Total Discount' });
            sublist.addField({ id: 'netrevenue', type: sw.FieldType.CURRENCY, label: 'Net Revenue' });
            sublist.addField({ id: 'cogstotal', type: sw.FieldType.CURRENCY, label: 'COGS Total' });
            sublist.addField({ id: 'custpage_cogsspacer', type: sw.FieldType.TEXT, label: ' ' }); 
            sublist.addField({ id: 'cogspercentage', type: sw.FieldType.TEXT, label: 'COGS %' });
            sublist.addField({ id: 'netmargin', type: sw.FieldType.CURRENCY, label: 'Net Margin' });
               sublist.addField({ id: 'netmarginpercentage', type: sw.FieldType.TEXT, label: 'Net Margin %' });


            var gaSearchResultsSummary = saleSearches.gaGetTotal(dateFilter);
            var dctSummary = {};

        // Populate discount, tax, and cogs with dstSummary
        saleSearches.dctGetTotal(dateFilter).forEach(function(discount) {
            dctSummary[discount.date] = discount;
        });

        gaSearchResultsSummary.forEach(function(gaSearchResults, i) {
            var date = gaSearchResults.date;
            var dctSearchData = dctSummary[date] || { discount: '0', cogs: '0', taxtotal: '0' };

            var totalRevenue = parseFloat(gaSearchResults.grossamount) - parseFloat(dctSearchData.taxtotal);
            var netRevenue = totalRevenue - parseFloat(dctSearchData.discount);
            var netMargin = netRevenue - parseFloat(dctSearchData.cogs);
            var cogsPercentage = totalRevenue > 0 ? (parseFloat(dctSearchData.cogs) / totalRevenue) * 100 : 0;
            var netMarginPercentage = (netMargin / totalRevenue) * 100;


            sublist.setSublistValue({ id: 'trandate', line: i, value: date });
            sublist.setSublistValue({ id: 'tranid', line: i, value: gaSearchResults.tranid });
            sublist.setSublistValue({ id: 'grossamount', line: i, value: gaSearchResults.grossamount.toString() });
            sublist.setSublistValue({ id: 'taxtotal', line: i, value: dctSearchData.taxtotal.toString() });
            sublist.setSublistValue({ id: 'totalrevenue', line: i, value: totalRevenue.toString() });
            sublist.setSublistValue({ id: 'discounttotal', line: i, value: dctSearchData.discount.toString() });
            sublist.setSublistValue({ id: 'netrevenue', line: i, value: netRevenue.toString() });
            sublist.setSublistValue({ id: 'cogstotal', line: i, value: dctSearchData.cogs.toString() });
var cogsPercentageValue = cogsPercentage.toFixed(2) + '%';
sublist.setSublistValue({ id: 'cogspercentage', line: i, value: cogsPercentageValue });
            sublist.setSublistValue({ id: 'netmargin', line: i, value: netMargin.toString() });
          sublist.setSublistValue({ id: 'netmarginpercentage', line: i, value: netMarginPercentage.toFixed(2) + '%' });

        });

 }
    

    return {
        createSublist: createSublist
    };

});
