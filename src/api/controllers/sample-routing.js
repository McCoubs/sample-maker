let mongoose = require('mongoose');
let Sample = mongoose.model('Sample');
let stream = require('stream');
let Grid = require('gridfs-stream');
let { jwtAuth, errorGenerator, validateParam, validRequest } = require('../helpers');
let { body, query } = require('express-validator/check');
// crap monkey patch for mongoose error
eval(`Grid.prototype.findOne = ${Grid.prototype.findOne.toString().replace('nextObject', 'next')}`);

module.exports = function SampleRouting(app, conn) {
  let gfs = Grid(conn.db, mongoose.mongo);

  // route for sample upload
  app.post('/api/samples', [
    body('tags').optional().trim().escape(),
    body('name').optional().trim().escape(),
    validRequest,
    jwtAuth
  ], (req, res) => {
    let sampleFile = req.files.sample;
    // file must be provided and must be an audio file
    if (!sampleFile) {
      return errorGenerator(res, null, 400, 'Audio sample not provided');
    } else if (!sampleFile.mimetype.startsWith('audio/')) {
      return errorGenerator(res, null, 400, 'File provided is not an audio file');
    }

    // create writestream for new file
    let writestream = gfs.createWriteStream({ filename: sampleFile.name, content_type: sampleFile.mimetype });

    // create readable from given file, pipe into db
    let readable = new stream.Readable();
    readable.push(sampleFile.data);
    readable.push(null);
    readable.pipe(writestream);

    // on successful write
    writestream.on('close', function (file) {
      // create a sample with given data TODO: add genres, tags, etc....
      Sample.create({ name: req.body.name || file.filename, author: req.user._id, file_id: file._id, tags: req.body.tags }, (err, sample) => {
        // on error need to delete file and respond with error
        if (err || !sample) {
          gfs.remove({ _id: file._id }, function (err) {
            return errorGenerator(res, err, 500, 'Error creating sample');
          });
        }
        // else respond with created sample
        res.json(sample);
      });
    });
    // on write error
    writestream.on('error', () => {
      return errorGenerator(res, null, 500, 'Error storing sample');
    });
  });

  // get data for single sample
  app.get('/api/samples/:id', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    // attempt to find sample
    Sample.findOne({ _id: req.params.id }, (err, sample) => {
      // on error, generate error
      if (err || !sample) return errorGenerator(res, err, 500, 'no sample found with id: ' + req.params.id);
      res.json(sample);
    });
  });

  // get actual music file for sample
  app.get('/api/samples/:id/audio', [validateParam('id'), validRequest, jwtAuth], (req, res) => {
    // find sample
    Sample.findOne({ _id: req.params.id }, (err, sample) => {
      // if no sample, respond with error
      if (err || !sample) return errorGenerator(res, err, 500, 'no sample found with id: ' + req.params.id);

      // create and pipe file to response
      let readstream = gfs.createReadStream({ _id: sample.file_id });
      readstream.pipe(res);
    });
  });

  // Route for getting all the samples
  app.get('/api/samples', [
    query('tags').optional().trim().escape(),
    query('genres').optional().trim().escape(),
    query('author').optional().trim().escape(),
    validRequest,
    jwtAuth
  ], (req, res) => {
    // parse limit and skip params
    let limit = parseInt(req.query.limit) || 0;
    let skip = parseInt(req.query.skip) || 0;

    let paramArray = [];
    // parse and add queries for tags, genres and author
    if (req.query.tags) paramArray.push({tags: req.query.tags});
    if (req.query.genres) paramArray.push({genres: req.query.genres});
    if (req.query.author && mongoose.Types.ObjectId.isValid(req.query.author)) paramArray.push({author: req.query.author});
    let searchParams = (paramArray.length > 0) ? {$or: paramArray} : {};

    // find all samples matching the given queries
    Sample.find(searchParams).sort({createdAt: -1}).skip(skip).limit(limit).exec((err, samples) => {
      // return error on error
      if (err || !samples) return errorGenerator(res, err, 500, 'Server ERROR: could not get samples');
      res.json(samples);
    });
  });
};
