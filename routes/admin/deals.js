var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    var db = req.db;
    db.collection('/').find().toArray(function (err, users) {
     	res.renderPage('admin/deals', {
     		"title": "Deals",
        	locals: {
        		"deals" : deals
      		}
      	});
 	});
});

module.exports = router;
