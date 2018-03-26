'use strict';

// Deps
var express = require('express');
var router = express.Router();
/* GET index page. */
router.get('/', function(req, res,next) {
  res.render('index', { title: '华为SMS服务平台' });    // 到达此路径则渲染index文件，并传出title值供 index.html使用
});

/* GET login page. */
router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
    res.render("login",{title:'用户登录',message:null});
}).post(function(req,res){                     // 从此路径检测到post方式则进行post数据的处理操作
    //get User info
     //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var username = 'admin';
    var password = 'test@123!';
    var uname = req.body.uname;
    var upwd = req.body.upwd;  //获取post上来的 data数据中 uname的值
    if(username != uname) {
        console.log('uname: '+uname);
        req.session.error = '用户名不存在';
        // res.render('login',{title:'用户登录',message:'用户名不存在'});
        res.send(404,{title:'用户登录',message:'用户名不存在'});
    } else {
        console.log('upwd: '+upwd);
        if(password != upwd) {
            req.session.error = '密码错误';
            // res.redirect('login',{title:'用户登录',message:'密码错误'});
            res.send(404,{title:'用户登录',message:'密码错误'});
        } else {
            req.session.user = {name:uname,pwd:upwd};
            res.send(200,{name:uname,pwd:upwd});
        }
    }
});

/* GET home page. */
router.get("/smsconfig",function(req,res){ 
    if(!req.session.user){                  //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");             //未登录则重定向到 /login 路径
    }
    res.render("smsconfig",{title:'Home'});         //已登录则渲染home页面
});

/* GET logout page. */
router.get("/logout",function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
    req.session.user = null;
    req.session.error = null;
    res.redirect("/index");
});

module.exports = router;

// var request1 = require('request');
// var jsdom = require('jsdom');
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;

// var $ = require('jquery')(window);

// var Strformat = function(str1, str2)
// {

//     var str = str1; 
//     // console.log(str1);
//     for(var key in str2) {
//         // console.log(str);
//         // console.log('str2[key].slots');
//         // console.log(str2[key].data);
//         if (str2[key].slots !== undefined && Object.keys(str2[key].slots).length !== 0 && str2[key].slots.constructor === Object) { 
//             str2[key].content = Strformat(str2[key].content,str2[key].slots);
//         }

//         if (str2[key].blocks !== undefined && Object.keys(str2[key].blocks).length !== 0 && str2[key].blocks.constructor === Object) {
//             str2[key].content = Strformat(str2[key].content,str2[key].blocks);  
//         }

//         var re = new RegExp('<div data-type="slot" data-key="' + key + '">');
//         str = str.replace(re, '<div data-type="slot" data-key="' + key + '">' + str2[key].content);
//         var re1 = new RegExp('<div data-type="slot" data-key="' + key + '" data-original-key="none">');
//         str = str.replace(re1, '<div data-type="slot" data-key="' + key + '" data-original-key="none">' + str2[key].content);

//         var re2 = new RegExp('<div data-type="block" data-key="' + key + '">');
//         str = str.replace(re2, '<div data-type="block" data-key="' + key + '">' + str2[key].content);
        
//         var re3 = new RegExp('<div data-type="block" data-key="' + key + '" data-original-key="none">');
//         str = str.replace(re3, '<div data-type="block" data-key="' + key + '" data-original-key="none">' + str2[key].content);
//     }
//     return str;
// }

// exports.asset = function (req,res){
//    var obj = {
//         clientId:'7qbecky52s3x1x4x1pgxwvh9',
//         clientSecret:'bCZ0YEgPK5akWiII6hPkMQ39'
//     }
//     request1.post(
//         {
//             url: 'https://auth.exacttargetapis.com/v1/requestToken',
//             headers: {'content-type' : 'application/json'},
//             body: obj,
//             json: true
//         }, 
//         function(error, response, body){
//             console.log(body);
//             var result = body;
//             var obj1 = {
//                 // "query": {
//                 //         "leftOperand":{
//                 //             "property":"status.name",
//                 //             "simpleOperator": "equals",
//                 //             "valueType": "text",
//                 //             "value": "draft"
//                 //         },
//                 //         "logicalOperator" : "AND",
//                 //         "rightOperand":{
//                 //             "property":"category.name",
//                 //             "simpleOperator": "equals",
//                 //             "valueType": "text",
//                 //             "value": "Jennie Content Builder"
//                 //         }
//                 //     }
//                     // "query":{
//                     //     "property":"category.name",
//                     //     "simpleOperator": "equals",
//                     //     // "valueType": "text",
//                     //     "value": 'Jennie Content Builder'
//                     // }
//                     "query":{
//                         "property":"category.id",
//                         "simpleOperator": "equals",
//                         "valueType": "text",
//                         "value": "6886"
//                     }
//                 };

//             var headerValue = result.accessToken;
//             var authorizationHeader = 'Bearer ' + headerValue;
//             request1.post(
//                 {
//                     url: 'https://www.exacttargetapis.com/asset/v1/content/assets/query',
//                     headers: {'content-type' : 'application/json','Authorization':authorizationHeader},
//                     body: obj1,
//                     json: true
//                 }, function(error, response, body){
//                     console.log(body);
                    
//                     console.log(body.items[0].status);
//                     console.log(body.items[0].category);
//                     console.log(body.items[0].assetType);
//                     $("body").append(body.items[0].views.html.content);
//                     var bodyStr = $("body").html();
//                     var slots = body.items[0].views.html.slots;
//                     // console.log(body.items[0].views.html);
                    
//                     bodyStr = Strformat(bodyStr,slots);
//                     // res.format({'application/json':function(){
//                     //     res.send(body);
//                     // }});
                    
//                     // res.send($("body").html());
//                     res.send(bodyStr);
//                         // res.send(body.items[0].views.html.content);
//                 }
//             );
            
//         }
//     ); 
// } 
// exports.index = function(req, res){
//     // console.log(req.session.token);
//     res.send('allo');
//     // console.log(req.session.token);    
// };

// exports.login = function( req, res ) {
//     console.log( 'req.body: ', req.body );
//     res.redirect( '/' );
// };

// exports.logout = function( req, res ) {
//     req.session.token = '';
// };

