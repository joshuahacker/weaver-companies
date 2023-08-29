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
        if (context.request.method === 'GET') {
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
        id: 'custpage_date_from',
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
        id: 'custpage_date_to',
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
                    layoutType: serverWidget.FieldLayoutType.MIDROW
            });

            var buttonField = form.addField({
                id: 'custpage_button_field',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'button',
                container: 'custpage_date_group'
            });
    
            buttonField.defaultValue =
                '<input id="custpage_applyFilter" onclick="applyFilter" type="button" name="applyFilter" value="Search" style="width:110px; height:30px; margin-top:5px; margin-left: 10px; cursor: pointer; background-color:#378FFA; border:1px solid #9DBFF2; color:#FFFFFF; font-weight: bold;">';
    
            buttonField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });
    
            form.clientScriptModulePath = './scis_cs_datefilter.js';

            context.response.writePage(form);
    
            
        } else if (context.request.method === 'POST') {
            // Handle the POST request with the parameters
            var params = context.request.parameters;
            
            // Perform your logic with the parameters here
            
            // Create the response
            var response = {
                message: 'Parameters received',
                params: params
            };
            
            // Send the response as JSON
            context.response.write(JSON.stringify(response));
        }
    }

      
    return {
        onRequest: onRequest
    };
});