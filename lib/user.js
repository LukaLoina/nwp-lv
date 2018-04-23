var bcrypt= require('bcrypt');
var mongoose = require('mongoose');

//Izvoz User funkcije
module.exports= User;
function User(obj){
    for(var key in obj){
	this[key]= obj[key];
    }
}

//Spremanje korisnika u Mongo bazu podataka
User.prototype.save= function(fn){
    if(this.id){
	this.update(fn);
    } else {
	var user= this;
	user.hashPassword(function(err, user){
	    if(err) return fn(err);
	    mongoose.model('Users').create({ name: user.name, pass: user.pass, salt: user.salt}, function(err, user) {
		if(err) return fn(err);
		fn();
	    });
	});
    }
};

//Izmjena korisnika
User.prototype.update= function(fn){
    var user= this;
    var id= user.id;
    mongoose.model('Users').update({ _id: user.id}, { name: user.name, pass: user.pass}, {upsert: true}, function(err, user) {
	if(err) return fn(err);
	fn();
    });
};

//Generiranje lozinke
User.prototype.hashPassword= function(fn){
    var user= this;
    bcrypt.genSalt(12,function(err,salt){
	if(err) return fn(err);
	user.salt= salt;
	bcrypt.hash(user.pass,salt,function(err, hash){
	    if(err) return fn(err);
	    user.pass= hash;
	    fn(null, user);
	});
    });
};

//Dohvat korisnika prema imenu
User.getByName= function(name,fn){
    mongoose.model('Users').findOne({ name: name}, function(err, user){
	if(err) return fn(err, null);
	if(user)
	{
	    user.id = user._id;
	}
	return fn(null, new User(user));
    });
};

//Dohvat korisnika iz Redis baze podataka
User.get= function(id,fn){
    mongoose.model('Users').findOne({_id: id}, function(err, user){
	if(err) return fn(err);
	if(user)
	{
	    user.id = user._id;
	}
	return fn(null, new User(user));
    });
};

//Funkcija koja uspoređuje korisničko ime i lozinku
User.authenticate= function(name, pass, fn){
    User.getByName(name,function(err,user){
	if(err) return fn(err);
	if(!user.id) return fn();
	bcrypt.hash(pass, user.salt,function(err, hash){
	    if(err)return fn(err);
	    if(hash==user.pass) return fn(null, user);
	    fn();
	});
    });
};
