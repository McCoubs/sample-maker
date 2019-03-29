let mongoose = require('mongoose');
let User = mongoose.model('User');
let Sample = mongoose.model('Sample');
let Subscription = mongoose.model('Subscription');
let { jwtAuth, errorGenerator, validateBody, validateParam, validRequest } = require('../helpers');

const inProd = process.env.NODE_ENV === 'production';

module.exports = function UserRouting(app) {

  app.post('/api/register', [
    validateBody('email').isEmail(),
    validateBody('password').isLength({min: 6}),
    validateBody('name').optional(),
    validRequest
  ], (req, res) => {
    User.findOne({email: req.body.email}, (err, foundUser) => {
      if (err) return errorGenerator(res, err, 500, 'Error creating new user with email: ' + req.body.email);
      if (foundUser) return errorGenerator(res, null, 400, 'A user already exists with that email');

      let user = new User();
      // set new user info
      user.name = req.body.name;
      user.email = req.body.email;
      user.setPassword(req.body.password);

      // attempt to save new user; on error => error else => return token
      user.save(function(err) {
        if (err) return errorGenerator(res, err, 500, 'Error creating new user with email: ' + req.body.email);
        // add token to cookies and respond with token
        const generatedJWT = user.generateJwt();
        res.cookies.set('authorization-token', 'Bearer ' + generatedJWT, { sameSite: true, httpOnly: inProd, secure: inProd });
        res.json({'token' : generatedJWT});
      });
    });
  });

  app.post('/api/login', [validateBody('email').isEmail(), validateBody('password').isLength({min: 6}), validRequest], (req, res) => {
    // try to find user by email
    User.findOne({ email: req.body.email }, (err, user) => {
      // return error on error or no user
      if (err || !user) return errorGenerator(res, err, 500, 'Cannot find user with provided email');
      // Return if password is wrong
      if (!user.validPassword(req.body.password)) {
        return errorGenerator(res, err, 401, 'Failed to login. Email and/or password are incorrect');
      }
      // add token to cookies and respond with token
      const generatedJWT = user.generateJwt();
      res.cookies.set('authorization-token', 'Bearer ' + generatedJWT, { sameSite: true, httpOnly: inProd, secure: inProd });
      res.json({'token' : generatedJWT});
    });
  });

  app.post('/api/logout', jwtAuth, (req, res) => {
    // empty cookie and respond
    res.cookies.set('authorization-token', '', { sameSite: true, httpOnly: inProd, secure: inProd });
    res.json({'success' : true});
  });

  app.get('/api/users/:id', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    User.findById(req.params.id).exec((err, user) => {
      if (err || !user) return errorGenerator(res, err, 500, 'no user found with id: ' + req.params.id);
      res.json(user);
    });
  });

  app.get('/api/user/:id/samples', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    Sample.find({ author: req.params.id }, (err, samples) => {
      if (err) return errorGenerator(res, err, 500, 'Could not find samples for user: ' + req.params.id);
      res.json(samples);
    });
  });

  // TODO: subscribe and unsubscribe
  app.post('/api/subscribe', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    // Subscription.insertOne({follower: id1, followee: id2});
  });

  app.post('/api/unsubscribe', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    // Subscription.deleteOne({follower: id1, followee: id2});
  });

  app.get('/api/user/:id/subscribers', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    Subscription.find({followee: req.params.id}, (err, subscribers) => {
      if (err) return errorGenerator(res, err, 500, 'Could not find subscribers for user: ' + req.params.id);
      res.json(subscribers);
    });
  });

  app.get('/api/user/:id/subscriptions', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    Subscription.find({follower: req.params.id}, (err, subscriptions) => {
      if (err) return errorGenerator(err, 500, 'Could not find subscriptions for user: ' + req.params.id);
      res.json(subscriptions);
    });
  });

  // TODO: implement FE and BE deletion routing
  app.delete('/api/users/:id', (req, res) => {

  });
};
