var express = require("express");
var router = express.Router();
var passport = require("../config/passport");
var Tutor = require("../models/tutor");

// Home
router.get("/", function (req, res) {
    var errors = req.flash("errors")[0] || {};
    Tutor.find({})
        .exec(function(err, tutors){
            if(err) return res.json(err);
            res.render("home/carousel", {tutors:tutors, errors:errors });
        });
});

// Login
router.get("/login", function (req, res) {
	var username = req.flash("username")[0];
	var errors = req.flash("errors")[0] || {};
	
	// rendering 경로.
	res.render("home/signIn", {
		username: username,
		errors: errors
	});
});

// Post Login
router.post("/login",
	function (req, res, next) {
		var errors = {};
		var isValid = true;

		if (!req.body.username) {
			isValid = false;
			errors.username = "Username is required!";
		}
		if (!req.body.password) {
			isValid = false;
			errors.password = "Password is required!";
		}
		if (isValid) {
			next();
		} else {
			req.flash("errors", errors);
			res.redirect("/login");
		}
	},
	
	// 로그인 성공시, carousel로 이동.
	passport.authenticate("local-login", {
		successRedirect: "/",
		failureRedirect: "home/login",
	
	}));

// Logout
router.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

module.exports = router;
