let mongoose = require('mongoose');
let Sample = mongoose.model('Sample');
let stream = require('stream');
let Grid = require('gridfs-stream');
let { errorGenerator, jwtAuth } = require('../helpers');
// crap monkey patch for mongoose error
eval(`Grid.prototype.findOne = ${Grid.prototype.findOne.toString().replace('nextObject', 'next')}`);

module.exports = function SampleRouting(app, conn) {
  let gfs = Grid(conn.db, mongoose.mongo);

  // route for sample upload
  app.post('/api/samples', jwtAuth, (req, res) => {
    let sampleFile = req.files.sample;
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
      Sample.create({ name: req.body.name || file.filename, author: req.user._id, file_id: file._id }, (err, sample) => {
        // on error need to delete file and respond with error
        if (err || !sample) {
          gfs.remove({ _id: file._id }, function (err) {
            if (err) return res.status(500).json(errorGenerator(err, 500, 'Error creating sample'));
            return res.status(500).json(errorGenerator(err, 500, 'Error creating sample'));
          });
        }
        // else respond with created sample
        res.json(sample);
      });
    });
    // on write error
    writestream.on('error', function() {
      return res.status(500).json(errorGenerator(null, 500, 'Error storing sample'));
    });
  });

  // get data for single sample
  app.get('/api/samples/:id', jwtAuth, (req, res) => {
    // attempt to find sample
    Sample.findOne({ _id: req.params.id }, (err, sample) => {
      // on error, generate error
      if (err || !sample) return res.status(500).json(errorGenerator(err, 500, 'no sample found with id: ' + req.params.id));
      res.json(sample);
    });
  });

  // get actual music file for sample
  app.get('/api/samples/:id/audio', jwtAuth, (req, res) => {
    // find sample
    Sample.findOne({ _id: req.params.id }, (err, sample) => {
      // if no sample, respond with error
      if (err || !sample) return res.status(500).json(errorGenerator(err, 500, 'no sample found with id: ' + req.params.id));

      // create and pipe file to response
      let readstream = gfs.createReadStream({ _id: sample.file_id });
      readstream.pipe(res);
    });
  });

  // Route for getting all the samples TODO: make routes for search and shit
  app.get('/api/samples', jwtAuth, (req, res) => {
    // get all samples
    Sample.find({}, (err, samples) => {
      // return error on error
      if (err || !samples) return res.status(500).json(errorGenerator(err, 500, 'Server ERROR: could not get samples'));
      res.json(samples);
    });
  });
};
