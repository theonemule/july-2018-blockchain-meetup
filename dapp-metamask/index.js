var express = require('express');
var app = express();

var httpPort = 8080;

app.use(express.static("public"));

app.listen(httpPort, function () {
	console.log("Listening on port " + httpPort);
});