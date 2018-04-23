var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    //Brisanje session-a
    req.session.destroy(function(err){
	if(err) throw err;
	res.redirect('/');
    })
});

module.exports = router;
