var mongoose = require('mongoose');
var projectSchema = new mongoose.Schema({
  naziv: String,
  opis: String,
  cijena: Number,
  obavljeni_poslovi: String,
  datum_pocetka: Date,
  datum_zavrsetka: Date,
  clanovi_tima: [String]
});
mongoose.model('Project', projectSchema);
