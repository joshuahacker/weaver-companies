define(['N/search', 'N/log'], function(search, log) {

// function to format date in "mm/dd/yy" format
  function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
  
    return ('00' + month).slice(-2) + '/' + ('00' + day).slice(-2) + '/' + ('' + year).slice(-2);
  };
    
// function to load gross amount from 7000 Income G&L accounts and find transaction item count
  function gaGetTotal(dateFilter) {
		var gaSummaryColumns = [
			search.createColumn({
				name: 'trandate',
				summary: 'GROUP',
				function: 'day',
				sort: search.Sort.DESC,
				label: 'Date'
			}),
			search.createColumn({
				name: 'tranid',
				summary: 'COUNT',
				label: 'Document Number'
			}),
			search.createColumn({
				name: 'grossamount',
				summary: 'SUM',
				label: 'Gross Sales'
			}),
			search.createColumn({
				name: 'item',
				summary: 'COUNT',
				label: 'Items'
			})
		];

		// create search for finding gross amount and find transaction item count

		var gaSearch = search.create({
			type: 'transaction',
			filters: [
				['type', 'anyof', 'CashSale', 'CustInvc'],
				'AND',
				['account', 'noneof', '110'],
				'AND',
				['item', 'noneof', '@NONE@'],
				'AND',
				['taxline', 'is', 'F'],
				'AND',
				['account', 'anyof', '817', '54', '936', '898'],
				'AND',
				['customermain.entityid', 'haskeywords', 'Ipad'],
				'AND',
				['item.type', 'noneof', 'Markup', 'Payment', 'Subtotal'],
				'AND',
				['memo', 'doesnotcontain', 'VOID'],
				'AND',
				['location', 'anyof', '14']
			],

			columns: gaSummaryColumns
		});

		// run search for gross amount and return results in summary format

		filterDateParamsAndSearches(dateFilter, gaSearch);

		var gaSearchResults = gaSearch.run();
		var gaSearchResultsSummary = [];

		gaSearchResults.each(function (result) {
			var date = result.getValue(gaSummaryColumns[0]);

			var gaSummary = {
				date: date,
				tranid: result.getValue(gaSummaryColumns[1]),
				grossamount: result.getValue(gaSummaryColumns[2]),
				item: result.getValue(gaSummaryColumns[3])
			};
			gaSearchResultsSummary.push(gaSummary);
			return true;
		});

		// log auditing for gross amount search results

		log.audit({ title: 'Gross Amount Search Results', details: gaSearchResultsSummary });

		return gaSearchResultsSummary;
  }

  // function to load discount totals, tax totals, and COGS totals
  function dctGetTotal(dateFilter) {
		var dctSummaryColumns = [
			search.createColumn({
				name: 'trandate',
				summary: 'GROUP',
				function: 'day',
				sort: search.Sort.DESC,
				label: 'Date'
			}),
			search.createColumn({
				name: 'tranid',
				summary: 'COUNT',
				label: 'Document Number'
			}),
			search.createColumn({
				name: 'formulacurrency1',
				summary: 'SUM',
				formula: "Case When {item.type}='Discount' then ABS({amount}) else 0 end",
				label: 'Formula (Currency)'
			}),
			search.createColumn({
				name: 'costestimate',
				summary: 'SUM',
				label: 'Total Costs of Goods'
			}),
			search.createColumn({
				name: 'formulacurrency',
				summary: 'SUM',
				formula: '{taxamount}',
				label: 'Formula (Currency)'
			})
		];

		var dctSearch = search.create({
			type: 'transaction',
			filters: [
				['type', 'anyof', 'CashSale', 'CustInvc'],
				'AND',
				['account', 'noneof', '110'],
				'AND',
				['customermain.entityid', 'haskeywords', 'Ipad'],
				'AND',
				['memo', 'doesnotcontain', 'VOID'],
				'AND',
				['item.type', 'noneof', 'Markup', 'Payment', 'Subtotal'],
				'AND',
				['location', 'anyof', '14']
			],
			columns: dctSummaryColumns
		});

		// run search for finding discount, tax, and COGS totals
		filterDateParamsAndSearches(dateFilter, dctSearch);

		var dctSearchResults = dctSearch.run();
		var dctSearchResultsSummary = [];

		dctSearchResults.each(function (result) {
			var date = result.getValue(dctSummaryColumns[0]);

			var dctSummary = {
				date: date,
				tranid: result.getValue(dctSummaryColumns[1]),
				discount: result.getValue(dctSummaryColumns[2]),
				cogs: result.getValue(dctSummaryColumns[3]),
				taxtotal: result.getValue(dctSummaryColumns[4])
			};
			dctSearchResultsSummary.push(dctSummary);
			return true;
		});

		log.audit({ title: 'Discount, Tax Amount, COGS Search Results', details: dctSearchResultsSummary });

		return dctSearchResultsSummary;
  }

// function for dateTo and dateFrom search filtering
  function filterDateParamsAndSearches(dateFilter, searchObj) {
    var dateFrom = new Date(dateFilter.dateFrom);
    var dateTo = new Date(dateFilter.dateTo);
    var formattedFromDate = formatDate(dateFrom);
    var formattedToDate = formatDate(dateTo);
            
    if (dateFilter && dateFilter.dateFrom && dateFilter.dateTo) {
        // Apply date filters to gaSearch
        searchObj.filters.push(
            search.createFilter({
              name: 'trandate',
              operator: search.Operator.WITHIN,
              values: [formattedFromDate, formattedToDate]
            })
        );

        // Debug log for date filters
        log.debug({ title: "Parameter Date Filters", details: { from: formattedFromDate, to: formattedToDate } });

    } else {
        // Set default date range if no date filter is provided
        var defaultFromDate = new Date();
        defaultFromDate.setDate(defaultFromDate.getDate() - 30);
        var formattedDefaultFromDate = formatDate(defaultFromDate);
        var formattedDefaultToDate = formatDate(new Date());

        // Apply default date filters to gaSearch
        searchObj.filters.push(
            search.createFilter({
              name: 'trandate',
              operator: search.Operator.WITHIN,
              values: [formattedDefaultFromDate, formattedDefaultToDate]
            })
        );

        // Debug log for default date filters
        log.debug({ title: "Default Date Filters", details: { from: formattedDefaultFromDate, to: formattedDefaultToDate } });
    }
}

    return {
        gaGetTotal: gaGetTotal,
        dctGetTotal: dctGetTotal   
    }
});