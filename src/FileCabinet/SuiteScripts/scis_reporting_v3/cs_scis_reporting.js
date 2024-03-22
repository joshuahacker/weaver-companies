/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/format'], function (url, format) {
	function pageInit(context) {
		console.log('Page Initialized');

		document.getElementById('custpage_applyFilter').addEventListener('click', applyFilter);

		// Restoring the last selected option from localStorage
		var lastSelected = localStorage.getItem('custpage_options');
		if (lastSelected) {
			document.getElementById('custpage_options').value = lastSelected;
		}

		var lastSelected = localStorage.getItem('custpage_date_from');
		if (lastSelected) {
			document.getElementById('custpage_date_from').value = lastSelected;
		}

		var lastSelected = localStorage.getItem('custpage_date_to');
		if (lastSelected) {
			document.getElementById('custpage_date_to').value = lastSelected;
		}

		$(document).ready(function () {
			$('#custpage_options').on('change', function () {
				var selectedValue = $(this).val();

				switch (selectedValue) {
					case 'day':
					case 'transaction_id':
					case 'week':
						console.log(selectedValue + ' was selected');
						handleOptionsChange();
						break;
					default:
						alert('Please pick a view.');
				}
			});
		});

		// Initialize the DataTable only if it hasn't been initialized yet
		if (!$.fn.DataTable.isDataTable('#salesDataTable')) {
			initializeDataTable();
		}
	}

	function initializeDataTable() {
		var table = $('#salesDataTable').DataTable({
			dom:
				"<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-4 center'><'col-sm-12 col-md-4'>B>" +
				"<'row'<'col-sm-12'tr>>" +
				"<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-4 text-center'i><'col-sm-12 col-md-4'p>>",
			fixedHeader: true,
			pageLength: 25,
			pagingType: 'full_numbers',
			buttons: [
				{ extend: 'excel', text: '<i class="fa fa-file-excel" style="color: #1d6f42; font-size: 1.2rem;"></i>', titleAttr: 'Export to Excel' },
				{ extend: 'csv', text: '<i class="fas fa-file-csv" style="color: #70f598; font-size: 1.2rem;"></i>', titleAttr: 'Export to CSV' },
				{ extend: 'pdf', text: '<i class="fas fa-file-pdf" style="color: #a70101; font-size: 1.22rem;"></i>', titleAttr: 'Export to PDF' }
			],

			initComplete: function (settings, json) {
				$(this).addClass('table table-striped table-bordered table-hover');
				$('#loader').hide();
				$('#thData').show();
				$('#tbodyData').show();
				$('#tfootData').show();
			},

			footerCallback: function (row, data, start, end, display) {
				var api = this.api();
				// Calculate Total Trans
				var totalTransactions = api
					.column(1, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate Sale Amount Total
				var saleAmountTotal = api
					.column(2, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate Tax Total
				var taxTotal = api
					.column(3, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate Total Revenue
				var totalRevenue = api
					.column(4, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate Discount Total
				var discountTotal = api
					.column(5, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate Net Revenue
				var netRevenue = api
					.column(6, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				// Calculate COGS Total
				var cogsTotal = api
					.column(7, { page: 'current' })
					.data()
					.reduce(function (a, b) {
						return parseFloat(a) + parseFloat(b);
					}, 0);
				var netMargin = netRevenue - cogsTotal;
				var cogsPercentage = totalRevenue > 0 ? (cogsTotal / totalRevenue) * 100 : 0;
				var netProfitPercentage = netRevenue > 0 ? (netMargin / netRevenue) * 100 : 0;
				var totalTransactionsDisplay = !totalTransactions && totalTransactions !== 0 ? '' : totalTransactions.toLocaleString();

				// Update the footer cells with the calculated totals
				$(api.column(1).footer()).html(totalTransactionsDisplay);
				$(api.column(2).footer()).html(saleAmountTotal.toFixed(2));
				$(api.column(3).footer()).html(taxTotal.toFixed(2));
				$(api.column(4).footer()).html(totalRevenue.toFixed(2));
				$(api.column(5).footer()).html(discountTotal.toFixed(2));
				$(api.column(6).footer()).html(netRevenue.toFixed(2));
				$(api.column(7).footer()).html(cogsTotal.toFixed(2));
				$(api.column(8).footer()).html(cogsPercentage.toFixed(2) + '%');
				$(api.column(9).footer()).html(netMargin.toFixed(2));
				$(api.column(10).footer()).html(netProfitPercentage.toFixed(2) + '%');
			}
		});

		// Adjustments for custom controls
		$('#searchInput').append($('.dataTables_filter'));
		$('#searchWrapper').prependTo($('#salesDataTable_wrapper .dt-buttons'));
		$('.dataTables_filter input').attr('placeholder', 'Search');
		$('.dataTables_filter label')
			.contents()
			.filter(function () {
				return this.nodeType === 3;
			})
			.remove();

		// Event handlers for export buttons
		eventHandlerRowClick(table);

		$('#salesDataTable tbody')
			.on('mouseenter', 'tr', function () {
				$(this).css('cursor', 'pointer');
			})
			.on('mouseleave', 'tr', function () {
				$(this).css('cursor', '');
			});
	}

	function applyFilter() {
		if (window.onbeforeunload) {
			window.onbeforeunload = function () {
				null;
			};
		}

		var dateFrom = document.getElementById('custpage_date_from').value;
		var dateTo = document.getElementById('custpage_date_to').value;
		var filterOptions = document.getElementById('custpage_options').value;

		localStorage.setItem('custpage_options', filterOptions);
		localStorage.setItem('custpage_date_to', dateTo);
		localStorage.setItem('custpage_date_from', dateFrom);

		if (dateFrom && dateTo && filterOptions !== 'viewby') {
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_sl_scis_reporting_index',
				deploymentId: 'customdeploy_sl_scis_reporting_index',
				params: {
					custpage_options: filterOptions,
					custpage_from_date: dateFrom,
					custpage_to_date: dateTo
				}
			});

			window.location.href = suiteletURL;
		} else {
			alert('Please select a valid date range.');
		}
	}

	function handleOptionsChange() {
		var dateFrom = document.getElementById('custpage_date_from').value;
		var dateTo = document.getElementById('custpage_date_to').value;
		var filterOptions = document.getElementById('custpage_options').value;
		console.log(dateFrom, dateTo, filterOptions);

		localStorage.setItem('custpage_options', filterOptions);
		localStorage.setItem('custpage_date_to', dateTo);
		localStorage.setItem('custpage_date_from', dateFrom);

		if (dateFrom && dateTo && filterOptions !== 'viewby') {
			var suiteletURL = url.resolveScript({
				scriptId: 'customscript_sl_scis_reporting_index',
				deploymentId: 'customdeploy_sl_scis_reporting_index',
				params: {
					custpage_options: filterOptions,
					custpage_from_date: dateFrom,
					custpage_to_date: dateTo
				}
			});
			window.location.href = suiteletURL;
		} else {
			alert('Please select a valid date range.');
		}
	}

	function eventHandlerRowClick(table) {
		$('#salesDataTable tbody').on('click', 'tr', function () {
			var filteredView = document.getElementById('custpage_options').value;

			if (filteredView === 'week') {
				var weekYearFrom = document.getElementById('custpage_date_from').value.split('-')[0];
				var weekNumberFrom = document.getElementById('custpage_date_from').value.split('-')[1];
				var weekYearTo = document.getElementById('custpage_date_to').value.split('-')[0];
				var weekNumberTo = document.getElementById('custpage_date_to').value.split('-')[1];

				var fromDateRange = getWeekDateRange(parseInt(weekYearFrom), parseInt(weekNumberFrom));
				var toDateRange = getWeekDateRange(parseInt(weekYearTo), parseInt(weekNumberTo));

				var encodedDateFrom = encodeURIComponent(fromDateRange.start);
				var encodedDateTo = encodeURIComponent(toDateRange.end);
				var url =
					'https://8025197.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1560&deploy=1&compid=8025197&custpage_options=day&custpage_from_date=' +
					encodedDateFrom +
					'&custpage_to_date=' +
					encodedDateTo;
				window.location.href = url;
			} else if (filteredView === 'day') {
				var data = table.row(this).data();
				var dateFromRow = data[0];
				var encodedDate = encodeURIComponent(dateFromRow);
				var url =
					'https://8025197.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1560&deploy=1&compid=8025197&custpage_options=transaction_id&custpage_from_date=' +
					encodedDate +
					'&custpage_to_date=' +
					encodedDate;
				window.location.href = url;
			}
		});
		  function getWeekDateRange(year, weekNumber) {
				const msInDay = 24 * 60 * 60 * 1000;
				const firstJan = new Date(year, 0, 1);
				const days = (weekNumber - 1) * 7;
				let firstDayOfFirstWeek = firstJan.getDay() === 0 ? 6 : firstJan.getDay() - 1;
				let startDate = new Date(firstJan.getTime() - firstDayOfFirstWeek * msInDay + days * msInDay);
				let endDate = new Date(startDate.getTime() + 6 * msInDay);

				// Utilizing the N/format module for date formatting
				function formatDate(date) {
					return format.format({
						value: date,
						type: format.Type.DATE,
						format: 'MM/DD/YY' // Adjust the format string as needed
					});
				}

				return {
					start: formatDate(startDate),
					end: formatDate(endDate)
				};
			}

	}
	return {
		pageInit: pageInit
	}
})
