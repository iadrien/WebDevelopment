// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");

var privateRooms = {};
var users = {};
var date = new Date();

var chatrooms={};
chatrooms["default"] = {};
chatrooms["default"]["owner"]="admin";
chatrooms["default"]["members"]= new Array();
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.

	socket.on('new_user', function(data){

		if(users[data["username"]]==null){
			socket.username = data["username"];
			socket.room = "default";
			socket.join(socket.room);

			users[socket.username] = socket.id;
			chatrooms[socket.room]["members"].push(socket.username);

			//socket.emit('update_member',{roomname:socket.room});

			var vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
    		return chatrooms[socket.room]["members"][key];
			});
			var updatedlist = JSON.stringify(vals);
			date = new Date();
			var msg = socket.username + " has joined the default chatroom! " + date.getHours() + ":" + date.getMinutes();

			io.sockets.connected[socket.id].emit('loggedin',{loggedin:true});
			io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
			io.sockets.in(socket.room).emit('update_member',updatedlist);

		}else{

			var newuser = false;
			var msg= "Username already taken!";
			io.sockets.connected[socket.id].emit('new', {success:newuser, message: msg})
		}
	});

	socket.on('privatemessage', function(data){
		var receiver = data["to"];
		var info = "Private message from: " + socket.username;
		var info2 = "Private message to: " + receiver;
		var msg = data["pmessage"];
		console.log("private message:" + socket.username + " to " + receiver);
		if(users[receiver]!=null){
			if(socket.room==io.sockets.connected[users[receiver]].room){

				io.sockets.connected[users[receiver]].emit("message_to_client",{private: true,message:info});
				io.sockets.connected[users[receiver]].emit("message_to_client",{private: true,message:msg});
				io.sockets.connected[socket.id].emit("message_to_client",{private: true,message:info2});
				io.sockets.connected[socket.id].emit("message_to_client",{private: true,message:msg});
			}else{
				io.sockets.connected[socket.id].emit('p',{message:"Can not find the user in the same room!"});
			}
		}else{
			io.sockets.connected[socket.id].emit('p',{message:"Can not find the user in the same room!"});
		}


	});








	socket.on('create', function(data){

		if(chatrooms[data["chatroom"]]!=null || privateRooms[data["chatroom"]!=null]){
			var create = false;
			var msg = "Room already exists!";
			io.sockets.connected[socket.id].emit('new',{success:create, message: msg});
		}else{
			if(data["public"]==true){
				chatrooms[data["name"]]={};
				chatrooms[data["name"]]["owner"] = socket.username;
				chatrooms[data["name"]]["members"] = new Array();
				chatrooms[data["name"]]["banned"] = new Array();
				//chatrooms[data["name"]]["members"].push(socket.username);
				var create = true;
				var msg = "Room Created!";
				io.sockets.connected[socket.id].emit('new',{success:create, message: msg});
			}else{
				privateRooms[data["name"]]={};
				privateRooms[data["name"]]["owner"] = socket.username;
				privateRooms[data["name"]]["password"] = data["password"];
				privateRooms[data["name"]]["members"] = new Array();
				privateRooms[data["name"]]["banned"] = new Array();
				//privateRooms[data["name"]]["members"].push(socket.username);
				var create = true;
				var msg = "Private Room Created!";
				io.sockets.connected[socket.id].emit('new',{success:create, message: msg});
			}
		}
	});

	socket.on('join_public', function(data){
		var index1 = 0;
		var leave =0;
		if(privateRooms[socket.room]==null&&chatrooms[socket.room]==null){
			index1 = -1;
		}else{
			if(privateRooms[socket.room]==null){
				index1= chatrooms[socket.room]["members"].indexOf(socket.username);
				leave = 1;
			}else{
				index1 = privateRooms[socket.room]["members"].indexOf(socket.username);
				leave =2
			}
		}
		//var index2= privateRooms[socket.room]["members"].indexOf(socket.username)
		var vals;
		if(index1 > -1&&leave>0){
			if(leave==1){
				chatrooms[socket.room]["members"].splice(index1,1);
				vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
					return chatrooms[socket.room]["members"][key];
				});
			}else{
				privateRooms[socket.room]["members"].splice(index1,1);
				vals = Object.keys(privateRooms[socket.room]["members"]).map(function(key) {
					return privateRooms[socket.room]["members"][key];
				});
			}
		}

		// Join in new room
		socket.room = data["chatroom"];
		var banneduser = 0;
		if(chatrooms[socket.room]["banned"]==null){
			banneduser = -1;
		}else{
			banneduser = chatrooms[socket.room]["banned"].indexOf(socket.username);
		}


		if(banneduser>-1){
			var joined = false;
			var msg = "You are banned from this chatroom!";
			io.sockets.connected[socket.id].emit('join',{success:joined, message:msg});
		}else if(chatrooms[socket.room]==null){
			var joined = false;
			var msg = "Room doesn't exist!";
			io.sockets.connected[socket.id].emit('join',{success:joined, message:msg});
		}else{

			socket.join(socket.room);
			chatrooms[socket.room]["members"].push(socket.username);

			//socket.emit('update_member',{roomname:socket.room});


			var updatedlist = JSON.stringify(vals);
			var joined = true;
			io.sockets.connected[socket.id].emit('join',{success:joined});
			date = new Date();
			msg = socket.username + " has joined room " + socket.room + " " + date.getHours() + ":" + date.getMinutes();
			io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
			io.sockets.in(socket.room).emit('update_member',updatedlist);

		}
	});



	socket.on('join_private', function(data){

		var index2 = 0;
		var leave = 0;
		if(privateRooms[socket.room]==null&&chatrooms[socket.room]==null){
			index2 = -1;
		}else{
			if(privateRooms[socket.room]==null){
				index2= chatrooms[socket.room]["members"].indexOf(socket.username);
				leave = 1;
			}else{
				index2 = privateRooms[socket.room]["members"].indexOf(socket.username);
				leave = 2
			}
		}

		var vals;
		if(index2 > -1&&leave>0){
			if(leave==1){
				chatrooms[socket.room]["members"].splice(index2,1);
				vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
	    		return chatrooms[socket.room]["members"][key];
				});
			}else{
				privateRooms[socket.room]["members"].splice(index2,1);
				vals = Object.keys(privateRooms[socket.room]["members"]).map(function(key) {
	    		return privateRooms[socket.room]["members"][key];
				});
			}

			date = new Date();
			var msg = socket.username + " has left the chatroom! " + date.getHours() + ":" + date.getMinutes();
			io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users


			var updatedlist = JSON.stringify(vals);
			io.sockets.in(socket.room).emit('update_member',updatedlist);
		}
		socket.room = data["chatroom"];
		if(privateRooms[socket.room]!=null){

			var banneduser = 0;

			if(privateRooms[socket.room]["banned"]==null){
				banneduser = -1;
			}else{
				banneduser = privateRooms[socket.room]["banned"].indexOf(socket.username);
			}

			if(banneduser>-1){
				var joined = false;
				var msg = "You are banned from this chatroom!";
				io.sockets.connected[socket.id].emit('join',{success:joined, message:msg});
			}else if(privateRooms[data["chatroom"]]["password"]!=data["password"]){
				var joined = false;
				var msg = "incorrect Passowrd!";
				io.sockets.connected[socket.id].emit('join',{success:joined, message:msg});
			}else{

				// Join in new room

				socket.join(socket.room);
				privateRooms[socket.room]["members"].push(socket.username);

				//socket.emit('update_member',{roomname:socket.room});
				var vals = Object.keys(privateRooms[socket.room]["members"]).map(function(key) {
	    		return privateRooms[socket.room]["members"][key];
				});
				var updatedlist = JSON.stringify(vals);
				var joined = true;
				io.sockets.connected[socket.id].emit('join',{success:joined});
				date = new Date();
				msg = socket.username + " has joined the private chatroom " + socket.room + " " + date.getHours() + ":" + date.getMinutes();
				io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
				io.sockets.in(socket.room).emit('update_member',updatedlist);

			}
		}else{
			var msg = "";
			io.sockets.connected[socket.id].emit('join',{success:false,message: msg});
		}
	});


	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.

		console.log("message: "+data["message"] + " in room: "+ socket.room); // log it to the Node.JS output
		date = new Date();
		var userinfo = socket.username + " at " + date.getHours() + ":" + date.getMinutes() + " says:";
		io.sockets.in(socket.room).emit("message_to_client",{message:userinfo }) ;// broadcast the message to other users
		io.sockets.in(socket.room).emit("message_to_client",{message:data["message"]});
	});

	socket.on('kick', function(data) {
		// This callback runs when the server receives a new message from the client.
		var tokick=data["tokickuser"];

		if(chatrooms[socket.room]!=null && socket.username==chatrooms[socket.room]["owner"]){

			var index = chatrooms[socket.room]["members"].indexOf(tokick);
			if(index1 > -1){
				chatrooms[socket.room]["members"].splice(index,1);
				date = new Date();
				var msg = tokick + " has been asked to leave the chatroom! " + date.getHours() + ":" + date.getMinutes();
				io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
				var vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
	    		return chatrooms[socket.room]["members"][key];
				});
				var updatedlist = JSON.stringify(vals);
				io.sockets.in(socket.room).emit('update_member',updatedlist);
				banid = users[tokick];
				var msg = "You are kicked or banned from this chatroom!";
				io.sockets.connected[banid].emit('kickorban',{message:msg});
			}else{
				var kick=false;
				var msg ="User does not exist";
				io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
			}
		}else if (privateRooms[socket.room]!=null&&socket.username==privateRooms[socket.room]["owner"]){
			var index = privateRooms[socket.room]["members"].indexOf(tokick);
			if(index1 > -1){
				privateRooms[socket.room]["members"].splice(index,1);
				date = new Date();
				var msg = tokick + " has been asked to leave the chatroom! " + date.getHours() + ":" + date.getMinutes();
				io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
				var vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
	    		return chatrooms[socket.room]["members"][key];
				});
				var updatedlist = JSON.stringify(vals);
				io.sockets.in(socket.room).emit('update_member',updatedlist);
				banid = users[tokick];
				var msg = "You are kicked or banned from this chatroom!";
				io.sockets.connected[banid].emit('kickorban',{message:msg});
			}else{
				var kick=false;
				var msg ="User does not exist";
				io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
			}
		}else{
			var kick=false;
			var msg ="You do not have the privilege to kick out users!";
			io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
		}
	});

		socket.on('ban', function(data) {
			// This callback runs when the server receives a new message from the client.
			var tokick=data["ban"];

			if(chatrooms[socket.room]!=null&&socket.username==chatrooms[socket.room]["owner"]){
				var index = chatrooms[socket.room]["members"].indexOf(tokick);
				if(index1 > -1){
					chatrooms[socket.room]["members"].splice(index,1);
					chatrooms[socket.room]["banned"].push(tokick);
					date = new Date();
					var msg = tokick + " has been banned from the chatroom! " + date.getHours() + ":" + date.getMinutes();
					io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
					var vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
		    		return chatrooms[socket.room]["members"][key];
					});
					var updatedlist = JSON.stringify(vals);
					io.sockets.in(socket.room).emit('update_member',updatedlist);
					banid = users[tokick];
					var msg = "You are kicked or banned from this chatroom!";
					io.sockets.connected[banid].emit('kickorban',{message:msg});
				}else{
					var kick=false;
					var msg ="User does not exist";
					io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
				}
			}else if (privateRooms[socket.room]!=null&&socket.username==privateRooms[socket.room]["owner"]){
				var index = privateRooms[socket.room]["members"].indexOf(tokick);
				if(index1 > -1){
					privateRooms[socket.room]["members"].splice(index,1);
					privateRooms[socket.room]["banned"].push(tokick);
					date = new Date();
					var msg = tokick + " has been asked to leave the chatroom! " + date.getHours() + ":" + date.getMinutes();
					io.sockets.in(socket.room).emit('message_to_client',{message:msg }); // broadcast the message to other users
					var vals = Object.keys(chatrooms[socket.room]["members"]).map(function(key) {
		    		return chatrooms[socket.room]["members"][key];
					});
					var updatedlist = JSON.stringify(vals);
					io.sockets.in(socket.room).emit('update_member',updatedlist);
					banid = users[tokick];
					var msg = "You are kicked or banned from this chatroom!";
					io.sockets.connected[banid].emit('kickorban',{message:msg});
				}else{
					var kick=false;
					var msg ="User does not exist";
					io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
				}
			}else{
				var kick=false;
				var msg ="You do not have the privilege to kick out users!";
				io.sockets.connected[socket.id].emit('kick',{kicked:kick, message:msg});
			}
	});

	// creative portionyy
	socket.on('disconnect',function(){
   console.log('user disconnected');
 	});

});
