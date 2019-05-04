var express  = require("express");
var router   = express.Router();
var User     = require("../models/User");
var util     = require("../util");

// Index (불필요 코드, 로직상 없애면 오류 발생)
router.get("/", util.isLoggedin, function(req, res){
  User.find({})
  .sort({username:1})
  .exec(function(err, users){
    if(err) return res.json(err);
    res.render("users/index", {users:users});
  });
});


// signup 회원가입 
router.get("/new", function(req, res){
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("users/new", { user:user, errors:errors });
});

// create (불필요 코드, 로직상 없애면 오류 발생)
router.post("/", function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/signUp.html");
    }
    res.redirect("/users"); //사용자 목록
  });
});


module.exports = router;

// private functions
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
