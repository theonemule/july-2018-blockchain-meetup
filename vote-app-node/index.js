const Web3 = require('web3');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();


var etherUrl = "ws://127.0.0.1:7545";
var contract = "0x30753e4a8aad7f8597332e813735def5dd395028";

var abi =  [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "voted",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "eventID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "message",
        "type": "string"
      }
    ],
    "name": "voteEvent",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "voter",
        "type": "address"
      },
      {
        "name": "candidate",
        "type": "uint256"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "entityAddress",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "name": "voteRecordExists",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "candidate",
        "type": "uint256"
      }
    ],
    "name": "voteCount",
    "outputs": [
      {
        "name": "votes",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

var httpPort = 8080;
var web3 = new Web3();
web3.setProvider(new web3.providers.WebsocketProvider(etherUrl));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    console.log(req.method + " " + req.url);
    next();
});

app.use(express.static("public"));

app.get("/ratings", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/ratings.html"));
});


contractInstance = new web3.eth.Contract(abi, contract);

app.get("/count/:candidate", function (req, res) {
	contractInstance.methods.voteCount(req.params.candidate).call(function(error, data) {
		//console.log(JSON.stringify(data));
		res.json(data);
	});
});

app.post("/vote", function (req, res) {
	
	if(!req.body.candidate || !req.body.account || req.body.account == ""){
		res.status(500).json("Need a candidate and account.");
		return;
	}
	
	contractInstance.once("voteEvent", function(err, data){
		//console.log(JSON.stringify(data));
		if (err){
			res.status(500).json(err);
		}else if(data.returnValues.eventID < 2){
			res.status(500).json(data.returnValues.message);
		}else{
			res.json({eventID: data.returnValues.eventID, messsage: data.returnValues.message});			
		}
	})
	
		
	contractInstance.methods.castVote(req.body.account, parseInt(req.body.candidate)).send({ from: req.body.account, gas:500000 }, function(error, transactionHash) {
		if (error){
			web3.eth.clearSubscriptions();
			res.status(500).json(error);
		}
	});			
});

app.listen(httpPort, function () {
	console.log("Listening on port " + httpPort);
});