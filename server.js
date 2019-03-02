let environment = require('./src/environments/environment');

let express = require('express');
let bodyParser = require('body-parser');
let mongodb = require('mongodb');
let ObjectID = mongodb.ObjectID;

let app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
let distDir = __dirname + '/dist/';
app.use(express.static(distDir));

// Create a database letiable outside of the database connection callback to reuse the connection pool in your app.
let db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(environment.mongodbURI, function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log('Database connection ready');

  // Initialize the app.
  let server = app.listen(environment.port, function () {
    let port = server.address().port;
    console.log('App now running on port', port);
  });
});

// app routes
// TODO: fix this example terrible error handler
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({'error': message});
}

// TODO: actual routes, probably move to their own files (object constructors around node app)
app.post('', function(req, res) {});
app.get('', function(req, res) {});
app.put('', function(req, res) {});
app.delete('', function(req, res) {});
