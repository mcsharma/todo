
// To check if an email is already registered or not
Parse.Cloud.define("emailExists", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.User);
  query.equalTo('email', request.params.email);
  query.find({
    success: function (results) {
      response.success(results.length > 0 ? true : false);
    },
    error: function () {
      response.error('Email lookup failed');
    }
  });
});
