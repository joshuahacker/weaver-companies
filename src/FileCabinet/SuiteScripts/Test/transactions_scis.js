/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/serverWidget', 'N/log'], function(search, serverWidget, log) {

    function onRequest(context) {
        log.audit({title: 'Request Received.'});

        var list = renderList(findTrans());

        context.response.writePage({
            pageObject: renderList(translate(findTrans()))
        });
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
    function findTrans() {
        log.audit({title: 'Finding Transactions...'});

        var transactionSearch = search.load({
            id: 'customsearch_ns_pos_transactions'
        });
         
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
