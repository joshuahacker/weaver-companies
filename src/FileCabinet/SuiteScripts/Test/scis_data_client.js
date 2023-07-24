function loadData() {
    var sublist1Url = './app/site/hosting/scriptlet.nl?script=1249&deploy=1'; // URL of the Suitelet or RESTlet for sublist 1 data
    var sublist2Url = './app/site/hosting/scriptlet.nl?script=1249&deploy=1'; // URL of the Suitelet or RESTlet for sublist 2 data
  
    // Make AJAX call for sublist 1 data
    https.get({
      url: sublist1Url,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      var sublist1Data = JSON.parse(response.body);
      // Process the sublist 1 data and update the sublist
      updateSublist1(sublist1Data);
    }).catch(function (error) {
      console.error('Error loading sublist 1 data:', error.message);
    });
  
    // Make AJAX call for sublist 2 data
    https.get({
      url: sublist2Url,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      var sublist2Data = JSON.parse(response.body);
      // Process the sublist 2 data and update the sublist
      updateSublist2(sublist2Data);
    }).catch(function (error) {
      console.error('Error loading sublist 2 data:', error.message);
    });
  }
  