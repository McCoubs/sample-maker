 let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let passport = require('passport');
let forceSecure = require("force-secure-express");
let fileUpload = require('express-fileupload');
let jwt = require('express-jwt');
require('./src/api/models/users');
require('./src/api/models/samples');
require('./src/api/config/passport');

let app = express();
app.use(forceSecure([
  'sample-maker.herokuapp.com'
]));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(fileUpload());

// Create link to Angular build directory
let distDir = __dirname + '/dist/';
app.use(express.static(distDir));

// helper function to validate jwt tokens, pass to routers to use
let jwtAuth = jwt({
  secret: process.env.JWT_SECRET || 'LOCALSECRETTHISDOESNTMATTER',
  userProperty: 'payload'
});

 // helper to generate errors json
 let errorGenerator = function(err, status, message = '') {
   return {
     'message': message,
     'error': err !== undefined && err !== null ? err.name + ': ' + err.message : '',
     'status': status
   }
 };

// connect to mongoDB and bind errors to console
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true });
let connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', function callback () {
  // Initialize the app.
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App now running on port', port);
  });

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Catch unauthorised errors
  app.use(function (err, req, res, next) {
    if (err && err.name === 'UnauthorizedError') {
      res.status(401);
      res.json({'message' : err.name + ': ' + err.message});
    }
  });

  // app routes
  require('./src/api/controllers/user-routing')(app, jwtAuth, errorGenerator);
  require('./src/api/controllers/sample-routing')(app, connection, jwtAuth, errorGenerator);

  // Catch all other routes and return the index file
  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
  });
});