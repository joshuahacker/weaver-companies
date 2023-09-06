/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/serverWidget', 'N/log'], function(search, serverWidget, log) {

    function onRequest(context) {
        log.audit({title: 'Request Received.'});

        var dateFrom = context.request.parameters.datefrom;
        var dateTo = context.request.parameters.dateto;
        
        var form = serverWidget.createForm({
            title: 'Filter SCIS Transactions',
            clientScriptFileId: '14934'
        });
        
        form.addField({
            id: 'datefrom',
            type: serverWidget.FieldType.DATE,
            label: 'Date From'
        }).defaultValue = dateFrom || '';  // Set default value if available

        form.addField({
            id: 'dateto',
            type: serverWidget.FieldType.DATE,
            label: 'Date To'
        }).defaultValue = dateTo || '';  // Set default value if available
        
        form.addSubmitButton({
            label: 'Filter'
        });

         // Create a sublist
    var sublist = form.addSublist({
        id: 'transactionlist',
        type: serverWidget.SublistType.LIST,
        label: 'Transactions'
    });

    // Define sublist fields
    sublist.addField({
        id: 'trandate',
        type: serverWidget.FieldType.DATE,
        label: 'Date'
    });
    sublist.addField({
        id: 'tranid',
        type: serverWidget.FieldType.TEXT,
        label: 'Transaction #'
    });
    sublist.addField({
        id: 'formulatext',
        type: serverWidget.FieldType.TEXT,
        label: 'Form Test'
    });
    sublist.addField({
        id: 'amount',
        type: serverWidget.FieldType.TEXT,
        label: 'Amount'
    });

    // Populate the sublist
    var searchResults = findTrans(dateFrom, dateTo);
    for (var i = 0; i < searchResults.length; i++) {
        var result = resultsObj(searchResults[i]);
        sublist.setSublistValue({
            id: 'trandate',
            line: i,
            value: result.trandate
        });
        sublist.setSublistValue({
            id: 'tranid',
            line: i,
            value: result.tranid
        });
        sublist.setSublistValue({
            id: 'formulatext',
            line: i,
            value: result.formulatext
        });
        sublist.setSublistValue({
            id: 'amount',
            line: i,
            value: result.amount
        });
    }

        var list = renderList(findTrans(dateFrom, dateTo));
        
        context.response.writePage(form);
    }

    

    function renderList(results) {
        log.audit({title: 'Rendering List.'})

        var list = serverWidget.createList({ title: 'SCIS Transactions' });

        list.addColumn({
            id: 'trandate',
            type: serverWidget.FieldType.DATE,
            label: 'Date',
                
        });

        list.addColumn({
            id: 'tranid',
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction #'
        });

        list.addColumn({
            id: 'formulatext',
            type: serverWidget.FieldType.TEXT,
            label: 'Form Test'
        });
       

        list.addColumn({
            id: 'amount',
            type: serverWidget.FieldType.TEXT,
            label: 'Amount'
        });
       

        log.debug({rows: results});

        list.addRows({rows: results});

        return list;
    }
    
    function findTrans(dateFrom, dateTo) {
        log.audit({title: 'Finding Transactions...'});

        var transactionSearch = search.load({
            id: 'customsearch_ns_pos_transactions'
        });

        if(dateFrom || dateTo) {
            var filters = [];
            
            if(dateFrom) {
                filters.push(['trandate', 'onorafter', dateFrom]);
            }
            
            if(dateTo) {
                filters.push('and', ['trandate', 'onorbefore', dateTo]);
            }
            
            transactionSearch.filterExpression = filters;
        }
         
        var searchResults = transactionSearch.run().getRange({ start: 0, end: 50});

        log.debug({title: 'Search Type:', details: transactionSearch.type});
        
       return searchResults;
       
    }
    
    function resultsObj(result) {
        return {
            trandate: result.getValue({name: 'trandate', summary: search.Summary.Group}),
            tranid: result.getValue({name: 'tranid'}),
            formulatext: result.getValue({name: 'formulatext'}),
            amount: result.getValue({name: 'amount'})
        }
    };

    function translate(results) {
        return results.map(resultsObj)
    };
    
    return {
        onRequest: onRequest
    };

});
