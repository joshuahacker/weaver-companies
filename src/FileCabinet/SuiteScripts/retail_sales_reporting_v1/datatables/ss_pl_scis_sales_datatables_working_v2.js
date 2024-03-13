/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/http', 'N/log', 'N/file', './ss_pl_scis_sales_searches_day.js'], function (sw, http, log, file, saleSearches) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create the Suitelet form

            var dateFrom = context.request.parameters.custpage_from_date;
            var dateTo = context.request.parameters.custpage_to_date;

            var dateFilter = {
                dateFrom: dateFrom,
                dateTo: dateTo
            };

            log.debug(dateFilter)

            var tableRows = generateTableRows(dateFilter);

            var fileId = '19957'; // Use the internal ID or path to your uploaded HTML file
            var htmlFile = file.load({id: fileId});
            var htmlContent = htmlFile.getContents();
           
            htmlContent = htmlContent.replace('<!-- Table content -->', tableRows)
            
            var form = sw.createForm({
                title: '160 - Retail Sales Profit & Loss',
            });

            var inlineHtmlField = form.addField({
                id: 'custpage_html_table',
                type: sw.FieldType.INLINEHTML,
                label: 'HTML'
            });
         

inlineHtmlField.defaultValue = htmlContent;

context.response.writePage(form);

                  
        } else if (context.request.method === 'POST') {
            // Handle the POST request with the parameters
            var params = context.request.parameters;


            // Create the response
            var response = {
                message: 'Parameters received',
                params: params
            };

            // Send the response as JSON
            context.response.write(JSON.stringify(response));
    
        }
    }

       function generateTableRows(dateFilter) {
                var gaSearchResultsSummary = saleSearches.gaGetTotal(dateFilter);
                var dctSearchResultsSummary = saleSearches.dctGetTotal(dateFilter);

                log.debug({ title: 'gaSearchResultsSummary', details: gaSearchResultsSummary });
                log.debug({ title: 'dctSearchResultsSummary', details: dctSearchResultsSummary });

                var tableRows = ""; // Initialize the string to accumulate table rows

 
                for (var i = 0; i < gaSearchResultsSummary.length; i++) {
                    var result = gaSearchResultsSummary[i];
                    var date = result.date || '';
                    var grossAmount = result.grossamount || '0';
                    var taxTotal = '0';
                    var discountTotal = '0';
                    var cogsTotal = '0';

                    // Iterate through dctSearchResultsSummary to find matching tax total
                    for (var j = 0; j < dctSearchResultsSummary.length; j++) {
                        if (dctSearchResultsSummary[j].tranid === result.tranid) {
                            taxTotal = dctSearchResultsSummary[j].taxtotal || '0'; // Ensure it's a string
                            discountTotal = dctSearchResultsSummary[j].discount || '0'; // Assuming discount is in dctSearchResultsSummary
                            cogsTotal = dctSearchResultsSummary[j].cogs || '0'; // Assuming cogs is in dctSearchResultsSummary
                            break; // Found the matching transaction, no need to continue
                        }
                    }

                    var totalRevenue = parseFloat(grossAmount) - parseFloat(taxTotal);
                    var netRevenue = totalRevenue - parseFloat(discountTotal);
                    var netMargin = netRevenue - parseFloat(cogsTotal);
                    var cogsPercentage = totalRevenue > 0 ? (parseFloat(cogsTotal) / totalRevenue) * 100 : 0;
                    var netMarginPercentage = netRevenue > 0 ? (parseFloat(netMargin) / totalRevenue) * 100 : 0;

                    // Append the constructed row to tableRows
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
        
        return {
            onRequest: onRequest
        };

    });