'use strict';

var request1 = require('request');
var fs = require('fs');
var path = require('path');
// var jsdom = require('jsdom');
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;

// var $ = require('jquery')(window);

var Strformat = function(str1, str2){
    var str = str1; 
    // console.log(str1);
    for(var key in str2) {
        // console.log(str);
        // console.log('str2[key].slots');
        // console.log(str2[key].data);
        if (str2[key].slots !== undefined && Object.keys(str2[key].slots).length !== 0 && str2[key].slots.constructor === Object) { 
            str2[key].content = Strformat(str2[key].content,str2[key].slots);
        }

        if (str2[key].blocks !== undefined && Object.keys(str2[key].blocks).length !== 0 && str2[key].blocks.constructor === Object) {
            str2[key].content = Strformat(str2[key].content,str2[key].blocks);  
        }

        var re = new RegExp('<div data-type="slot" data-key="' + key + '">');
        str = str.replace(re, '<div data-type="slot" data-key="' + key + '">' + str2[key].content);
        var re1 = new RegExp('<div data-type="slot" data-key="' + key + '" data-original-key="none">');
        str = str.replace(re1, '<div data-type="slot" data-key="' + key + '" data-original-key="none">' + str2[key].content);

        var re2 = new RegExp('<div data-type="block" data-key="' + key + '">');
        str = str.replace(re2, '<div data-type="block" data-key="' + key + '">' + str2[key].content);
        
        var re3 = new RegExp('<div data-type="block" data-key="' + key + '" data-original-key="none">');
        str = str.replace(re3, '<div data-type="block" data-key="' + key + '" data-original-key="none">' + str2[key].content);
    }
    return str;
}
var fetchTmpNames = function(dirname){
    // console.log(path.join('./',dirname));
    var tmpNames = [];
    var fileDirectory = path.join('./', dirname);
    if(fs.existsSync(fileDirectory)) {
        //同步读取
        var pa = fs.readdirSync(fileDirectory);
        pa.forEach(function(s,index){
            if (s.indexOf('.template') > -1) {
                console.log(s);
                tmpNames.push(s.replace('.template',''));
            }
        });
    }
    console.log(tmpNames);
    return tmpNames;
}
var get = function(){
    var obj = {
        clientId:'7qbecky52s3x1x4x1pgxwvh9',
        clientSecret:'bCZ0YEgPK5akWiII6hPkMQ39'
    }
    request1.post(
        {
            url: 'https://auth.exacttargetapis.com/v1/requestToken',
            headers: {'content-type' : 'application/json'},
            body: obj,
            json: true
        }, 
        function(error, response, body){
            console.log(body);
            var result = body;
            var obj1 = {
                // "query": {
                //         "leftOperand":{
                //             "property":"status.name",
                //             "simpleOperator": "equals",
                //             "valueType": "text",
                //             "value": "draft"
                //         },
                //         "logicalOperator" : "AND",
                //         "rightOperand":{
                //             "property":"category.name",
                //             "simpleOperator": "equals",
                //             "valueType": "text",
                //             "value": "Jennie Content Builder"
                //         }
                //     }

                    // "query":{
                    //     "property":"name",
                    //     "simpleOperator": "equals",
                    //     "valueType": "text",
                    //     "value": "test222"
                    // }
                    "query":{
                        "property":"category.id",
                        "simpleOperator": "equals",
                        "valueType": "text",
                        "value": "6886"
                    }
                };

            var headerValue = result.accessToken;
            var authorizationHeader = 'Bearer ' + headerValue;
            request1.post(
                {
                    url: 'https://www.exacttargetapis.com/asset/v1/content/assets/query',
                    headers: {'content-type' : 'application/json','Authorization':authorizationHeader},
                    body: obj1,
                    json: true
                }, function(error, response, body){

                    console.log('body start ================>');
                    console.log(body);
                    console.log('body end   ================>');
                    var itms = [];
                    itms = body.items;
                    console.log('itms start ================>');
                    console.log(itms);
                    console.log('itms end   ================>');
                    
                    for(var i=0; i < itms.length; i++) {
                        console.log(itms[i].name + 'start ================>');
                        console.log(itms[i]);
                        console.log(itms[i].name + 'end   ================>');
                        var bodyStr = itms[i].views.html.content;
                        var slots = itms[i].views.html.slots;
                        var name = itms[i].name;
                        bodyStr = Strformat(bodyStr,slots);
                        fs.writeFile('./templates/'+name+'.template', bodyStr, function(err) {  
                            if (err) {  
                                console.log('出现错误!');
                                console.log(err);

                            }  
                            console.log('已输出至index.html中')  
                        })
                    }

                    console.log('templates are retrieved done');
                        // res.send(body.items[0].views.html.content);
                }
            );
            
        }
    ); 
}
var fetchEmailTmp = function (){
   var sObj = {
        fetchTmpNames : fetchTmpNames,
        get: get
   }
   

    return sObj;
}

exports.fetchEmailTmp = fetchEmailTmp;