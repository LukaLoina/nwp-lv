var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../lib/user');

//prikazujemo formu za login
router.get('/', function(req,res){
    res.render('login',{ title:'Login'});
});

//Provjera korisničkih podataka
router.post('/', function(req,res,next){
    User.authenticate(req.body.name, req.body.pass,function(err,
							   user){
	if(err) return next(err);
	if(user) {
	    req.session.uid= user.id;
	    res.redirect('/');
	}
	else{
	    res.send("Podaci za prijavu nisu ispravni!");
	}
    });
});

module.exports = router;
