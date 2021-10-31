const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms' , {useNewUrlParser: true , useCreateIndex: true});
const conn = mongoose.Collection;
var passDetailSchema = new mongoose.Schema({
    password_category:{
      type:String,
      required:true,
      index:{
        unique:true
      }
    },
    passwordDetails:{
      type:String,
      required:true
    },
  date:{
      type:Date,
      default:Date.now
  }
});

var passCatModel = mongoose.model('password_Details',passDetailSchema);
module.exports = passCatModel;