/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/log', './ss_pl_scis_sales_searches_day.js'], function (sw, log, saleSearches) {
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

            var form = sw.createForm({
                title: '160 - Retail Sales Profit & Loss',
            });

            var inlineHtmlField = form.addField({
                id: 'custpage_html_table',
                type: sw.FieldType.INLINEHTML,
                label: 'HTML'
            });
                
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
        
              
            var htmlContent = '<link href="https://cdn.datatables.net/2.0.2/css/dataTables.bootstrap5.min.css" rel="stylesheet">' +
        '<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">' +
     
                '<style>' +
                'input[type="text"], input[type="search"], textarea, button {outline: none; box-shadow:none !important; border: 1px solid #ccc !important;}' +
			'p, pre {font-size: 10pt;}' +
	        'td, th { font-size: 10pt; border: 1px;}' +
	        'th {font-weight: bold;}'+
		    '</style>' +
	
    '<table id="salesDataTable" class="table table-striped table-hover table-bordered" style="width:100%">' +
    '<thead>' +
        '<tr>' +
            '<th>Date</th>' +
            '<th>Transaction ID</th>' +
            '<th>Sale Amount</th>' +
            '<th>Tax</th>' +
            '<th>Total Revenue</th>' +
            '<th>Discounts</th>' +
            '<th>Net Revenue</th>' +
            '<th>COGS</th>' +
            '<th>COGS %</th>' +
            '<th>Net Profit</th>' +
            '<th>Net Profit %</th>' +
        '</tr>' +
    '</thead>' +
    '<tbody>' +
        tableRows +
    '</tbody>' +
    '<tfoot>' +
        '<tr>' +
                '<th colspan="2">Totals:</th>' +
                 '<th></th>' +
            '<th></th>' + // Placeholder for Sale Amount Total
            '<th></th>' + // Placeholder for Tax Total
                '<th></th>' + // Placeholder for Total Revenue
                '<th></th>' + // Placeholder for Discount Total
                '<th></th>' + // Placeholder for Net Revenue
                '<th></th>' + // Placeholder for COGS Total
                '<th></th>' + // Placeholder for COGS %
                '<th></th>' + // Placeholder for Net Profit
                '<th></th>' + // Placeholder for Net Profit %
        '</tr>' +
    '</tfoot>' +
                '</table>' +
'<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>' +
    '<script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.1.3/js/bootstrap.bundle.min.js"></script>' +		
   '<script>' +
    '$(document).ready(function() {' +
        '$("#salesDataTable").DataTable({' +
            '"footerCallback": function(row, data, start, end, display) {' +
                'var api = this.api();' +
                // Calculate Sale Amount Total
                'var saleAmountTotal = api.column(2, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate Tax Total
                'var taxTotal = api.column(3, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate Total Revenue
                'var totalRevenue = api.column(4, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate Discount Total
                'var discountTotal = api.column(5, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate Net Revenue
                'var netRevenue = api.column(6, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate COGS Total
                'var cogsTotal = api.column(7, {page: "current"}).data().reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0);' +
                // Calculate Net Margin (Note: this may require custom calculation logic based on your data)
                'var netMargin = netRevenue - cogsTotal;' +
                // Calculate Net Profit Percentage (Note: this calculation might need adjustment based on how you define net profit)
                'var netProfitPercentage = (netRevenue > 0) ? ((netMargin / netRevenue) * 100) : 0;' +
                
                // Update the footer cells with the calculated totals
                '$(api.column(2).footer()).html(saleAmountTotal.toFixed(2));' +
                '$(api.column(3).footer()).html(taxTotal.toFixed(2));' +
                '$(api.column(4).footer()).html(totalRevenue.toFixed(2));' +
                '$(api.column(5).footer()).html(discountTotal.toFixed(2));' +
                '$(api.column(6).footer()).html(netRevenue.toFixed(2));' +
                '$(api.column(7).footer()).html(cogsTotal.toFixed(2));' +
                '$(api.column(8).footer()).html(netMargin.toFixed(2));' +
                '$(api.column(9).footer()).html(netProfitPercentage.toFixed(2) + "%");' +
            '}' +
        '});' +
    '});' +
'</script>';

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
        return {
            onRequest: onRequest
        };

    });