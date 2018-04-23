var mongoose = require('mongoose');
var projectSchema = new mongoose.Schema({
  naziv: String,
  opis: String,
  cijena: Number,
  obavljeni_poslovi: String,
  datum_pocetka: Date,
  datum_zavrsetka: Date,
  voditelj_tima: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
  clanovi_tima: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
  arhiviran: Boolean
});
mongoose.model('Project', projectSchema);
