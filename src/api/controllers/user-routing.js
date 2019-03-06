let passport = require('passport');
let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports = function UserRouting(app, auth = () => {}, errorGenerator = () => {}) {

  app.post('/api/register', function(req, res) {
    let user = new User();

    user.name = req.body.name;
    user.email = req.body.email;

    user.setPassword(req.body.password);

    user.save(function(err) {
      res.json({'token' : user.generateJwt()});
    });
  });

  app.post('/api/login', function(req, res) {
    passport.authenticate('local', function(err, user, info) {
      // If Passport throws/catches an error
      if (err) {
        res.status(404).json(errorGenerator(err, 404));
        return;
      }

      // If a user is found
      if (user) {
        res.json({'token' : user.generateJwt()});
      } else {
        // If user is not found
        res.status(401).json(info);
      }
    })(req, res);
  });

  app.get('/api/users/:id', function(req, res) {
    // If no user ID exists in the JWT return a 401
    if (!req.params.id) {
      res.status(401).json(errorGenerator(null, 401, 'UnauthorizedError: private profile'));
    } else {
      // Otherwise continue
      User.findById(req.params.id).exec(function(err, user) {
        if (err || user === null) return res.status(500).json(errorGenerator(err, 401, 'no user found with id: ' + req.params.id));
        res.status(200).json(user);
      });
    }
  });

  app.delete('/api/users/:id', function(req, res) {

  });
};