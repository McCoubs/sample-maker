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

  app.post('/api/logout', (req, res) => {
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

  app.get('/api/user/:follower_id/subscribers/:followee_id', [validateParam('follower_id'), validateParam('followee_id'), validRequest, jwtAuth], (req, res) => {
    let follower_id = req.params.follower_id;
    let followee_id = req.params.followee_id;
    Subscription.findOne({follower: follower_id, followee: followee_id}, {follower: 1}).populate('follower').exec((err, sub) => {
      if (err) return errorGenerator(res, err, 500, 'Error finding relationship does not exist between: ' + follower_id + ' and ' + followee_id);
      res.json(sub);
    });
  });

  app.post('/api/user/:follower_id/subscribers/:followee_id', [validateParam('follower_id'), validateParam('followee_id'), validRequest, jwtAuth], (req, res) => {
    let follower_id = req.params.follower_id;
    let followee_id = req.params.followee_id;
    // check signed in user is one creating relationship
    if (req.user._id !== follower_id) return errorGenerator(res, null, 403, 'Unauthorized: cannot sub for another user');
    // check for pre-existing relationship
    Subscription.findOne({follower: follower_id, followee: followee_id}, (err, foundSub) => {
      if (err) return errorGenerator(res, err, 500, 'Could not subscribe to user: ' + followee_id);
      if (foundSub) return res.json(foundSub);
      // otherwise create new relationship
      Subscription.create({follower: follower_id, followee: followee_id}, (err, createdSub) => {
        if (err || !createdSub) return errorGenerator(res, err, 500, 'Could not subscribe to user: ' + followee_id);
        res.json(createdSub);
      });
    });
  });

  app.delete('/api/user/:follower_id/subscribers/:followee_id', [validateParam('follower_id'), validateParam('follower_id'), validRequest, jwtAuth], (req, res) => {
    let follower_id = req.params.follower_id;
    let followee_id = req.params.followee_id;
    // check signed in user is one deleting  relationship
    if (req.user._id !== follower_id) return errorGenerator(res, null, 403, 'Unauthorized: cannot unsub for another user');
    Subscription.deleteOne({follower: follower_id, followee: followee_id}, (err) => {
      if (err) return errorGenerator(res, err, 500, 'Could not unsubscribe to user: ' + followee_id);
      res.json('successfully unsubscribed from: ' + followee_id);
    });
  });

  app.get('/api/user/:id/subscriptions', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    Subscription.find({follower: req.params.id}, {followee: 1}).populate('followee').exec((err, subscribers) => {
      if (err) return errorGenerator(res, err, 500, 'Could not find subscriptions for user: ' + req.params.id);
      res.json(subscribers);
    });
  });

  app.get('/api/user/:id/subscribers', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    Subscription.find({followee: req.params.id}, {follower: 1}).populate('follower').exec((err, subscribers) => {
      if (err) return errorGenerator(res, err, 500, 'Could not find subscribers for user: ' + req.params.id);
      res.json(subscribers);
    });
  });

  app.get('/api/users/', [validRequest, jwtAuth], (req, res) => {
    let searchParams = {};
    if(req.query.name) searchParams = {name: {'$regex': new RegExp(req.query.name, "i")}};
    User.find(searchParams).exec((err, users) => {
      if (err) return errorGenerator(res, err, 500, 'Could not find user');
      res.json(users);
    });
  });

  // TODO: implement FE and BE deletion routing
  app.delete('/api/users/:id', (req, res) => {

  });
};
