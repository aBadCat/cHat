const express=require("express");
const mysql=require("mysql");
var qs = require('querystring')
var app = express();
var server = require('http').createServer(app);
var pool=mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"您的密码",
    database:"chat",
    port:3306,
    connectionLimit:25
});
server.listen(80);
app.use('/',express.static(__dirname + '/../client/app'));
//注册
app.post("/signup",(req,res)=>{
    req.on("data",(data)=>{
        var obj=qs.parse(data.toString());
        var username=obj.username,
            password=obj.password,
            avatar='img/'+Math.round(Math.random()*10)+'.gif',
            nickname=obj.nickname,
            email = obj.email,
            sign="";
        var uid = null,
            tName = '我的好友',
            tid = 1;
        pool.getConnection((err,conn)=>{
            var sql="INSERT INTO user VALUES(null,?,?,?,?,?,?)";
            conn.query(sql,[username,avatar,sign,email,nickname,password],(err,result)=>{
                if(err) throw err;
                
                conn.release();
            })
        });
       pool.getConnection((err,conn)=>{
            var sql1 = "SELECT MAX(uid) FROM user WHERE username = ?";
            var sql2 = "INSERT user_type VALUES(?,?,?)";
            conn.query(sql1,[username],(err,result)=>{
                if(err) throw err;
                if(result.length>0){
                    let que = result;
                    uid = parseInt(que[0]["MAX(uid)"]);
                    conn.query(sql2,[uid,tName,tid],(err,result)=>{
                        if(err) throw err;
                        if(result.affectedRows>0){
                            res.json({code:1,msg:"添加成功"});
                        }else{
                            res.json({code:-1,msg:"添加失败"});
                        }
                    })
                }
            });
            console.log(tid);
        })
    })
});
app.post("/checkU",(req,res)=>{
    console.log('1')
    req.on("data",(data)=>{
        var obj = qs.parse(data.toString());
        var username = obj.username;
        pool.getConnection((err,conn)=>{
            var sql = "SELECT username from user WHERE username = ?";
            conn.query(sql,[username],(err,result)=>{
                if(err) throw err;
                if(result.length<1){
                    res.json({code:1,mes:"noexsist"});
                }else{
                    res.json({code:-1,mes:"exsist"});
                }
            conn.release();
            })
        })
    })
})
//建立聊天记录表
app.post("/createTable",(req,res)=>{
    req.on("data",(data)=>{
        var obj=qs.parse(data.toString());
        console.log(obj)
        var uname=obj.username;
        pool.getConnection((err,conn)=>{
            var sql="CREATE TABLE ch"+uname+"(" +
                "cid INT PRIMARY KEY AUTO_INCREMENT," +
                "uid1 INT," +
                "uid2 INT," +
                "content VARCHAR(10000)," +
                "time VARCHAR(50)," +
                "pubtime DATETIME," +
                "nick VARCHAR(50)," +
                "avatar VARCHAR(20)," +
                "isLeft VARCHAR(10))";
            conn.query(sql,(err,result)=>{
                if(err) throw err;
            })
        })
    })
});
//登录验证
app.post("/login",(req,res)=>{
    req.on("data",(data)=>{

        var obj=qs.parse(data.toString());
        // console.log(obj);
        var u=obj.username,
            p=obj.password;
        pool.getConnection((err,conn)=>{
            var sql="SELECT * FROM user WHERE username=? AND password=?";
            conn.query(sql,[u,p],(err,result)=>{
                if(err) throw err;
                if(result.length<1){
                    res.json({code:-1,msg:"登录失败",re2:result})
                }else{
                    res.json({code:1,msg:"登录成功",result:{uid:result[0].uid,username:result[0].username,avatar:result[0].avatar,nickname:result[0].nickname,password:result[0].password,email:result[0].email,sign:result[0].sign}});
                }
                conn.release();
            })
        })
    })
});
//读取信息
app.post("/loaduser",(req,res)=>{
    req.on("data",(data)=>{
        var obj = qs.parse(data.toString());
        var uid = obj.uid;
        console.log(obj);
        pool.getConnection((err,conn)=>{
            var sql="SELECT c.cid,c.tid,u.username,u.nickname,u.avatar,u.sign,t.tName FROM user_type t left join user_contact c on t.tid = c.tid AND t.uid = c.uid left join user u on c.cid = u.uid WHERE t.uid=?";
            conn.query(sql,[uid],(err,result)=>{
                console.log(result)
                if(err) throw err;
                if(result.length>0){
                    res.json(result);
                }
                conn.release();
            })
        })
    })
});
//添加分组
app.post("/addList",(req,res)=>{
    req.on("data",(data)=>{
        var obj = qs.parse(data.toString());
        var tName = obj.tName;
        console.log(tName)
        var uid = obj.uid;
        var tid = 1;
        pool.getConnection((err,conn)=>{
            var sql1 = "SELECT MAX(tid) FROM user_type WHERE uid = ?";
            var sql2 = "INSERT user_type VALUES(?,?,?)";
            conn.query(sql1,[uid],(err,result)=>{
                if(err) throw err;
                if(result.length>0){
                    let que = result;
                    tid = parseInt(que[0]["MAX(tid)"]) + 1;
                    conn.query(sql2,[uid,tName,tid],(err,result)=>{
                        if(err) throw err;
                        if(result.affectedRows>0){
                            res.json({code:1,msg:"添加成功"});
                        }else{
                            res.json({code:-1,msg:"添加失败"});
                        }
                    })
                }
            });
            console.log(tid);
        })
    })
});
//获取信息
app.get("/searchUser",(req,res)=>{
    var uid=req.query.userid;
    console.log(uid);
    pool.getConnection((err,conn)=>{
        var sql="SELECT * FROM user WHERE uid=?";
        conn.query(sql,[uid],(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                res.json({code:1,result});
            }else{
                res.json({code:-1})
            }
            conn.release();
        })
    })
});
//分组信息
app.get("/teamList",(req,res)=>{
    var uid = req.query.userid;
    console.log(uid)
    pool.getConnection((err,conn)=>{
        var sql="SELECT * FROM user_type WHERE uid=?";
        conn.query(sql,[uid],(err,result)=>{
            if(err) throw err;
            if(result.length>0){
                res.json({code:1,result});
            }
            conn.release();
        })
    })
});
//添加好友
app.post("/addFriend2",(req,res)=>{
    req.on("data",(data)=>{
        var obj = qs.parse(data.toString());
        var uid = obj.uid,
            cid = obj.cid,
            tid = obj.tid,
            confirm = obj.confirm;
        pool.getConnection((err,conn)=>{
            var sql = "INSERT user_contact VALUES(?,?,?)";
            conn.query(sql,[uid,cid,tid],(err,result)=>{
                if(err) throw err;
                if(result.affectedRows>0){
                    res.json({code:1});
                }else{
                    res.json({code:-1})
                }
                conn.release();
            })
        })
    })
});
//离线未处理的好友请求
app.post("/addFriend",(req,res)=>{
    req.on("data",(data)=>{
        var obj = qs.parse(data.toString());
        var uid = obj.uid,
            cid = obj.cid,
            tid = obj.tid;
        pool.getConnection((err,conn)=>{
            var sql = "INSERT INTO user_contact VALUES(?,?,?)";
            conn.query(sql,[uid,cid,tid],(err,result)=>{
                if(err) throw err;
                if(result.affectedRows>0){
                    res.json({code:1,result});
                }else{
                    res.json({code:-1})
                }
                conn.release();
            })
        })
    })
})
//表头
var str="ch";
//聊天记录加载
app.get("/chatHistoryLoad",(req,res)=>{
    var username=req.query.username;
    var userList=str+username;
    var uid=req.query.uid; 
    var sid = req.query.sid;
    pool.getConnection((err,conn)=>{
        var sql="SELECT * FROM "+userList+" WHERE uid2=? AND uid1=? ORDER BY pubtime DESC LIMIT 0,10";
        conn.query(sql,[uid,sid],(err,result)=>{
            if(err) throw err;
            res.json({code:1,result:result});
            conn.release();
        })
    });
});
//聊天
app.post("/upload",(req, res, next)=>{
        var url = 'http://' + req.headers.host + '/images/' + req.file.filename;
        res.send({code:1, url: url,  message: "上传成功！"});
    });
var io = require("socket.io").listen(server);
var usocket = {},user = [];
io.on('connection',(socket) => {
    socket.on('new user', (username,nickname,uid,avatar) => {
        if(uid in usocket){
            delete(usocket[socket.uid]);
            for(var i = 0;i<user.length;i++){
                if(parseInt(user[i].uid)==uid){
                    user.splice(i,1);
                    break;
                }
            }
        }
        socket.uid = uid;
        usocket[uid] = socket;
        console.log(uid)
        var obj = {username:username,nickname:nickname,uid:uid,avatar:avatar};
        user.push(obj);
        socket.emit('login',JSON.stringify(user));
    });

    socket.on('send private message',function(msg,ruid,suid,showTime,rname){
        if(ruid in usocket){
            var nickname="",
                avatar="",
                username="";
            for(var i = 0;i<user.length;i++){
                if(user[i].uid==suid){
                    nickname=user[i].nickname;
                    avatar=user[i].avatar;
                    username=user[i].username;
                    break;
                }
            }
            usocket[ruid].emit('receive private message',{msg:msg,nickname:nickname,uid:suid,avatar:avatar,username:username,time:showTime});
            var userList = "ch" + username;
            console.log(userList)
            pool.getConnection((err,conn)=>{
                if(err) throw err;
                var sql = "INSERT INTO " + userList + " VALUES(null,?,?,?,?,now(),?,?,?)";
                console.log(sql)
                conn.query(sql,[ruid,suid,msg,showTime,nickname,avatar,true],(err,result)=>{
                    if(err) throw err;
                    conn.release();
                })
            });
            var friendList = "ch" + rname;   //var friendList = str + rname;
            console.log(friendList)
            pool.getConnection((err,conn)=>{
                if(err) throw err;
                var sql = "INSERT INTO " + friendList+ " VALUES(null,?,?,?,?,now(),?,?,?)";
                conn.query(sql,[suid,ruid,msg,showTime,nickname,avatar,false],(err,result)=>{
                    conn.release();
                })
            })
        }
    });
    socket.on('addFriend',function(ruid,avatar,nick,uname,suid,stid){
        if(ruid in usocket){
            var nickname="",
                avatar="",
                username="";
            for(var i = 0;i<user.length;i++){
                if(user[i].uid==suid){
                    nickname=user[i].nickname;
                    avatar=user[i].avatar;
                    username=user[i].username;
                    break;
                }
            }
            usocket[ruid].emit('receive addFriend',{nick:nick,avatar:avatar,uname:uname,suid:suid,stid:stid});
        }
    });
    socket.on('agree add friend msgBack',function(suid,ruid,isAgree,stid){
        if(ruid in usocket){
            var nickname="",
                avatar="",
                username="";
            for(var i = 0;i<user.length;i++){
                if(user[i].uid==suid){
                    nickname=user[i].nickname;
                    avatar=user[i].avatar;
                    username=user[i].username;
                    break;
                }
            }
        usocket[ruid].emit('receive agree add friend msgBack',{ruid:ruid,suid:suid,isAgree:isAgree,stid:stid});
    }
    });
    socket.on('shake',function(ruid,suid,rname){
        console.log('pop')
        if(ruid in usocket){
            var nickname="",
                avatar="",
                username="";
            for(var i = 0;i<user.length;i++){
                if(user[i].uid==suid){
                    nickname=user[i].nickname;
                    avatar=user[i].avatar;
                    username=user[i].username;
                    break;
                }
            }
            usocket[ruid].emit('shaketo',{uid:suid});
            
        }
    });
    socket.on('disconnect',function(){
        if(socket.uid in usocket){
            delete(usocket[socket.uid]);

        }
        for(var i = 0;i < user.length;i++){
            if(socket.uid == user[i].uid){
                user.splice(i,1);
                break;
            }
        }
        socket.broadcast.emit('user left',socket.username);
    });

});
