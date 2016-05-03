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
app.set('secret', config.secret);

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
		if(err) {
			throw err;
		}
		console.log('User saved successfully');
		res.json({ success: true });
	});
	
});

var apiRouter = express.Router();

apiRouter.post('/authenticate', function(req, res) {
	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if(err) {
			throw err;
		}
		if(!user) {
			res.json({ success: false, message: 'Authentication failed: user not found.'});
		} else {
			if(user.password !== req.body.password) {
				res.json({ success: false, message: 'Authentication failed: wrong password.' });
			} else {
			
				var token = jwt.sign(user, app.get('secret'), {
					expiresIn: 86400 // expires in 24 hours
		        });
			
				res.json({
					success: true,
					message: 'Authentication success.',
					token: token
				});
			}
		}
	});
});

apiRouter.use(function(req, res, next) {
	
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	
	console.log('token = ' + token);
	if(token) {
		jwt.verify(token, app.get('secret'), function(err, decoded) {
			if(err) {
				return res.json({ success: false, message: 'Authentication failed: invalid token' });
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

apiRouter.get('/', function(req, res) {
	res.json({ message: 'NNNNNNNN api' });
});

apiRouter.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		if(err) {
			throw err;
		}
		res.json(users);
	});
});


app.use('/api', apiRouter);


app.listen(port);
