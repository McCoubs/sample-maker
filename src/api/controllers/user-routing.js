let mongoose = require('mongoose');
let User = mongoose.model('User');
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
    // If no user ID exists in the JWT return a 401
    if (!req.params.id) {
      return res.status(401).json(errorGenerator(null, 401, 'UnauthorizedError: private profile'));
    } else {
      // Otherwise continue
      User.findById(req.params.id).exec((err, user) => {
        if (err || !user) return res.status(500).json(errorGenerator(err, 500, 'no user found with id: ' + req.params.id));
        res.status(200).json(user);
      });
    }
  });

  // TODO: implement FE and BE deletion routing
  app.delete('/api/users/:id', (req, res) => {

  });
};
