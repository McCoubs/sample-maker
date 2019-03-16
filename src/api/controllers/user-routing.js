let mongoose = require('mongoose');
let User = mongoose.model('User');
let Sample = mongoose.model('Sample');
let Subscription = mongoose.model('Subscription');
let { errorGenerator, jwtAuth } = require('../helpers');

module.exports = function UserRouting(app) {

  app.post('/api/register', (req, res) => {
    let user = new User();
    // set new user info
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    // attempt to save new user; on error => error else => return token
    user.save(function(err) {
      if (err) return res.status(500).json(errorGenerator(err, 500, 'Error creating new user with email: ' + req.body.email));
      res.json({'token' : user.generateJwt()});
    });
  });

  app.post('/api/login', (req, res) => {
    // try to find user by email
    User.findOne({ email: req.body.email }, (err, user) => {
      // return error on error or no user
      if (err || !user) return res.status(500).json(errorGenerator(err, 500, 'Cannot find user with provided email'));
      // Return if password is wrong
      if (!user.validPassword(req.body.password)) {
        return res.status(401).json(errorGenerator(err, 401, 'Failed to login. Email and/or password are incorrect'));
      }
      res.json({'token' : user.generateJwt()});
    });
  });

  app.get('/api/users/:id', (req, res) => {
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
      // Otherwise continue
      User.findById(req.params.id).exec((err, user) => {
        if (err || !user) return res.status(500).json(errorGenerator(err, 500, 'no user found with id: ' + req.params.id));
        res.status(200).json(user);
      });
    }
  });

  app.get('/api/user/:id/samples',jwtAuth, (req, res) => {
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
      Sample.find({author: req.params.id}).toArray((err, samples) =>{
        if (err) return res.status(500).json(errorGenerator(err,500, 'Could not find samples for user: ' + req.params.id));
        res.json(samples);
      });
    }
  });

  app.post('/api/subscribe',jwtAuth, (req, res) => {
    // Subscription.insertOne({follower: id1, followee: id2});
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
    }
  });

  app.post('/api/unsubscribe',jwtAuth, (req, res) => {
    // Subscription.deleteOne({follower: id1, followee: id2});
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
    }
  })

  app.get('/api/user/:id/subscribers',jwtAuth, (req, res) => {
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
      Subscription.find({followee: req.params.id}).toArray((err, subscribers) =>{
        if (err) return res.status(500).json(errorGenerator(err,500, 'Could not find subscribers for user: ' + req.params.id));
        res.json(subscribers);
      });
    }
  });

  app.get('/api/user/:id/subscriptions',jwtAuth, (req, res) => {
    if (!req.params.id) {
      return res.status(400).json(errorGenerator(null, 400, 'Invalid request, ID not provided'));
    } else {
      Subscription.find({follower: req.params.id}).toArray((err, subscriptions) =>{
        if (err) return res.status(500).json(errorGenerator(err,500, 'Could not find subscriptions for user: ' + req.params.id));
        res.json(subscriptions);
      });
    }
  });

  // TODO: implement FE and BE deletion routing
  app.delete('/api/users/:id', (req, res) => {

  });
};
