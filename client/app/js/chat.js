// const ipcRenderer = require('electron').ipcRenderer;
var uid = window.localStorage.getItem('result')+'';
var current = window.localStorage.getItem('current')+'';
window.addEventListener('keydown', function(event){
  if(event.ctrlKey && event.shiftKey){
    ipcRenderer.send('openDevTools');
  }
});
var converId = null;
(function () {
	var d = document,
			w = window,
			p = parseInt,
			dd = d.documentElement,
			db = d.body,
			dc = d.compatMode == 'CSS1Compat',
			dx = dc ? dd: db,
			ec = encodeURIComponent;
	
	
	w.CHAT = {
		msgObj:d.getElementById("message"),
		userList: d.getElementById("userList"),
		screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
		username:null,
		userid:null,
		socket:null,
		avatar:null,
		nickname:null,
		userinfo:d.getElementById('userInfo'),
		// //让浏览器滚动条保持在最低部
		scrollToBottom:function(){
			if (d.getElementById("message")) {
				setTimeout(function(){
					d.getElementById("message").scrollTop = 1000000000;
				},120);
			}
		},
		// //退出，本例只是一个简单的刷新
		// logout:function(){
		// 	//this.socket.disconnect();
		// 	location.reload();
		// },
		//提交聊天消息内容
		submit:function(){
			var content = d.getElementById("textarea").innerHTML;
					current = window.localStorage.getItem('current');				
					current = JSON.parse(current);
					current.cid = parseInt(current.cid)
			var time = new Date().getTime();
			if(content != ''){
				var obj = {
					type: 'text',
					userid: this.userid,
					username: this.username,
					content: content
				};

				this.socket.emit('send private message',obj.content, current.cid, obj.userid, time,current.username);
				
				/**/
				// var section = d.createElement('div');
				// var contentDiv = '<span class="user-img"><img src='+this.avatar+'></span><div class="mess-time">'+time+'</div><div class="mess-cont">'+content+'</div>';
				// section.className = 'mess-right';
				// section.innerHTML = contentDiv;
				// CHAT.msgObj.appendChild(section);
				// console.log('obj', obj, contentDiv);
				
				// this.socket.emit('broadcast', obj);
				chatVue.toggleSession(current);
				d.getElementById("textarea").innerHTML = '';
				this.scrollToBottom();
			}
			return false;
		},
		addFriends:function(cid,tid){
			var obj = {
				cid:cid,
				tid:tid,
				avatar:chatVue.photo,
				userid:this.userid,
				username:this.username,
				nickname:this.nickname
			};
			chatVue.showADDF = false;
			this.socket.emit('addFriend',obj.cid,obj.avatar,obj.nickname,obj.username,obj.userid,obj.tid);
		},
		addFriendsCon:function(cid,flag){
			var obj = {
				uid:this.userid,
				cid:cid,
				stid:chatVue.newFrendList[0].stid,
				flag:flag
			};
			// for(var i = 0;i<chatVue.newFrendList.length;i++){
			// 	if(chatVue.newFrendList[i].suid == obj.cid){

			// 	}
			// }
	          let result = window.localStorage.getItem('result');
	          let re = JSON.parse(result);
	          let Fobj = {
	            userid : re.uid
	          }
	          chatVue.$http.get(config.server + 'teamList?', {params:Fobj}).then(function(res){
	            if(res.body.code == 1){
	              for(var i = 0;i < res.body.result.length;i++){
	                let tName = res.body.result[i].tName;
	                let tid = res.body.result[i].tid;
	                chatVue.FteamList.push({tName:tName,tid:tid});
	              }
	            }else{
	              chatVue.Aloginhint = "网络出错"
	            }
	          });
	          chatVue.FshowAddF = true;
			this.socket.emit('agree add friend msgBack',obj.uid,cid,obj.flag,obj.stid);
		},
	// 	genUid:function(){
	// 		return new Date().getTime()+""+Math.floor(Math.random()*899+100);
	// 	},
	// 	//更新系统消息，本例中在用户加入、退出的时候调用
	// 	updateSysMsg:function(o, action){
	// 		//当前在线用户列表
	// 		var onlineUsers = o.onlineUsers;
	// 		//当前在线人数
	// 		var onlineCount = o.onlineCount;
	// 		//新加入用户的信息
	// 		var user = o.user;
				
	// 		//更新在线人数
	// 		var userhtml = '';
	// 		var separator = '';
	// 		for(key in onlineUsers) {
	// 	        if(onlineUsers.hasOwnProperty(key)){
	// 				userhtml += separator+onlineUsers[key];
	// 				separator = '、';
	// 			}
	// 	    }
	// 		// d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
			
	// 		//添加系统消息
	// 		var html = '';
	// 		html += '<span>';
	// 		html += user.username;
	// 		html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
	// 		html += '</span>';
	// 		var section = d.createElement('p');
	// 		section.className = 'prompt';
	// 		section.innerHTML = html;
	// 		this.msgObj.appendChild(section);
	// 		this.scrollToBottom();
	// 	},
	// 	//第一个界面用户提交用户名
	// 	usernameSubmit:function(username){
	// 		if(username){
	// 			// d.getElementById("username").value = '';
	// 			// d.getElementById("loginbox").style.display = 'none';
	// 			// d.getElementById("chatbox").style.display = 'block';
	// 			this.init(username);
	// 		}
	// 		return false;
	// 	},
		init:function(username){
			
			// 客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
			// 实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
			uid = JSON.parse(uid);
			this.userid = uid.uid;
			this.username = uid.username;
			this.nickname = uid.nickname;
			this.avatar = uid.avatar;
			// alert(window.uid);
			// alert(uid.uid);
			
			//连接websocket后端服务器
			// this.socket = io.connect
			this.socket = io.connect(config.server);
			
			//告诉服务器端有用户登录
			this.socket.emit('new user', this.username,this.nickname,this.userid,this.avatar);
			
			//监听新用户登录
			// this.socket.on('login', function(o){
			// 	CHAT.updateSysMsg(o, 'login');	
			// });
			//私人消息
			this.socket.on('receive private message',function(obj){
				// var section = d.createElement('div');
				// var contentDiv = '<span class="user-img"><img src='+obj.avatar+'></span><div class="mess-cont">'+obj.msg+'</div>';
				// section.className = 'mess-left';
				// section.innerHTML = contentDiv;
				// CHAT.msgObj.appendChild(section);
				var cu = window.localStorage.getItem('current');
				cu = JSON.parse(cu);
				chatVue.toggleSession(cu);
				CHAT.scrollToBottom();
				chatVue.newmsg = true;
			});
			//添加好友
			this.socket.on('receive addFriend',function(obj){
				chatVue.newmsg = true;
				chatVue.newFrendList.push(obj);
			});
			this.socket.on('receive agree add friend msgBack',function(obj){
				let data = {
		            cid : obj.suid,
		            uid : obj.ruid,
		            tid : obj.stid,
		            confirm : obj.isAgree
		          };
		        chatVue.$http.post(config.server + 'addFriend2',data,{emulateJSON:true}).then(function(res){
		          console.log(res)
		          if(res.body.code == 1){
		            alert('你已添加'+data.cid+'为好友');
		          }else{
		            alert('添加失败')
		          }
		        });
		        chatVue.loaduser();
			});
			//监听用户退出
			this.socket.on('logout', function(o){
				CHAT.updateSysMsg(o, 'logout');
			});
			this.socket.on(uid, function (data) {
	      		var section = d.createElement('div');
				var contentDiv = '<span class="user-img"><img src="img/03.gif"></span><div class="mess-cont">'+data.message+'</div>';
				section.className = 'mess-left';
				section.innerHTML = contentDiv;
				CHAT.msgObj.appendChild(section);
				CHAT.scrollToBottom();
      		});
			this.socket.on('shaketo',function(data){
				document.getElementById('chat').className+=' shakee';
				setTimeout(function(){document.getElementById('chat').className = document.getElementById('chat').className.replace(' shakee','')},3000);
			});
			document.getElementById('s1').onclick = function(){
							current = window.localStorage.getItem('current');				
							current = JSON.parse(current);
							current.cid = parseInt(current.cid)
					var time = new Date().getTime();
						var obj = {
							type: 'text',
							userid: this.userid,
							username: this.username,
						};
				document.getElementById('chat').className+=' shakee';
				setTimeout(function(){document.getElementById('chat').className = document.getElementById('chat').className.replace(' shakee','')},3000);
				CHAT.socket.emit('shake', current.cid, obj.userid, current.username)
			}
		}
	};
	
	// //通过“回车”提交用户名
	// ipcRenderer.on('post-username',  function(event, message) {
	// 	console.log('1234', message);
	// 	CHAT.usernameSubmit(message);
	// });
	// var username = window.localStorage.getItem("username");
	// d.getElementById("username").onkeydown = function(e) {
	// 	e = e || event;
	// 	if (e.keyCode === 13) {
	// 		CHAT.usernameSubmit(this.value);
	// 	}
	// };
	//通过“回车”提交信息
	d.getElementById("textarea").onkeydown = function(e) {
		console.log(123);
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.submit();
		}
	};
	// d.getElementById('').onclick = function(){
	// 	CHAT.addFriends
	// }
	w.CHAT.init();
})();