var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    var db = req.db;
    db.collection('users').find().toArray(function (err, users) {
     	res.renderPage('users', {
     		"title": "Users",
        	locals: {
        		"users" : users
      		}
      	});
 	});
});

module.exports = router;
