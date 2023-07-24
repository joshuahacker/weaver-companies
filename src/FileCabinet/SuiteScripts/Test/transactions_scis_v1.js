/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */


define([
    'N/ui/serverWidget', 
    'N/log', 
    './SCISDataScripts/scis_data_sublist1.js',
    './SCISDataScripts/scis_data_sublist2.js'
    ], 
    function(
        serverWidget, 
        log, 
        scisSublist1,
        scisSublist2
        ){

    function onRequest(context) {
        // Create the Suitelet form
        var form = serverWidget.createForm({
            title: 'Nearest Green Distillery - Retail Sales'
        });

        var generalTab = form.addTab({
            id: 'custpage_general_tab',
            label: 'General'
        });
        
        var detailsTab = form.addTab({
            id: 'custpage_details_tab',
            label: 'Details'
        });

        var generalSublist = form.addSublist({
            id: 'custpage_general_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'General Sublist',
            tab: 'custpage_general_tab' // Specify the tab ID here
        });

        var detailsSublist = form.addSublist({
            id: 'custpage_details_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Details Sublist',
            tab: 'custpage_details_tab' // Specify the tab ID here
        });

        // Add fields to the sublists
        generalSublist.addField({
            id: 'custpage_field1',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 1'
        });

        detailsSublist.addField({
            id: 'custpage_field2',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 2'
        });

        var fromDate = form.addField({
            id: 'custpage_from_date_filter',
            type: serverWidget.FieldType.DATE,
            label: 'From Date',
            defaultValue: ''
        });

        fromDate.updateDisplaySize({
            height: 60,
            width: 90
        });

        var toDate = form.addField({
            id: 'custpage_to_date_filter',
            type: serverWidget.FieldType.DATE,
            label: 'To Date',
            defaultValue: ''
        });

        toDate.updateDisplaySize({
            height: 60,
            width: 90
        });

        toDate.updateBreakType({
            breakType : serverWidget.FieldBreakType.STARTCOL
        });

    
        form.addSubmitButton({
            label: 'Submit'
        });

        if (context.request.method === 'POST'){


            var fromDateValue = context.request.parameters.custpage_from_date_filter;
            var toDateValue = context.request.parameters.custpage_to_date_filter;
           
            // Create the sublist
            scisSublist1.createSublist(form, fromDateValue , toDateValue);
            scisSublist2.createSublist(form);
        } else {
        
         // Create the sublist
         scisSublist1.createSublist(form);
         scisSublist2.createSublist(form);
         log.debug({ Details : context.custpage_from_date_filter })
    
            form.addSublist({
                id: 'custpage_sublist3',
                type: serverWidget.SublistType.LIST,
                label: 'SCIS - Best Selling Items'
                
            });
     
            form.addSublist({
                id: 'custpage_sublist4',
                type: serverWidget.SublistType.LIST,
                label: 'SCIS - This Week vs Last Week'
                
            });
    
            form.addSublist({
                id: 'custpage_sublist5',
                type: serverWidget.SublistType.LIST,
                label: 'SCIS - Month vs Month'
                
            });
        }


        // Send the response
        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };

});
