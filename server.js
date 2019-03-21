let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let forceSecure = require('force-secure-express');
let fileUpload = require('express-fileupload');
let session = require('express-session');
let cookies = require('cookies');
let https = require('https');
let fs = require('fs');

// importing mongoose models
require('./src/api/models/users');
require('./src/api/models/samples');
require('./src/api/models/subscriptions');

// setup app components
let app = express();
app.use(session({
  secret: process.env.JWT_SECRET || 'LOCALSECRETTHISDOESNTMATTER',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: true,
    httpOnly: true
  }
}));
app.use(cookies.express([process.env.JWT_SECRET || 'LOCALSECRETTHISDOESNTMATTER']));
app.use(forceSecure([
  'sample-maker.herokuapp.com'
]));
app.use(bodyParser.json());
app.use(fileUpload());
app.enable('trust proxy');

// Create link to Angular build directory
let distDir = __dirname + '/dist/';
app.use(express.static(distDir));

// connect to mongoDB and bind errors to console
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { useNewUrlParser: true });
let connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', function callback () {

  let server = app.listen(process.env.PORT || 3000, function () {
    let port = server.address().port;
    console.log('App now running on port', port);
  });

  // allow headers
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // app routes
  require('./src/api/controllers/user-routing')(app);
  require('./src/api/controllers/sample-routing')(app, connection);

  // Catch all other routes and route through the index file
  app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
  });
});
