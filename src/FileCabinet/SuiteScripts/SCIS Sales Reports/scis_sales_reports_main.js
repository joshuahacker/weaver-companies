/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget', 
    'N/log', 
    './Sublists/scis_create_sublists.js',
    ], 
    function(
        serverWidget, 
        log, 
        createAllSublists
        ){

     function onRequest(context) {
// Create the Suitelet form
        var form = serverWidget.createForm({
            title: 'Nearest Green Distillery - Retail Sales'
        });

// Form Tabs
        var reportsDateTab = form.addTab({
            id: 'custpage_reports_date_tab',
            label: 'Reports by Date'
        });

        var reportsAnalyticsTab = form.addTab({
            id: 'custpage_reports_analytics_tab',
            label: 'Report Analytics'
        });

// Function to Create All Sublists 
       
createAllSublists.createAllSublists(form);
    
      // Add the date filter fields to the form
      var dateFieldGroup = form.addFieldGroup({
        id: 'custpage_date_group',
        label: 'Filters',
        tab: 'custpage_reports_date_tab'
    });

    var fromDateField = form.addField({
        id: 'custpage_from_date',
        type: serverWidget.FieldType.DATE,
        label: 'From Date',
        container: 'custpage_date_group'
    });

    fromDateField.updateDisplaySize({
        height: 60,
        width: 60
    }).updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.STARTROW
    });

    var toDateField = form.addField({
        id: 'custpage_to_date',
        type: serverWidget.FieldType.DATE,
        label: 'To Date',
        container: 'custpage_date_group'
    });

    toDateField.updateDisplaySize({
        height: 60,
        width: 60
    }).updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.MIDROW
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
                    layoutType: serverWidget.FieldLayoutType.ENDROW
            }).updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
            });

            var buttonField = form.addField({
                id: 'custpage_button_field',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Button',
                container: 'custpage_date_group',
                
            });
            buttonField
            .updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.ENDROW
            })
            
            buttonField.defaultValue = '<input type="button" value="Dummy Button" onclick="myButtonClick()" style="margin-left: 5px;">'
            
// Send the response
        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});
