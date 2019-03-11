let mongoose = require('mongoose');
let stream = require('stream');
let Grid = require('gridfs-stream');
// crap monkey patch for mongoose error
eval(`Grid.prototype.findOne = ${Grid.prototype.findOne.toString().replace('nextObject', 'next')}`);

module.exports = function SampleRouting(app, conn, auth = () => {}, errorGenerator = () => {}) {
  let gfs = Grid(conn.db, mongoose.mongo);

  // route for sample upload TODO: add user id to the upload
  app.post('/api/samples', (req, res) => {
    let sample = req.files.sample;
    // create writestream for new file
    let writestream = gfs.createWriteStream({ filename: sample.name, content_type: sample.mimetype });

    // create readable from given file, pipe into db
    let readable = new stream.Readable();
    readable.push(sample.data);
    readable.push(null);
    readable.pipe(writestream);

    // on successful write, return data
    writestream.on('close', function (file) {
      res.json({message: 'File Created: ' + file.filename + ' with id: ' + file._id, _id: file._id});
    });
    // catch error and return
    writestream.on('error', function() {
      res.status(500).json(errorGenerator(null, 500, 'Error storing file'));
    });
  });

  // get metadata for a single sample
  app.get('/api/samples/:id', (req, res) => {
    // attempt to find file
    gfs.findOne({ _id: req.params.id }, (err, file) => {
      // on error, generate error
      if (err || !file) return res.status(500).json(errorGenerator(err, 500, 'no sample found with id: ' + req.params.id));
      res.json(file);
    });
  });

  // get actual music file for sample
  app.get('/api/samples/:id/download', (req, res) => {
    // check existence of file
    gfs.findOne({ _id: req.params.id }, (err, file) => {
      // if no file
      if (err || !file) return res.status(500).json(errorGenerator(err, 500, 'no sample found with id: ' + req.params.id));

      // set the proper content type
      res.set('Content-Type', file.contentType);
      // create and pipe file to response
      let readstream = gfs.createReadStream({ _id: req.params.id });
      readstream.pipe(res);
    });
  });

  // Route for getting all the files
  // TODO: make routes for search and shit
  app.get('/api/samples', (req, res) => {
    // get all files
    gfs.files.find({}).toArray((err, files) => {
      // return error on error
      if (err || !files) res.status(500).json(errorGenerator(err, 500, 'Server ERROR: could not process file upload'));
      res.json(files);
    });
  });
};
