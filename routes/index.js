var express = require('express');
var router = express.Router();
var userModule = require('../module/user');
var passcatModule = require('../module/passwordCategory');
var passDetailModule = require('../module/add_password');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
var getPasscatname = passcatModule.find({});
var getAllPassword = passDetailModule.find({});

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Middleware Functions

function checkLoginUser(req,res,next) {
  var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

function checkUsername(req,res,next){
  var uname = req.body.uname;
  var checkunameExist = userModule.findOne({username:uname});
  checkunameExist.exec((err,data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup',{title:'Password Management System', msg:'Username Already Exist'})
    }next();
  })
}

function checkEmail(req,res,next){
  var email = req.body.email;
  var checkemailExist = userModule.findOne({email:email});
  checkemailExist.exec((err,data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup',{title:'Password Management System', msg:'Email Already Exist'})
    }next();
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard')
  }else{
  res.render('index', { title: 'Password Management System',msg:''});
  }
});

router.post('/', function(req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;
  var checkUser = userModule.findOne({username:username});
  checkUser.exec((err,data)=>{
    if(err) throw err;

    var getUserId = data._id;
    var getPassword = data.password;
    if(bcryptjs.compareSync(password,getPassword)){
      var token = jwt.sign({ userId: getUserId }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', username);
      res.redirect('/dashboard')
    }else{
    res.render('index', { title: 'Password Management System',msg:'Invalid Username and Password' });
    }
  })
});

router.get('/dashboard',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('dashboard', { title: 'Password Management System',loginUser:loginUser, msg:'' });
});

router.get('/signup', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard')
  }else{
  res.render('signup', { title: 'Password Management System',msg:'' });
  }
});

router.post('/signup',checkUsername,checkEmail, function(req, res, next) {
    var username = req.body.uname;
    var email = req.body.email;
    var password = req.body.password;
    var confpassword   = req.body.confpassword;

  if(password != confpassword){
    res.render('signup', { title: 'Password Management System', msg:'Password Not Matched' });
  }else{
    password = bcryptjs.hashSync(req.body.password,10);

    var userDetails = new userModule({
      username:username,
      email:email,
      password:password
    });

    userDetails.save((err,doc)=>{
      if(err) throw err;
      res.render('signup', { title: 'Password Management System', msg:'User Register Succesfully' });
    });
  }
});

router.get('/passwordCategory',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  getPasscatname.exec(function(err,doc){
   if(err) throw err;
    res.render('password_category', { title: 'Password Category Lists',records:doc,loginUser:loginUser });
  })
});

router.get('/passwordCategory/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.params.id;
  //console.log(passcat_id);

  var passcatdelete = passcatModule.findByIdAndDelete(passcat_id);
  passcatdelete.exec(function(err){
   if(err) throw err;
    res.redirect('/passwordCategory');
  })
});

router.get('/passwordCategory/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.params.id;
  //console.log(passcat_id);

  var getpasscat = passcatModule.findById(passcat_id);
  getpasscat.exec(function(err,data){
   if(err) throw err;
   res.render('edit_pass_category', { title: 'Password Category Lists',loginUser:loginUser,error:'',success:'',records:data,id:passcat_id });
  })
});

router.post('/passwordCategory/edit/',checkLoginUser, function(req, res, next) {

  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.body.id;
  var passwordCategory = req.body.passwordCategory;
  var update_passcat = passcatModule.findByIdAndUpdate(passcat_id.trim(),{passcat_name : passwordCategory})

  update_passcat.exec(function(err,doc){
   if(err) throw err;
   res.redirect('/passwordCategory')
  })
});

router.get('/add-new-category',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('addNewCategory', { title: 'Password Category Lists',error:'',success:'',loginUser:loginUser});
});

router.post('/add-new-category',checkLoginUser,[body('PasswordCategory','Enter Password Category Name').isLength({ min: 1 })], function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  const error = validationResult(req);
    if (!error.isEmpty()) {
      res.render('addNewCategory', { title: 'Password Category Lists',error: error.mapped(),success:'',loginUser:loginUser});
      console.log(error.mapped());
    }else{
      var passcatname = req.body.PasswordCategory;
      var passcatDetails = new passcatModule({
        passcat_name:passcatname,
      })
      passcatDetails.save((err,doc)=>{
        if(err) throw err;
        res.render('addNewCategory', { title: 'Password Category Lists',loginUser:loginUser,error:'',success:'Password Category Name inserted Successfully'});
      })
    }
});

router.get('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  getPasscatname.exec(function(err,data){
    if(err) throw err;
    res.render('add-new-password', { title: 'Add New Password',loginUser:loginUser,records:data,success:'' });
  })
});

router.post('/add-new-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var pass_cat = req.body.pass_cat;
  var passdetails = req.body.passdetails;
  var password_Detail = new passDetailModule({
    password_category: pass_cat,
    passwordDetails: passdetails,
  })

  password_Detail.save(function(err,doc){
    getPasscatname.exec(function(err,data){
      if(err) throw err;
      res.render('add-new-password', { title: 'Add New Password',loginUser:loginUser,records:data,success:"Password Details Inserted Successfully" });
    })
  })
  
});

router.get('/view-all-password',checkLoginUser, function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  getAllPassword.exec(function(err,data){
    if(err) throw err;
    res.render('view-all-password', { title: 'View Password Lists' ,loginUser:loginUser,records:data});
  })
});

router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');

});

module.exports = router;

