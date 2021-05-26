var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

var Users = [ { id: 'hi', password: 'hi' }, { id: 'gh', password: 'gh' } ];

app.get('/signup', function(req, res){res.render('signup');});

app.post('/signup', function(req, res){UserExists = false;
	Users.filter(function(user){
		if(user.id === req.body.id){
			UserExists = true;
		}
	});
	if (UserExists) {
		res.render('signup', {message: "User Already Exists! Login or choose another user id"});
	} else {
		var newUser = {id: req.body.id, password: req.body.password};
		Users.push(newUser);
		req.session.user = newUser;
		res.redirect('/protected_page');
	}});

app.get('/login', function(req, res){ res.render('login');});

app.post('/login', function(req, res){
	var valid = false;
	var user;
	Users.filter(function(storedUser){
		if(storedUser.id === req.body.id && storedUser.password === req.body.password){
			valid = true;
			user = {id: req.body.id, password: req.body.password};
		}
	});

	if (valid) {
		console.log("user: " + user.id + " logged in.");
		req.session.user = user;
		res.redirect('/protected_page');
	} else {
		res.render('login', {message: "Invalid credentials!", invalid: true});
	}});

app.get('/logout', function(req, res){
	if (req.session.user) {
		var id = req.session.user.id;
		req.session.destroy(function(){
			console.log("user: " + id + " logged out.");
		});
	}
	res.redirect('/login');});

app.get('/failed_attempt', function(req, res){ res.render('failed_attempt');});

function checkSignIn(req, res, next){	
	if(req.session.user){
		console.log("successful attempt to view webpage");
		next();
	} else {
		console.log("failed attempt to view webpage");
		res.redirect('/failed_attempt');// add failed login page
	}}

app.get('/protected_page', checkSignIn, function(req, res, next){
	console.log("loading protected page");
	res.render('protected_page', {id: req.session.user.id})});

app.listen(3000, () => (console.log("Listening on port 3000")));