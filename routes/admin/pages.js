var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var ObjectID = require('mongoskin').ObjectID;
var _ = require('underscore');

var router = express.Router();

var strUtils = {
	currencyStringToNumber: function (currencyString) {
		return (currencyString.match(/.*\$.*?([0-9,]+\.[0-9]{2}?.*)/) || [])[1]
	}
};

router.get('/', function(req, res) {
  var db = req.db;

  db.collection("pages").find().toArray(function (err, pages) {
		if (err)
			throw err;

   	res.renderAdminPage('pages', {
   		"title": "Pages",
   		locals: {
      	"pages" : pages
      }
    });
  });
});

router.get('/:id/deals', function(req, res) {
	var db = req.db,
		pageId = ObjectID(req.params.id);

	db.collection("deals").find({_pageId: pageId}).toArray(function (err, deals) {
		if (err)
			throw err;

		res.renderAdminPage("deals", {
			title: "deals",
			locals: {
				"deals": deals
			}
		});
	});
});

router.get('/:id', function(req, res) {
	var db = req.db;

	db.collection("pages").findById(ObjectID(req.params.id), function (err, page){
		if (err)
			throw err;

		res.renderAdminPage("page", {
			title: "Page",
			locals: {
				"page": page
			}
		});
	});
});

router.post('/:id', function(req, res) {
	var db = req.db;

	db.collection("pages").findById(ObjectID(req.params.id), function (err, page){
		if (err)
			throw err;

		res.renderAdminPage("page", {
			title: "Page",
			locals: {
				"page": page
			}
		});
	});
});

router.get('/:id/crawl', function(req, res) {
	var db = req.db,
		pageId = ObjectID(req.params.id);
	
	db.collection("pages").findById(pageId, function (err, page) {
		if (err)
	    throw err;
	    
		request(page.url, function(err, resp, pageBody) {
	    if (err)
	      throw err;

	    $ = cheerio.load(pageBody);
	  	
	  	_.each($(page.rules.entry).toArray(), function (entry) {
	  		db.collection("deals").insert({
	  			_pageId: page._id,
	  			name: $(entry).find(page.rules.name).text(),
	  			url: $(entry).find(page.rules.url).attr("href"),
	  			imageUrl: $(entry).find(page.rules.imageUrl).attr("src"),
	  			price: {
	  				regular: strUtils.currencyStringToNumber($(entry).find(page.rules.price.regular).text()),
	  				deal: strUtils.currencyStringToNumber($(entry).find(page.rules.price.deal).text())
	  			},
	  			savings: {
	  				percentage: $(entry).find(page.rules.savings.percentage).text(),
	  				value: strUtils.currencyStringToNumber($(entry).find(page.rules.savings.value).text())
	  			}
	  		}, function (err, deal) {
	  			if (err)
	  				throw err;	
	  		});
	  	});

	  	db.collection("deals").find({_pageId: pageId}).toArray(function (err, deals) {
				if (err)
					throw err;

				res.renderAdminPage("deals", {
					title: "deals",
					locals: {
						"deals": deals
					}
				});
			});
	  });
	});
});

module.exports = router;