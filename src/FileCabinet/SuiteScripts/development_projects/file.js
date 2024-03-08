/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */

define(['N/file', 'N/record', 'N/log'], function (file, record, log) {

  function onRequest(context) {
    try {
      // Set the internal ID of the file you want to pull
      var fileId = '18458';

      // Load the file with user permissions
      var fileObj = file.load({
        id: fileId,
        isDynamic: false
      });

      // Access the file's content
      var fileContent = fileObj.getContents();

      // Do something with the file content (e.g., return it as a response)
      context.response.write(fileContent);
    } catch (e) {
      // Handle errors appropriately
      log.error('Error', e.toString());
      context.response.write('An error occurred: ' + e.toString());
    }
  }

  return {
    onRequest: onRequest
  };

});
