var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var five = require("../lib/johnny-five.js");
morse = require('./morsec.js'),
board = new five.Board();
var run;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

server.listen(3000);

board.on("ready", function() {
	console.log('open');

  var led = new five.Led(13);
  var queue = [];
  var timeUnit = 50;
  var locked = false;

  var kickoff = function() {
  	if (queue.length) {
  		locked = true;
  		process();
  	}
  };

  var process = function() {
  	if (queue.length) {
  		var letter = queue.shift();

  		if (letter === ' ') {
  			setTimeout(finish, 1 * timeUnit);
  		}
  		else if (letter === '.') {
  		  start(1);
  		}
  		else if (letter === '-') {
  			start(3);
  		}
  		else if (letter === '|') {
  			console.log('end of sentance');
  			locked = false;
  			kickoff();
  		}
  	}
  };

  var finish = function() {
  	led.off();
  	setTimeout(process, timeUnit);
  };

  var start = function(delay) {
    led.on();
    setTimeout(finish, delay * timeUnit);
  };

  run = function(str) {
  		str = str.replace(/"/g, ""); 
    	var code = morse(str);
    	for (var i = 0; i < code.length; i++) {
    			queue.push(code[i]);
    	};
    	queue.push('|');
    	if (!locked) {
    		kickoff();
    	}
  };
});

io.sockets.on('connection', function (socket) {
	socket.on('newstring', function(e) {
		if (board && e.isFinal) {
			run(e);
		}
	})
});


