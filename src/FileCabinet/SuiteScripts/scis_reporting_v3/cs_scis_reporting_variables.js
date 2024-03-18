/** 
  @variables summary columns === GROUP or COUNT
  @variables summary columns === DAY or MONTH or weekOfYear
  @variables filter columns === dateTo and dateFrom
  @variables filter columns === gaSearch and dctSearch
  @constants filter columns === filterParams by trandate 
  @constants formulas:
      totalRevenue = GrossAmount - TaxTotal
      netRevenue = totalRevenue - discountTotal
      netMargin = netRevenue - cogsTotal
      cogsPercentage = totalRevenue > 0? cogsTotal / totalRevenue) * 100 : 0
      netMarginPercentage = netRevenue > 0? (netMargin / totalRevenue) * 100 : 0
  @constants functions:
      formatDate
      filterDateParamsAndSearches
  
  */

function formatDate(date) {
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var year = date.getFullYear();

	return ('00' + month).slice(-2) + '/' + ('00' + day).slice(-2) + '/' + ('' + year).slice(-2);
}

var gaSearch = search.create({
	type: 'transaction',
	filters: [
		['type', 'anyof', 'CashSale', 'CustInvc'],
		'AND',
		['item', 'noneof', '@NONE@'],
		'AND',
		['taxline', 'is', 'F'],
		'AND',
		['account', 'anyof', '817', '54', '936', '898'],
		'AND',
		['customermain.entityid', 'haskeywords', 'Ipad'],
		'AND',
		['memo', 'doesnotcontain', 'VOID'],
		'AND',
		['item.type', 'noneof', 'Markup', 'Payment', 'Subtotal'],
		'AND',
		['account', 'noneof', '110'],
		'AND',
		['location', 'anyof', '14']
	],

	columns: gaSummaryColumns
});

var dctSearch = search.create({
	type: 'transaction',
	filters: [
		['type', 'anyof', 'CashSale', 'CustInvc'],
		'AND',
		['customermain.entityid', 'haskeywords', 'Ipad'],
		'AND',
		['memo', 'doesnotcontain', 'VOID'],
		'AND',
		['item.type', 'noneof', 'Markup', 'Payment', 'Subtotal'],
		'AND',
		['account', 'noneof', '110'],
		'AND',
		['location', 'anyof', '14']
	],
	columns: dctSummaryColumns
});

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
		summary: 'GROUP',
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
		log.debug({ title: 'Parameter Date Filters', details: { from: formattedFromDate, to: formattedToDate } });
	} else {
		// Set default date range if no date filter is provided
		var defaultFromDate = new Date();
		defaultFromDate.setDate(defaultFromDate.getDate() - 7);
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
		log.debug({ title: 'Default Date Filters', details: { from: formattedDefaultFromDate, to: formattedDefaultToDate } });
	}
}
