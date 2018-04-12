var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var methodOverride = require('method-override');

router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

// početna stranica
router.get('/', function (req, res, next) {

  // Dohvaćamo sve projekte
  mongoose.model('Project').find({}, function (err, projects) {

    // Ako je error ispišemo u konzolu
    if (err) {
      return console.error(err);
    } else {
      // Vratimo pogled
      res.format({
        html: function() {
          res.render('projects/index', {
            title: 'Svi Projekti',
            'projects': projects
          });
        },
        json: function() {
          res.json(projects);
        }
      });
    }
  });
});

// Novi projekt - stranica sa formom, samo vratimo pogled
router.get('/new', function(req, res) {
    res.render('projects/new', { title: 'Novi Projekt' });
});

// Kreiranje novog projekta
router.post('/', function(req, res) {

  // Pokupi sve podatke iz requesta
  var naziv = req.body.naziv;
  var opis = req.body.opis;
  var cijena = req.body.cijena;
  var obavljeni_poslovi = req.body.obavljeni_poslovi;
  var datum_pocetka = req.body.datum_pocetka;
  var datum_zavrsetka = req.body.datum_zavrsetka;

  // Kreiraj novi objekt
  mongoose.model('Project').create({

      naziv : naziv,
      opis : opis,
      cijena : cijena,
      obavljeni_poslovi : obavljeni_poslovi,
      datum_pocetka : datum_pocetka,
      datum_zavrsetka : datum_zavrsetka,

  }, function (err, project) {
      if (err) {
          res.send("There was a problem adding the information to the database.");
      } else {
          // Uspješno kreiran projekt
          res.format({
            html: function(){
                // Ovo će postaiti u address baru dobru lokaciju
                res.location("projects");
                // Šaljemo korisnika na indexpage od projekata
                res.redirect("/projects");
            },
            json: function(){
                res.json(project);
            }
        });
      }
  })
});


// Middleware za validaciju postoji li taj ID
router.param('id', function(req, res, next, id) {

    // Pronađi projekt s tim ID u bazi
    mongoose.model('Project').findById(id, function (err, project) {
        // Bacimo 404 ako nije pronađen taj id
        if (err) {

          res.status(404)
          var err = new Error('Not Found');
          err.status = 404;
          res.format({
              html: function(){
                  next(err);
               },
              json: function(){
                     res.json({message : err.status  + ' ' + err});
               }
          });

        } else {
          // Spremimo ID u request i idemo dalje
          req.id = id;
          next();
        }
    });
});

// Pregledavanje pojedinačnog projekta po ID
router.get('/:id', function(req, res) {

  mongoose.model('Project').findById(req.id, function (err, project) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
    } else {

      res.format({
        html: function(){
            res.render('projects/show', {
              "project" : project
            });
        },
        json: function(){
            res.json(project);
        }
      });
    }
  });
});

// Uređivanje projekta po ID (otvaranje forme, PUT zahtjeva kojim ažuriramo projekt i DELETE zahtjev kojim ga brišemo)
router.route('/:id/edit')

  // Otvaranje forme za editiranje
	.get(function(req, res) {

	    mongoose.model('Project').findById(req.id, function (err, project) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {

            // Pretvaranje datuma u čitkiji oblik
            var datumpocetka = project.datum_pocetka.toISOString();
            datumpocetka = datumpocetka.substring(0, datumpocetka.indexOf('T'));

            var datumzavrsetka = project.datum_zavrsetka.toISOString();
            datumzavrsetka = datumzavrsetka.substring(0, datumzavrsetka.indexOf('T'));

            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('projects/edit', {
                          title: 'Project ' + project._id,
                          "project" : project,
                          "datumpocetka" : datumpocetka,
                          "datumzavrsetka" : datumzavrsetka
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(project);
                 }
            });
	        }
	    });
	})

	// Update projekta (submit u bazu)
	.put(function(req, res) {

    // Pokupi sve podatke iz requesta
    var naziv = req.body.naziv;
    var opis = req.body.opis;
    var cijena = req.body.cijena;
    var obavljeni_poslovi = req.body.obavljeni_poslovi;
    var datum_pocetka = req.body.datum_pocetka;
    var datum_zavrsetka = req.body.datum_zavrsetka;

    // Pronađi zapis
    mongoose.model('Project').findById(req.id, function (err, project) {

        // Update podataka
        project.update({

          naziv : naziv,
          opis : opis,
          cijena : cijena,
          obavljeni_poslovi : obavljeni_poslovi,
          datum_pocetka : datum_pocetka,
          datum_zavrsetka : datum_zavrsetka,

        }, function (err, projectID) {
          if (err) {
            res.send("There was a problem updating the information to the database: " + err);
          }
          else {

            // Ako je uspješno, redirectaj ga na pregled projekta

            res.format({
              html: function(){
                  res.redirect("/projects/"+project._id);
              },
              json: function(){
                  res.json(project);
               }
            });
           }
        })
    });
	})

	// Brisanje projekta
	.delete(function (req, res){

	    mongoose.model('Project').findById(req.id, function (err, project) {
	        if (err) {
	            return console.error(err);
	        } else {

              // Brisanje iz baze
	            project.remove(function (err, project) {
	                if (err) {
	                    return console.error(err);
	                } else {
                    // Nakon što je uspješno obrisan, pošaljemo korisnika na početnu stranicu sa projektima
                    res.format({

                        html: function(){
                           res.redirect("/projects");
                        },
                        json: function(){
                          res.json({message : 'deleted',
                             item : project
                          });
                        }
                    });
	                }
	            });
	        }
	    });
	});

// Dodavanje članova u projekt
router.route('/:id/member')
    // Otvaranje forme za editiranje
    .get(function(req, res) {

        mongoose.model('Project').findById(req.id, function (err, project) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {

              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.render('projects/member', {
                            title: 'Add member to project ' + project._id,
                            "project" : project
                        });
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(project);
                   }
              });
            }
        });
    })

  // Dodavanje člana (submit u bazu)
	.post(function(req, res) {

    // Pokupi sve podatke iz requesta
    var ime = req.body.ime;

    // Pronađi zapis
    mongoose.model('Project').findById(req.id, function (err, project) {

      project.clanovi_tima.push(ime);
      project.save(function (err) {
        if (err) {
          res.send("There was a problem updating the information to the database: " + err);
        }
        else {

          // Ako je uspješno, redirectaj ga na pregled projekta

          res.format({
            html: function(){
                res.redirect("/projects/"+project._id);
            },
            json: function(){
                res.json(project);
             }
          });
         }
      });

    });
	})

module.exports = router;
