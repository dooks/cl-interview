var express = require('express');
var router  = express.Router();
var request = require("request");
var fs      = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("index.html");
});

router.get('/proxy', function(req, res, next) {
  // Proxy a URL request to circumvent CORS request
  // This did not work... despite this being a server-server interaction
  // It still returns a 401 unauthorized
  function success(err, req, res) {
    console.log(req);
    console.log(res);
  }

  request({
    method: req.query.method || "GET",
    uri: req.query.uri,
    headers: { "Authorization": "Bearer d7ea65ee-b1bc-3ca1-df02-e9f0960bd3a8" }
  }, success);
});

router.get('/merchants/items', function(req, res, next) {
  // Return test dummy inventory data (read only)
  var retval = JSON.parse(fs.readFileSync("data/test.json", "utf8"));
  res.json(retval);
});

module.exports = router;
