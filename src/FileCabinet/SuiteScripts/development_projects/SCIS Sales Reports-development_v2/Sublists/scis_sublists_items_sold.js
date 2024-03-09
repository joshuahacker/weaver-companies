/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for Invoice Search
 */

define(['N/ui/serverWidget', 'N/log', '../Searches/scis_search_items_sold.js'], function(serverWidget, log, searchByItemsSold) {
    function createSublist(form) {

        var summaryResults = searchByItemsSold.runItemsSoldSearch();

        //SCIS Total Quantity Sold by Item
            var sublist = form.addSublist({
                id: 'custpage_sales_by_items_sold',
                type: serverWidget.SublistType.LIST,
                label: 'Total Quantity Sold by Item',
                tab: 'custpage_reports_analytics_tab'
            });
                       
            sublist.addField({
                id: 'custpage_item_sku',
                type: serverWidget.FieldType.TEXT,
                label: 'Item Number/SKU',
                align: serverWidget.LayoutJustification.CENTER
            });
            

            sublist.addField({
                id: 'custpage_item_description',
                type: serverWidget.FieldType.TEXT,
                label: 'Item Description',
                align: serverWidget.LayoutJustification.CENTER
            });


            sublist.addField({
                id: 'custpage_item_class',
                type: serverWidget.FieldType.TEXT,
                label: 'Item Class',
                align: serverWidget.LayoutJustification.CENTER
            });

            sublist.addField({
                id: 'custpage_item_quantity_sold',
                type: serverWidget.FieldType.INTEGER,
                label: 'Total Quantity Sold',
                align: serverWidget.LayoutJustification.LEFT
            });

            
            log.debug({ title: 'Sublist Created: Total Sold by Items' });

            var line = 0;
            
            summaryResults.forEach(function(summary) {
             
                if (summary.itemSKU) {
                    sublist.setSublistValue({
                        id: 'custpage_item_sku',
                        line: line,
                        value: summary.itemSKU
                    });
                }
    
                if (summary.itemDescription) {
                    sublist.setSublistValue({
                        id: 'custpage_item_description',
                        line: line,
                        value: summary.itemDescription
                    });
                }
    
                if (summary.itemClass) {
                    sublist.setSublistValue({
                        id: 'custpage_item_class',
                        line: line,
                        value: summary.itemClass
                    });
                }
    
                if (summary.qtySold) {
                    sublist.setSublistValue({
                        id: 'custpage_item_quantity_sold',
                        line: line,
                        value: summary.qtySold
                    });
                }

             line++;
            });
    
        }
    
        return {
            createSublist: createSublist
        };
    
    });
