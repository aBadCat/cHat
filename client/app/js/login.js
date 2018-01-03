const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const links = document.querySelectorAll('a[href]');

new Vue({
  el: '#login',
  data: {
    photo:'img/cat.png',
    username: null,
    password: null,
    nickname:null,
		signin: false,
    isKeepPass:false,
    loginhint: '',
    sds:true
  },
  created(){
    this.openDevTools();
    this.shellA();
    this.keepPassON();
  },
  methods: {
    keepPassON(){
      let value = window.localStorage.getItem('isKeepPass')?window.localStorage.getItem('isKeepPass'):false;
      this.isKeepPass = value=== 'true'?true:false;
      if(this.isKeepPass == true){
        let uid = window.localStorage.getItem('result');
        uid = JSON.parse(uid);
        this.username = uid.username;
        this.password = uid.password;
        console.log(uid)
      }
    },
  	shellA(){
  		Array.prototype.forEach.call(links, function (link) {
			  const url = link.getAttribute('href')
			  if (url.indexOf('http') === 0) {
			    link.addEventListener('click', function (e) {
			      e.preventDefault()
			      shell.openExternal(url)
			    })
			  }
			})
  	},
  	openDevTools(){
  		let _this = this;
  		window.addEventListener('keydown', function(event){
			  if(event.ctrlKey && event.shiftKey){
			    ipcRenderer.send('openDevTools');
			  }
			  if (event.keyCode==13 && _this.username && _this.password) {
					_this.UserLogin();
				}
			});
  	},
  	closeLogin(){
  		ipcRenderer.send('close-login');
  	},
    openChat(){
      ipcRenderer.send('openChat');
    },
    keepPass(){
      this.isKeepPass = !this.isKeepPass;
      console.log(this.isKeepPass)
      console.log(typeof(this.isKeepPass))
      window.localStorage.setItem('isKeepPass',this.isKeepPass);
    },
    signup(){
      ipcRenderer.send('signup');
      return false;
    },
    UserLogin(){
    	let obj = {
    		username: this.username,
    		password: this.password
    	}
      console.log(obj)
      this.$http.post(config.server+'login',obj,{emulateJSON:true}).then(function(res){
        this.userList = res.body.result;
        this.photo = res.body.result.avatar;
        this.nickname = res.body.result.nickname;
        console.log(res)
        if (res.body.code) {
        	this.signin = true;
					window.localStorage.setItem('uid', res.body.result.uid);
          let re = res.body.result;
          re = JSON.stringify(re);
          window.localStorage.setItem('result',re);
          console.log(res.body.result)
          var i = window.localStorage.getItem('result');
          console.log(i);
          ipcRenderer.send('openChat', this.username);
        } else {
        	this.loginhint = '用户名/密码错误！';
        }
      },function(res){
        console.log(res.status);
      });
    }
  }
});
