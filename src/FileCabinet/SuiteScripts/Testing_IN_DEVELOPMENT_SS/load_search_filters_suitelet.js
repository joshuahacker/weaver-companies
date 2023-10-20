/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/search", "N/ui/serverWidget", "N/log", "./all_transactions_search"], function (
  search,
  serverWidget,
  log,
  customSearch
) {
  function onRequest(context) {
    var dateFrom = context.request.parameters.datefrom;
    var dateTo = context.request.parameters.dateto;

    var form = serverWidget.createForm({
      title: "Multiple Search Results",
      clientScriptFileId: "14934",
    });

    // Create a field group for date filters
    var dateFieldGroup = form.addFieldGroup({
      id: "custpage_datefilters",
      label: "Filter",
    });

    // Add date filter fields
    var dateToField = form.addField({
      id: "datefrom",
      type: serverWidget.FieldType.DATE,
      label: "Date From",
      container: "custpage_datefilters",
      defaultValue: dateFrom || "",
    });
    dateToField.updateDisplaySize({
      height: 60,
      width: 100,
    });
    dateToField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.STARTROW,
    });

    var dateFromField = form.addField({
      id: "dateto",
      type: serverWidget.FieldType.DATE,
      label: "Date To",
      container: "custpage_datefilters",
      defaultValue: dateTo || "",
    });
    dateFromField.updateDisplaySize({
      height: 60,
      width: 100,
    });
    dateFromField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.ENDROW,
    });

    form.addSubmitButton({
      label: "Filter",
      container: "custpage_datefilters",
    });

    dateFieldGroup.isBorderHidden = false;
    dateFieldGroup.isCollapsible = true;
    dateFieldGroup.isSingleColumn = true;
    // Searches

    var searchConfigurations = [
      {
        id: "customsearch_ns_pos_transactions",
        label: "Transaction List",
        fields: [
          {
            id: "trandate",
            type: serverWidget.FieldType.DATE,
            label: "Date",
          },
          {
            id: "tranid",
            type: serverWidget.FieldType.TEXT,
            label: "ID",
          },
          {
            id: "amount",
            type: serverWidget.FieldType.TEXT,
            label: "Amount",
          },
        ],
      },
      {
        id: "customSalesSearch",
        label: "Transactions By Day",
        fields: [
          {
            id: "trandate",
            type: serverWidget.FieldType.DATE,
            label: "Date",
            summary: "search.Summary.GROUP",
            function: 'day'
          },
          {
            id: 'tranid',
            type: serverWidget.FieldType.INTEGER,
            label: 'TRAN ID',
            summary: "search.Summary.COUNT"
          },
          {
            id: 'quantity',
            type: serverWidget.FieldType.INTEGER,
            label: 'Units Sold',
            summary: "search.Summary.SUM"
          },
          {
            id: 'grossamount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Gross Sales',
            summary: "search.Summary.SUM"
          },
          {
            id: 'formulacurrency',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Returns',
            summary: "search.Summary.SUM"
          },
          {
            id: 'formulacurrency2',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Discounts',
            summary: "search.Summary.SUM"
          },
          {
            id: 'formulacurrency3',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Taxes',
            summary: "search.Summary.SUM"
          },
          {
            id: 'netamount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Sales',
            summary: "search.Summary.SUM"
          }
        ],
      },
    ];

    searchConfigurations.forEach(function (config) {

      var searchResults;

      if (config.id === 'customSalesSearch') {
        searchResults = customSearch.transactionSearch(dateFrom, dateTo);
        log.debug('searchResults', searchResults);
      } else {
        searchResults = findTrans(config.id, dateFrom, dateTo);
      }

      addSublistToForm(form, config, searchResults);
    });

    context.response.writePage(form);
  }

  function addSublistToForm(form, config, searchResults) {
    var sublist = form.addSublist({
      id: config.label.replace(/\s+/g, '').toLowerCase(),
      type: serverWidget.SublistType.LIST,
      label: config.label,
    });

    config.fields.forEach(function (field) {
      sublist.addField({
        id: field.id,
        type: field.type,
        label: field.label,
      });
    });

    for (var i = 0; i < searchResults.length; i++) {
      var result = searchResults[i];
      config.fields.forEach(function (field) {
        var getValueConfig = { name: field.id };
        if (field.summary) {
          getValueConfig.summary = field.summary;
        }

        var value = result.getValue(getValueConfig);

        sublist.setSublistValue({
          id: field.id,
          line: i,
          value: value
        });
      });
    }
  }

  function findTrans(searchId, dateFrom, dateTo) {
    // Load the predefined NetSuite search
    var loadedSearch = search.load({ id: searchId });

    if (dateFrom || dateTo) {
      var filters = [];
      if (dateFrom) {
        filters.push(['trandate', 'onorafter', dateFrom]);
      }
      if (dateTo) {
        filters.push('and', ['trandate', 'onorbefore', dateTo]);
      }
      loadedSearch.filterExpression = filters;
    }

    return loadedSearch.run().getRange({ start: 0, end: 50 });
  }

  return {
    onRequest: onRequest,
  };
});
