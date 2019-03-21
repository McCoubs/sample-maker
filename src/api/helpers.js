let jwt = require('jsonwebtoken');

// helper to generate errors json
let errorGenerator = function(err, status, message = '') {
  return {
    'message': message,
    'error': err !== undefined && err !== null ? err.name + ': ' + err.message : '',
    'status': status
  }
};

let jwtAuth = function(req, res, next) {
  // retrieve token and return error on not found
  let token = getJWTHelper(req);
  if (!token) return res.status(401).json(errorGenerator(null, 401, 'authorization token invalid schema'));

  // verify validity of token
  jwt.verify(token, process.env.JWT_SECRET || 'LOCALSECRETTHISDOESNTMATTER', (err, decodedToken) => {
    // return error if invalid
    if (err || !decodedToken) return res.status(401).json(errorGenerator(err, 401, 'you do not have permission for this action, please login'));
    // pass payload along
    req.user = decodedToken;
    next();
  });
};

let getJWTHelper = function(req) {
  // get auth header
  const rawToken = req.cookies.get('authorization-token');
  if (!rawToken) return false;
  let authHeader = rawToken.split(' ');
  // check format of credentials
  if (authHeader.length === 2 && /^Bearer$/i.test(authHeader[0])) {
    // return token
    return authHeader[1];
  } else {
    return false;
  }
};

module.exports = {
  errorGenerator,
  jwtAuth
};