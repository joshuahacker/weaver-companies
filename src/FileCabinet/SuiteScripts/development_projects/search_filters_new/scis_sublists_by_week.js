define(['N/ui/serverWidget', 'N/log', './scis_search_by_week.js'], function(serverWidget, log, searchByWeek) {
    function createSublist(form, dateFilter) {

        var summaryResults = searchByWeek.runSalesSearch(dateFilter); 

        var dateFieldGroup = form.addFieldGroup({
            id: 'custpage_date_group',
            label: 'Filters',
        });
        dateFieldGroup.isCollapsible = false;
        dateFieldGroup.isBorderHidden = true;

        var fromDateField = form.addField({
            id: 'custpage_date_from',
            type: serverWidget.FieldType.DATE,
            label: 'From Date',
            container: 'custpage_date_group'
        });
    
        fromDateField.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDE
        });
    
        var toDateField = form.addField({
            id: 'custpage_date_to',
            type: serverWidget.FieldType.DATE,
            label: 'To Date',
            container: 'custpage_date_group'
        });
    
        toDateField.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDE
        });

         var hiddenField = form.addField({
            id: 'custpage_hidden_field',
            type: serverWidget.FieldType.TEXT,
            label: 'Hidden',
            container: 'custpage_date_group'
        });
            hiddenField
                 .updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                }).updateDisplaySize({
                        height: 100,
                        width: 100
                }).updateLayoutType({
                        layoutType: serverWidget.FieldLayoutType.MIDROW
                });
    
        var searchButton = form.addField({
            id: 'custpage_button_searchbutton',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'button',
            container: 'custpage_date_group'
        });

        searchButton.defaultValue =
            '<input id="custpage_applyFilter" onclick="handleApplyFilterClick()" type="button" name="applyFilter" value="Search" style="width:105px; height:30px; cursor: pointer; margin-left: 10px; margin-top: 18px; paddign-bottom: 3px; background-color:#378FFA;border:1px solid #9DBFF2; border-radius: 2px; color:#FFFFFF; font-weight: bold;">';
    
        searchButton.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDE});

        function handleApplyFilterClick() {require(['/SuiteScripts/SCIS Sales Reports/filter_button'], function(client) {client.applyFilter();});}

            form.clientScriptModulePath = './filter_button.js';
    
        var exportButton = form.addField({
            id: 'custpage_button_exportbutton',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'button',
            container: 'custpage_date_group'
        });

        exportButton.defaultValue =
                 '<input id="custpage_applyFilter" onclick="handleApplyFilterClick()" type="button" name="applyFilter" value="Export" style="width:105px; height:30px; cursor: pointer; margin-left: 10px; margin-top: 18px; paddign-bottom: 3px; background-color:#006666;border:1px solid #9DBFF2; border-radius: 2px; color:#FFFFFF; font-weight: bold;">';
            
        exportButton.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDE});
        
            

 // SCIS Sales Sublist 

                var sublist = form.addSublist({
                    id: 'custpage_sales_by_week',
                    type: serverWidget.SublistType.LIST,
                    label: 'Sales by Week',
                    tab:'custpage_reports_date_tab'
                    
                });

                sublist.addField({
                    id: 'custpage_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Date',
                    align: serverWidget.LayoutJustification.CENTER
                });

                sublist.addField({
                    id: 'custpage_trans_count',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Transaction Count',
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

            log.debug({ title: 'Sublist Created: Sales by Month' });

        var line = 0;
        summaryResults.forEach(function(summary) {
            if (summary.date) {
         
                    sublist.setSublistValue({
                        id: 'custpage_date',
                        line: line,
                        value: summary.date
                    });
           
            }
            if (summary.transCount) {
                sublist.setSublistValue({
                    id: 'custpage_trans_count',
                    line: line,
                    value: summary.transCount
                });
            }


            if (summary.unitsSold) {
                sublist.setSublistValue({
                    id: 'custpage_units_sold',
                    line: line,
                    value: summary.unitsSold
                });
            }

            if (summary.grossSales) {
                sublist.setSublistValue({
                    id: 'custpage_gross_sales',
                    line: line,
                    value: summary.grossSales
                });
            }

            if (summary.totalReturns) {
                sublist.setSublistValue({
                    id: 'custpage_total_returns',
                    line: line,
                    value: summary.totalReturns
                });
            }

            if (summary.totalDiscounts) {
                sublist.setSublistValue({
                    id: 'custpage_total_discounts',
                    line: line,
                    value: summary.totalDiscounts
                });
            }

            if (summary.totalTaxes) {
                sublist.setSublistValue({
                    id: 'custpage_total_taxes',
                    line: line,
                    value: summary.totalTaxes
                });
            }

            if (summary.netSales) {
                sublist.setSublistValue({
                    id: 'custpage_net_sales',
                    line: line,
                    value: summary.netSales
                });
            }
         line++;
        });

    }

    return {
        createSublist: createSublist
    };

});