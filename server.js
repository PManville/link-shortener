import config from './config';
import sassMiddleware from 'node-sass-middleware';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import assert from 'assert';

const server = express();
let db;
const mongo = 'mongodb://localhost:27017';

MongoClient.connect(mongo, (err, client) => {
	assert.equal(null, err);
	db = client.db("shortener");
});


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
	extended: true
}))

server.use(sassMiddleware({
	src: path.join(__dirname, 'sass'),
	response: false, 
	outputStyle: 'extended',
	dest: path.join(__dirname, 'public')
}));


server.set('view engine', 'ejs');

server.get('/',(req,res) => {
	return res.render('index');
});


server.get('/all',(req,res) => {

		db.collection('urls')
			.find({})
			.toArray()
			.then(data => {
				res.send(data);
			})
			.catch(error => {
		       console.error(error);
		       res.status(404).send('Bad Request');
		    });

})

server.post('/link/shorten',(req,res) => {

	var shortcode = Math.random().toString(36).substring(2,8);

	db.collection('urls')
		.find({ originalurl:req.body.url })
		.toArray()
		.then((result) => {
			if(result[0] != undefined){
				res.send(result[0])
			}
			else {
				db.collection('urls')
					.insertOne({
						originalurl: req.body.url,
						shortcode: shortcode,
						redirectCount: 0,
						startDate: new Date()
					})
					.then((result) => {
						res.send(result.ops[0])
					})
					.catch(error => {
				       console.error(error);
				       res.status(404).send('Bad Request');
				    });
			}
		})
		.catch(error => {
	       console.error(error);
	       res.status(404).send('Bad Request');
	    });

});

server.get('/link/:link',(req,res) => {

	db.collection('urls')
		.update({ shortcode: req.params.link}, { $inc: {redirectCount: 1}, $set: {lastSeenDate: new Date() }})
		
	db.collection('urls')
		.find({ shortcode: req.params.link})
		.toArray()
		.then(data => {

			res.redirect(data[0].originalurl);
		})
		.catch(error => {
	       console.error(error);
	       res.status(404).send('Bad Request');
	    });
});

server.get('/link/:link/info',(req,res) => {

	db.collection('urls')
		.find({ shortcode: req.params.link})
		.toArray()
		.then(data => {
			res.send(data[0])
		})
		.catch(error => {
	       console.error(error);
	       res.status(404).send('Bad Request');
	    });
}); 

server.use(express.static('public'));

server.listen(config.port, config.host, () => {
	console.info('Express listening on port ', config.port);
});
