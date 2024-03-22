const fetch = require('node-fetch');

const accessToken = 'f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu'; // Replace with your access token
const apiUrl = 'https://api.smartsheet.com/2.0/sheets/1947084812248964'; // Replace with your API URL

async function fetchAndFormatData() {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData = await response.json();
    console.log(JSON.stringify(jsonData, null, 2)); // Format and print JSON data
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndFormatData();
