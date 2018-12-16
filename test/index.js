var express = require('express');
var app = express();
var server = require('http').createServer(app);
var Web3 = require("web3");

app.use(express.static('.'));

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//这里导入你自己的ABI
var votingContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function","stateMutability":"nonpayable"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function","stateMutability":"view"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function","stateMutability":"view"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function","stateMutability":"nonpayable"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor","stateMutability":"nonpayable"}]);
//这里要替换成你自己的地址
let contractInstance = votingContract.at('0x130d22e81cea6ae5b8e3e60bb75c9a75d3e84b59');

app.get("/totalVotesFor", function(req, res) {
	var voteName = req.query.voteName;
	var vote_num=contractInstance.totalVotesFor.call(voteName).toString();
	console.log(vote_num);
	res.send(vote_num);
});

app.get("/voteForCandidate", function(req, res) {
	var voteName = req.query.voteName;
	contractInstance.voteForCandidate(voteName, {from: web3.eth.accounts[0]});
	var vote_num=contractInstance.totalVotesFor.call(voteName).toString();
	res.send(vote_num);
});

server.listen(3000);

// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:3000/index.html');
