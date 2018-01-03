const ipcRenderer = require('electron').ipcRenderer;
var chatVue = {};

new Vue({
  el: '#chat',
  data: {
      items:[ 
        
      ],
    nickname:"天才熊猫",
    photo:'img/cat.png',
    userList: null,
    current: null,
    chat:false,
    group: false,
    friends:false,
    isgroup: true,
    isChat: false,
    mask: false,
    muc: false,
    showchat: true,
    showgroup: false,
    showfriends:false,
    flist:null,
    tlist:null,
    teamList:null,
    friendsList:null,
    isAddList:false,
    isAddListText:false,
    teamname:null,
    newmsg:false,
    newFrendList:[],
    Auserid:null,
    Aloginhint:null,
    Auid:null,
    Auserimg:null,
    Ausersign:null,
    Auseremail:null,
    AteamList:[],
    AselectedList:null,
    AshowAddF:false,
    showADDF:false,
    U:null,
    FshowAddF:false,
    FselectedList:null,
    FteamList:[],
    chatmess:[],
    showuserinfo:false,
    info_uid:null,
    info_username:null,
    info_sign:null,
    info_email:null,
    userid: window.localStorage.getItem('uid'),
    result:window.localStorage.getItem('result'),
    userList:window.localStorage.getItem('userList')
  },
  created(){
    chatVue = this;
    this.loaduser();
    // this.newFriend();
  },
  filters: {
    filterImg:(img)=>{
      return img.replace('/images', 'img');
    }
  },
  methods: {
    showToggle(item){ 
      if(item.data[0]!=null){
        item.isSubShow = !item.isSubShow;
        }
      },
    closeWin(){
      ipcRenderer.send('close-main');
    },
    closeMin(){
      ipcRenderer.send('min-main');
    },
    closeMax(){
      ipcRenderer.send('max-main');
    },
    showChat(){
      this.newmsg = false;
      this.chat = true;
      this.group = false;
      this.friends = false;
      this.showchat = true;
      this.showgroup = false;
      this.showfriends = false;
    },
    showGroup(){
      this.chat = false;
      this.group = true;
      this.friends = false;
      this.showchat = false;
      this.showgroup = true;
      this.showfriends = false;
    },
    showFriends(){
      this.chat = false;
      this.group = false;
      this.friends = true;
      this.showchat = false;
      this.showgroup = false;
      this.showfriends = true;
    },
    showUserInfo(){
      let re = JSON.parse(this.result);
      this.showuserinfo = true;
      this.info_uid = re.uid;
      console.log(re.email)
      this.info_username = re.username;
      this.info_sign = re.sign;
      this.info_email = re.email;
    },
    closeUserInfo(){
      this.showuserinfo = false;
    },
    isGroup(){
      this.isgroup = true;
    },
    isMuc(){
      this.isgroup = false;
    },
    showMucBox(){
      this.mask = true;
      this.muc = true;
    },
    delUser(item){
      var index = this.userList.indexOf(item);
      this.userList.splice(index, 1);
    },
    loaduser(){
      let re = JSON.parse(this.result);
      this.U = re.uid;
      this.photo = re==null?'img/cat.png':re.avatar;
      this.nickname = re==null?11:re.nickname;
      // console.log(re.avatar);
      let obj = {
           // uid:1
        uid:re.uid
      };
      console.log(obj);
      let effectRow = [];
      let map = {};
      let dest = [];
      this.$http.post(config.server+'loaduser',obj,{emulateJSON:true}).then(function(res){
        for(i=0;i<res.data.length;i++){
          effectRow.push(res.data[i]);
        }
        for(i = 0;i<effectRow.length;i++){
          let ai = effectRow[i];
          let key = ai.tName;
          if(ai.cid == null){
            ai = null;
          }
          if(!map[key]){
            dest.push({
              tName:key,
              isSubShow:false,
              data:[ai]
            });
            map[key] = ai;
          }else{
            for(var j = 0;j < dest.length; j++){
              var dj = dest[j];
              if(dj.tName == ai.tName){
                dj.data.push(ai);
                break;
              }
            }
          }
        }
        this.items = dest;
        console.log(this.items)
        console.log(res)
      },function(res){
        console.log(res.status);
      });    
    },
    //搜索好友
    addSearch(){
      this.showADDF = true;
    },
    toggleSession(item){
      this.chatmess = [];
      this.current = item;
      this.isChat = true;
      let i = JSON.stringify(item); 
      window.localStorage.setItem('current', i);
      let re = JSON.parse(this.result);
      let obj = {
        username:re.username,
        uid:re.uid,
        sid:item.cid
      }
      console.log(item)
      this.$http.get(config.server + 'chatHistoryLoad?',{params:obj}).then(function(res){
        if(res.body.code==1){
          console.log(res);
          for(let i = res.body.result.length-1;i>=0;i--){
            console.log(res.body.result[i])
            let it = res.body.result[i];
            this.chatmess.push(it);
          }
        }else{
          alert("请检查网络");
        }
      })
      // document.getElementById('message').innerHTML = '';
    },
    //添加分组
    showAddList(){
      if(this.showfriends){
        this.isAddList = true;
      }
    },
    closeAddList(){
      this.isAddList = false;
      this.isAddListText = false;
    },
    addListText(){
      this.isAddListText = true;
    },  
    addListConfirm(){
      let re = JSON.parse(this.result);
      let obj = {
        tName:this.teamname,
        uid:re.uid
      }
      this.$http.post(config.server + 'addList', obj,{emulateJSON:true}).then(function(res){
        if(res.body.code==1){
          console.log("添加成功");
          this.loaduser();
          this.closeAddList();
        }else{
          alert("请检查网络");
        }
      })
    },
    //好友申请
    // newFriend(){
    //   let re = JSON.parse(this.result);
    //   let obj = {
    //     uid:re.uid
    //   }
    //   this.$http.post(config.server + 'newFriend', obj,{emulateJSON:true}).then(function(res){
    //     if(res.body.code==1){
    //       console.log("添加成功");
    //       for(var i = 0;i < res.body.result.length;i++){
    //         let item = {userid:res.body.result[0].uid,cid:res.body.result[0].cid,tid:res.body.result[0].tid};
    //         this.newFrendList.push(item);
    //       }
    //     }else{
    //       consol.log('2')
    //     }
    //   })
    // },
    // -------------------------------------------------------添加好友页面
    // 关闭当前页面
        closeAdd(){
          this.showADDF = false;
        },
        //查找
        Asearch(){
          obj = {
            userid:this.Auserid
          };
          this.$http.get(config.server + 'searchUser?', {params:obj}).then(function(res){
            if(res.body.code == 1){
              console.log(res)
              this.Aloginhint='';
              this.Auid = this.Auserid;
              this.Auserimg = res.body.result[0].avatar;
              this.Ausersign = res.body.result[0].sign;
              this.Auseremail = res.body.result[0].email;
            }else{
              console.log(res);
              this.Aloginhint='没有查询到结果';
            }
          });
        },
        //弹出添加框
        showAdd(){
          this.AteamList = [];
          let result = window.localStorage.getItem('result');
          let re = JSON.parse(result);
          let obj = {
            userid : re.uid
          }
          this.$http.get(config.server + 'teamList?', {params:obj}).then(function(res){
            if(res.body.code == 1){
              for(var i = 0;i < res.body.result.length;i++){
                let tName = res.body.result[i].tName;
                let tid = res.body.result[i].tid;
                this.AteamList.push({tName:tName,tid:tid});
              }
            }else{
              this.Aloginhint = "网络出错"
            }
          });
          this.AshowAddF = true;
        },
        //隐藏好友框
        addFriendHide(){
          this.AshowAddF = false;
        },
        //添加好友
        addFriend(){
          let result = window.localStorage.getItem('result');
          let re = JSON.parse(result);
          let obj = {
            cid : this.newFrendList[0].suid,
            uid : re.uid,
            tid : this.FselectedList,
            confirm : 0
          };
          this.$http.post(config.server + 'addFriend2',obj,{emulateJSON:true}).then(function(res){
            console.log(res)
            if(res.body.code == 1){
              alert('发送成功');
            }else{
              alert('添加失败')
            }
          });
          this.newFrendList=[];
          this.FshowAddF = false;
          this.loaduser();
        },
        clearF(item){
          this.newFrendList = [];
        },
        //文件
    handleFileChange(){
      let inputDOM = document.querySelector('.add-file');
      this.file = inputDOM.files[0];
      console.log('this.file', this.file);
      let formData = new FormData();
      formData.append('file',inputDOM.files[0]);
      // this.errText = '';
      // let size = Math.floor(this.file.size / 1024);
      this.$http.post(config.server+'upload',formData,{emulateJSON:true}).then(function(res){
        console.log('res.body.url', res.body.url);
        let html = '<img src="'+res.body.url+'" /><div></div>';
        document.getElementById("textarea").innerHTML+=html;  
      },function(res){
        console.log(res.status);
      });
    },
    handleFileChange2(){
      let inputDOM = document.querySelector('.add-file');
      this.file = inputDOM.files[0];
      console.log('this.file', this.file);
      let formData = new FormData();
      formData.append('file',inputDOM.files[0]);
      // this.errText = '';
      // let size = Math.floor(this.file.size / 1024);
      this.$http.post(config.server+'upload',formData,{emulateJSON:true}).then(function(res){
        console.log('res.body.url', res.body.url);
        this.photo = res.body.url;
      },function(res){
        console.log(res.status);
      });
    }
  }
});
