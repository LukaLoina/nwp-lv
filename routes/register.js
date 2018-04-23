var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../lib/user');

//var methodOverride = require('method-override');

//prikazujemo formu za registraciju
router.get('/', function(req,res,next){
    res.render('register',{ title:'Register'});
});

//regostriramo korisnika ukoliko je unio točne podatke
//prikazujemo pogrešku ukoliko su podaci pogrešni
router.post('/', function(req,res,next){
    User.getByName(req.body.name,function(err,user){
	if(err) return next(err);
	//Ako je korisničko ime zauzeto
	if(user.id) {
	    res.send("Korisničko ime je zauzeto!");
	} else {
	    //Stvori novog korisnika
	    user= new User({
		name:req.body.name,
		pass:req.body.pass
	    });
	    //Spremi korisnika
	    user.save(function(err){
		if(err) return next(err);
		res.redirect('/');
	    });
	}
    });
});

module.exports = router;
