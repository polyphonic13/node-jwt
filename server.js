var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('supersecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res) {
	res.send('hi, api at + http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
	var user = new User({
		name: 'Jane Doe',
		password: '01234',
		admin: true
	});
	
	user.save(function(err) {
		if(err) throw err;
		console.log('User saved successfully');
		res.json({ success: true });
	});
	
});

var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
	res.json({ message: 'NNNNNNNN api' });
});

apiRouter.get('/users', function(req, res) {
	User.find({}, function(err, data) {
		res.json(data);
	});
});

app.use('/api', apiRouter);


app.listen(port);
