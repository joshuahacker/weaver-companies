/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

 
define(['N/ui/serverWidget', 'N/log', 'N/file', 
'./sl_scis_reporting_search_day.js', 
'./sl_scis_reporting_search_tranid.js', 
'./sl_scis_reporting_search_week.js'], 
  function ( sw, log, file, 
    searchByDay, 
    searchByTranID, 
    searchByWeek ) {
    
    function onRequest(context) {
        if (context.request.method === 'GET') {

            var dateFrom = context.request.parameters.custpage_from_date;
            var dateTo = context.request.parameters.custpage_to_date;
            var displayOption = context.request.parameters.custpage_options;

            var dateFilter = {
                dateFrom: dateFrom,
                dateTo: dateTo
            };

            var tableRows = "";
                   
            var fileId = '20480'; // html file
            var htmlFile = file.load({id: fileId});
            var htmlContent = htmlFile.getContents();

      
            switch (displayOption) {
                case "transaction_id":
                    tableRows = generateByTransaction(dateFilter);
                    var transHeaderIDName = 'Transaction ID';
                    htmlContent = htmlContent.replace('<!-- Trans Column Name -->', transHeaderIDName);
                    break;
                case "day":
                    tableRows = generateByDay(dateFilter);
                    var transHeaderCountName = 'Transaction Count';
                    htmlContent = htmlContent.replace('<!-- Trans Column Name -->', transHeaderCountName);
                    break;
                case "week":
                    tableRows = generateByWeek(dateFilter);
                        var transHeaderCountName = 'Transaction Count';
                    htmlContent = htmlContent.replace('<!-- Trans Column Name -->', transHeaderCountName);
                    break;
                default:
                   tableRows = generateByDay(dateFilter);
                    var transHeaderCountName = 'Transaction Count';
                    htmlContent = htmlContent.replace('<!-- Trans Column Name -->', transHeaderCountName);
                    break;
            }

            
            var form = sw.createForm({
                title: '160 - Retail Sales Profit & Loss',
            });

    
            var inlineHtmlField = form.addField({
                id: 'custpage_html_table',
                type: sw.FieldType.INLINEHTML,
                label: 'HTML',
            });

            htmlContent = htmlContent.replace('<!-- Table content -->', tableRows)     

            inlineHtmlField.defaultValue =  htmlContent 

            var filtersGroup = form.addFieldGroup({
                id: 'custpage_filters_group',
                label: 'Filters',
            });
                filtersGroup.isCollapsible = false;
                filtersGroup.isBorderHidden = true;

            var selectHtmlField = form.addField({
                id: 'custpage_options',
                type: sw.FieldType.INLINEHTML,
                label: 'Custom Dropdown',
                container: 'custpage_filters_group',
            });

            selectHtmlField.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE });

            var selectHtmlContent = 
                '<label for="custpage_options" style="display: block; text-align: left;">View By</label>' +
                '<select id="custpage_options" onchange="handleSelection()" style="display: block; width: 140px; color: #666666; margin-top: 18px; font-weight: 400; font-family: inherit; height: 25px; padding: 3px; padding-block: 1px; padding-inline: 3px; font-size: 13px;" name="handleOptionsChange">' +
                    '<option value="viewby">Select View: </option>' +
                    '<option value="transaction_id">Transaction #</option>' +
                    '<option value="week">Week of Year</option>' +
                    '<option value="day">Day</option>' +
                '</select>';            


            selectHtmlField.defaultValue = selectHtmlContent 
            
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
        
            fromDateField.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE });
            
            var toDateField = form.addField({
                id: 'custpage_date_to',
                type: sw.FieldType.DATE,
                label: 'To Date',
                container: 'custpage_date_group'
            });

            toDateField.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE });

            var hiddenField = form.addField({
                id: 'custpage_hidden_field',
                type: sw.FieldType.TEXT,
                label: 'Hidden',
                container: 'custpage_date_group'
            });
            hiddenField.updateDisplayType({ displayType: sw.FieldDisplayType.HIDDEN }).updateDisplaySize({ height: 100, width: 100 }).updateLayoutType({ layoutType: sw.FieldLayoutType.MIDROW });

            
            var searchButton = form.addField({
                id: 'custpage_button_searchbutton',
                type: sw.FieldType.INLINEHTML,
                label: 'button',
                container: 'custpage_date_group',
            });

            searchButton.defaultValue =' <input id="custpage_applyFilter" onclick="handleApplyFilterClick()" type="button" name="applyFilter" value="Search" style="width:105px; height:30px; cursor: pointer; margin-left: 10px; margin-top: 18px; paddign-bottom: 3px; background-color:#378FFA;border:1px solid #9DBFF2; border-radius: 2px; color:#FFFFFF; font-weight: bold;"> ';
          
            searchButton.updateLayoutType({ layoutType: sw.FieldLayoutType.OUTSIDE});

            function handleApplyFilterClick() {require(['/SuiteScripts/scis_reporting_v3/cs_scis_reporting'], function(client) {client.applyFilter();});}

            form.clientScriptModulePath = './cs_scis_reporting.js';

            context.response.writePage(form);

                  
        } else if (context.request.method === 'POST') {
            // Handle the POST request with the parameters
            var params = context.request.parameters;
        var selectedOption = context.request.parameters.custpage_options;


        log.debug(selectedOption)   

            // Create the response
            var response = {
                message: 'Parameters received',
                params: params
            };

            // Send the response as JSON
            context.response.write(JSON.stringify(response));
    
        }
    }

        function generateByWeek(dateFilter) {
    // Assume gaSearchResultsSummary comes directly from the search result similar to the provided JSON
    var gaSearchResultsSummary = searchByWeek.gaGetTotal(dateFilter);
    var dctSummary = searchByWeek.dctGetTotal(dateFilter).reduce(function(acc, cur){
        var weekKey = cur.date; 
        if (!acc[weekKey]) {
            acc[weekKey] = { discount: 0, cogs: 0, taxtotal: 0, tranidCount: 0 };
        }
        acc[weekKey].discount += parseFloat(cur.discount || 0);
        acc[weekKey].cogs += parseFloat(cur.cogs || 0);
        acc[weekKey].taxtotal += parseFloat(cur.taxtotal || 0);
        acc[weekKey].tranidCount += parseInt(cur.tranid || 0);
        return acc;
    }, {});

    var tableRows = "";

    gaSearchResultsSummary.forEach(function(result) {
        var weekKey = result.date; // Directly use 'date' as the week key
        var dctData = dctSummary[weekKey] || { discount: 0, cogs: 0, taxtotal: 0, tranidCount: 0 };

        // Calculate financial metrics
        var totalRevenue = parseFloat(result.grossamount) - parseFloat(dctData.taxtotal);
        var netRevenue = totalRevenue - parseFloat(dctData.discount);
        var netMargin = netRevenue - parseFloat(dctData.cogs);
        var cogsPercentage = totalRevenue > 0 ? (parseFloat(dctData.cogs) / totalRevenue) * 100 : 0;
        var netMarginPercentage = netRevenue > 0 ? (netMargin / netRevenue) * 100 : 0;

  tableRows += '<tr>' +
            '<td>' + weekKey + '</td>' +
            '<td>' + dctData.tranidCount + '</td>' + // Use the aggregated transaction count
            '<td>' + parseFloat(result.grossamount).toFixed(2) + '</td>' +
            '<td>' + parseFloat(dctData.taxtotal).toFixed(2) + '</td>' +
            '<td>' + totalRevenue.toFixed(2) + '</td>' +
            '<td>' + parseFloat(dctData.discount).toFixed(2) + '</td>' +
            '<td>' + netRevenue.toFixed(2) + '</td>' +
            '<td>' + parseFloat(dctData.cogs).toFixed(2) + '</td>' +
            '<td>' + cogsPercentage.toFixed(2) + '%</td>' +
            '<td>' + netMargin.toFixed(2) + '</td>' +
            '<td>' + netMarginPercentage.toFixed(2) + '%</td>' +
            '</tr>';
    });

    return tableRows;

        }
       function generateByTransaction(dateFilter) {
                var gaSearchResultsSummary = searchByTranID.gaGetTotal(dateFilter);
                var dctSearchResultsSummary = searchByTranID.dctGetTotal(dateFilter);

                log.debug({ title: 'gaSearchResultsSummary', details: gaSearchResultsSummary });
                log.debug({ title: 'dctSearchResultsSummary', details: dctSearchResultsSummary });

                var tableRows = ""; 

 
                for (var i = 0; i < gaSearchResultsSummary.length; i++) {
                    var result = gaSearchResultsSummary[i];
                    var date = result.date || '';
                    var grossAmount = result.grossamount || '0';
                    var taxTotal = '0';
                    var discountTotal = '0';
                    var cogsTotal = '0';
                    
                for (var j = 0; j < dctSearchResultsSummary.length; j++) {
                        if (dctSearchResultsSummary[j].tranid === result.tranid) {
                            taxTotal = dctSearchResultsSummary[j].taxtotal || '0'; 
                            discountTotal = dctSearchResultsSummary[j].discount || '0'; 
                            cogsTotal = dctSearchResultsSummary[j].cogs || '0'; 
                            break; 
                        }
                    }

                    var totalRevenue = parseFloat(grossAmount) - parseFloat(taxTotal);
                    var netRevenue = totalRevenue - parseFloat(discountTotal);
                    var netMargin = netRevenue - parseFloat(cogsTotal);
                    var cogsPercentage = totalRevenue > 0 ? (parseFloat(cogsTotal) / totalRevenue) * 100 : 0;
                    var netMarginPercentage = netRevenue > 0 ? (parseFloat(netMargin) / totalRevenue) * 100 : 0;

                    tableRows += '<tr>' +
                        '<td>' + date + '</td>' +
                        '<td>' + result.tranid + '</td>' +
                        '<td>' + parseFloat(grossAmount).toFixed(2) + '</td>' +
                        '<td>' + parseFloat(taxTotal).toFixed(2) + '</td>' +
                        '<td>' + totalRevenue.toFixed(2) + '</td>' +
                        '<td>' + parseFloat(discountTotal).toFixed(2) + '</td>' +
                        '<td>' + netRevenue.toFixed(2) + '</td>' +
                        '<td>' + parseFloat(cogsTotal).toFixed(2) + '</td>' +
                        '<td>' + cogsPercentage.toFixed(2) + '%</td>' +
                        '<td>' + netMargin.toFixed(2) + '</td>' +
                        '<td>' + netMarginPercentage.toFixed(2) + '%</td>' +
                        '</tr>';
                }
                return tableRows;
        }
        
        function generateByDay(dateFilter) {

            var gaSearchResultsSummary = searchByDay.gaGetTotal(dateFilter);
            var dctSummary = {};

            searchByDay.dctGetTotal(dateFilter).forEach(function(discount) {
                dctSummary[discount.date] = discount;
            });

            var tableRows = ""; 

            gaSearchResultsSummary.forEach(function(gaSearchResults, i) {
                var date = gaSearchResults.date;
                var dctSearchData = dctSummary[date] || { discount: '0', cogs: '0', taxtotal: '0' };


                var totalRevenue = parseFloat(gaSearchResults.grossamount) - parseFloat(dctSearchData.taxtotal);
                var netRevenue = totalRevenue - parseFloat(dctSearchData.discount);
                var netMargin = netRevenue - parseFloat(dctSearchData.cogs);
                var cogsPercentage = totalRevenue > 0 ? (parseFloat(dctSearchData.cogs) / totalRevenue) * 100 : 0;
                var netMarginPercentage = (netMargin / totalRevenue) * 100;

                
                var grossAmount = gaSearchResults.grossamount.toString()
                var taxTotal = dctSearchData.taxtotal.toString()
                var discountTotal = dctSearchData.discount.toString()
                var cogsTotal = dctSearchData.cogs.toString()

               tableRows += '<tr>' +
                        '<td>' + date + '</td>' +
                        '<td>' + gaSearchResults.tranid + '</td>' +
                        '<td>' + grossAmount + '</td>' +
                        '<td>' + taxTotal + '</td>' +
                        '<td>' + totalRevenue.toFixed(2) + '</td>' +
                        '<td>' + discountTotal + '</td>' +
                        '<td>' + netRevenue.toFixed(2) + '</td>' +
                        '<td>' + cogsTotal + '</td>' +
                        '<td>' + cogsPercentage.toFixed(2) + '%</td>' +
                        '<td>' + netMargin.toFixed(2) + '</td>' +
                        '<td>' + netMarginPercentage.toFixed(2) + '%</td>' +
                        '</tr>';
                  })
                return tableRows;
        }
    

        return {
            onRequest: onRequest
        };

    });