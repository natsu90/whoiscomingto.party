const functions = require('firebase-functions');
const express = require('express');

const app = express();

app.use(express.static(__dirname + '/models'))

app.get('/', (req, res) => { 
	res.sendFile( __dirname + '/views/index.html'); 
});

app.get('/enroll', (req, res) => {
	res.sendFile( __dirname + '/views/enroll.html');
})

exports.app = functions.https.onRequest(app);
