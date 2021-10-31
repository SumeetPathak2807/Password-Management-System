const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms' , {useNewUrlParser: true , useCreateIndex: true});
const conn = mongoose.Collection;
var passCatSchema = new mongoose.Schema({
    passcat_name:{
        type:String,
        required: true,
        index:{
        unique:true,
    }
  },
  date:{
      type:Date,
      default:Date.now
  }
});

var passCatModel = mongoose.model('password_Categories',passCatSchema);
module.exports = passCatModel;