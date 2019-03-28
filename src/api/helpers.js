let jwt = require('jsonwebtoken');
let { body, param, validationResult } = require('express-validator/check');

// helper to generate errors response
let errorGenerator = function(res, err, status, message = '') {
  // create error obj
  let errorJson = {
    'message': message,
    'error': err !== undefined && err !== null ? err.name + ': ' + err.message : '',
    'status': status
  };
  // mutate and return the response
  return res.status(status).json(errorJson);
};

// helper validates auth-cookie exists and is valid for actions
let jwtAuth = function(req, res, next) {
  // retrieve token and return error on not found
  let token = getJWTHelper(req);
  if (!token) return localErrorHelper(res, null, 'authorization token invalid schema');

  // verify validity of token
  jwt.verify(token, process.env.JWT_SECRET || 'LOCALSECRETTHISDOESNTMATTER', (err, decodedToken) => {
    // return error if invalid
    if (err || !decodedToken) return localErrorHelper(res, err, 'you do not have permission for this action, please login');
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

/**
 * Helper function validates generic input from body
 * @param input name of input to validate
 * @returns chained validation functions
 */
let validateBody = function(input) {
  return body(input).exists().not().isEmpty().trim().escape();
};

/**
 * Helper function validates generic input from param
 * @param input name of input to validate
 * @returns chained validation functions
 */
let validateParam = function(input) {
  return param(input).exists().not().isEmpty().trim().escape();
};

// helper checks if express-validator found any issues
let validRequest = function(req, res, next) {
  // check req for input errors
  if (!validationResult(req).isEmpty()) {
    console.log(validationResult(req).array());
    return errorGenerator(res, null, 400, 'One or more inputs provided were improperly provided');
  }
  next();
};

// local method to help clean errors
let localErrorHelper = function (res, err, message) {
  // clear the auth cookie and response with error
  const inProd = process.env.NODE_ENV === 'production';
  res.cookies.set('authorization-token', '', { sameSite: true, httpOnly: inProd, secure: inProd });
  return errorGenerator(res, err, 401, message);
};

module.exports = {
  errorGenerator,
  jwtAuth,
  validateBody,
  validateParam,
  validRequest
};