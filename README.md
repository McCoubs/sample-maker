# Sample Maker

## Team Members
Name | UTorID
--- | ---
Ajiteshwar Rai | raiajite
Derek Nguyen | nguy1524
Spencer McCoubrey | mccoubr5

## Decription of Application
Sampling other works has been a staple of the music industry for years, and this application hopes to grow the collaborative spirit of music by allowing anyone to create and use samples.

Samples can be created using the on site instrument emulation, and can be saved and uploaded. Once uploaded the sample will be available to be downloaded by anyone.
After creating an account with the site, the user will be have their own page where they can view all the music they have created, and button that will lead them to the create page where they can use the instruments provided by the site to create and save short pieces of music.

Once the music has been created it will be saved to the database and be available for viewing in the browse page. On this page, the user can check out all of the samples created by the different users of the site. The samples can be viewed and sorted according to what users want to browse (eg. genre, length, popularity). And you can also subscribe to particular users you enjoy listening to. Once you have a sample you would like to use, just hit the download button and you're finished. The site will also keep track of which songs you have previously downloaded, so you'll never forget where you got something from.

## Key Features for Beta

### User Features
- Sample creation/saving/downloading
- Sample publishing to allow other users to interact with and listen to samples (public versus private samples)
- User creation, login, authentication
- Home page, search options
- User profiles

### Development Feautures
- Framework and production environment running
- Models and relationships created in database
- APIs running and secure

## Additional Features for Final
- Sample uploading
- User subscriptions
- Sample description pages
- Sample editing

## Description of Technologies Used
- Angular6: used for all front end views. Chosen as its a very easy to learn framework with wide support, and it follows the taught principles of separating UI and API functionality within front end code. Easily manageable, deployable and produces clean code structure.
- MongoDB: used for all database storage. Chosen because easily integrated, widely supported, great documentation and support for storing files efficiently.
- Heroku: used for deployment. Chosen as its free, provides easy hosting, wide support, integrates well with our chosen MEAN stack and good documentation.
- Web Audio API: used for audio integrations. Manipulations and interactions in new browsers. Will allow us to possibly implement more advanced featuires.

## Technical Challenges

1. Integrating audio properly into the browser
2. Managing audio-file upload, storage and creation
3. Recording and saving instruments and samples
4. Managing user -> object and database relations to enable quick and efficent lookups, inserts, updates, etc.
5. Learning and developing with new frameworks, technologies and being able to integrate them all well.
