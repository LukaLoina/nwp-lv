var mongoose = require('mongoose');
var projectSchema = new mongoose.Schema({
  naziv: String,
  opis: String,
  cijena: Number,
  obavljeni_poslovi: String,
  datum_pocetka: Date,
  datum_zavrsetka: Date
});
mongoose.model('Project', projectSchema);
