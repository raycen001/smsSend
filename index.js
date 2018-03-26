'use strict';

// Module Dependencies
// -------------------
var fs = require('fs');
var express = require('express');
var http = require('http');
var JWT = require('./lib/jwtDecoder');
var path = require('path')
var request = require('request');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var routes = require('./routes');
var activity = require('./routes/activity');
var pkgjson = require( './package.json' );
var router = express.Router(); 
var reqAgent = require('request');

// var sign = require('./routes/sign');

// var trigger = require('./routes/trigger');
var PORT = process.env.PORT || 5000

var app = express();
// app.disable('x-powered-by');
// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config
var APIKeys = {
    appId           : '3108aea5-c917-4e17-91a3-d9a585562919',
    clientId        : 'eki1xghk0vixs3nk3u0362zj',
    clientSecret    : 'g7Kb0qsn7NHhzqgLD2uWFEQh',
    appSignature    : 'quJw2wUP0wkUOSACyVhk9HfTBweWAjcIgyvNY-fGCBbW1EFCqEOKZDPlMUIOuaaXae3w-vnEoQf7Vv0Ssz2UR-2eoNhjV5N3NaehzhRsMV-6AQkvZdKHozcWpe87tkX76qBOkq3XDMBqyZ1U4FLJ51hynfBVP38IskUeDvEMMCGDuaURqR7L8_utDbPh6xnF5jk4TTzdE7cG3UBN05zAYfUXwZKSH5Zl8BAt1AvwIcqJT5HFbn837DSbSBcA5g2',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken'
};

// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});
    
    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );
    console.log(jwtData);
    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
    req.session.token = jwtData.token;
    next();
}
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
// var proxy = require('http-proxy-middleware');
// var restream = function(proxyReq, req, res, options) {
//     if (req.body) {
//         console.log(req.body);
//         let bodyData = JSON.stringify(req.body);
//         // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
//         proxyReq.setHeader('Content-Type','application/json');
//         proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
//         // stream the content
//         proxyReq.write(bodyData);
//     }
// }
// var repstream = function(proxyReq, req, res, options) {
//     console.log(res.headers);
//     // delete proxyRes.headers['Content-Type']; 
//     proxyRes.headers['Content-Type'] = 'application/json'; 
// }
// var options = {
//         target: 'https://auth.exacttargetapis.com/v1/requestToken', // 目标主机
//         changeOrigin: true,
//         xfwd:true,
//         // secure:false,
//         onProxyReq:restream
//         // pathRewrite:{
//         //     '^/v1/requestToken':'/v1/requestToken'
//         // }
//         // router: {
//         //      '/v1/requestToken': 'https://auth.exacttargetapis.com/v1/requestToken',//如果请求路径是/api/rest，则将url的请求路由重定向
//         // }
//     };

// var exampleProxy = proxy(options);  //开启代理功能，并加载配置

// var options1 = {
//         target: 'https://www.exacttargetapis.com', // 目标主机
//         changeOrigin: true,
//         xfwd:true,
//         secure:false,
//         router: {
//              '/asset/v1/content/assets/query': 'https://www.exacttargetapis.com/asset/v1/content/assets/query',//如果请求路径是/api/rest，则将url的请求路由重定向
//         }
//     };
// var exampleProxy1 = proxy(options1);  //开启代理功能，并加载配置

app.use(express.static(path.join(__dirname, 'public')));
// app.use('/auth', exampleProxy);//对地址为’/‘的请求全部转发
// app.use('/api', exampleProxy1);//对地址为’/‘的请求全部转发
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/',routes.index);
app.post('/login',routes.login); 
// app.get('/config.json', routes.index);
app.get('/assets', routes.asset);
// app.get('/testjs', routes.testjs);
// Custom Hello World Activity Routes
app.post('/sfmcApp/activities/bridge-app/save', activity.save );
app.post('/sfmcApp/activities/bridge-app/validate', activity.validate );
app.post('/sfmcApp/activities/bridge-app/publish', activity.publish );
app.post('/sfmcApp/activities/bridge-app/execute',activity.execute );

//forward the restful api 

// fetch token api
router.route('/:v/requestToken')
// post a request to the path
.post(function(req,res){
    var clientReq = req.body;
    var apiVersion = req.params.v;
    console.log(apiVersion);
    reqAgent.post({
            url: 'https://auth.exacttargetapis.com/'+apiVersion+'/requestToken',
            headers: {'content-type' : 'application/json'},
            body: clientReq,
            json: true
        }, function(error, response, body){
            res.send(body);
        })
})
// get a request from the path
.get(function(req, res) {
    var apiVersion = req.params.v;
    console.log(apiVersion);
    reqAgent.get('https://auth.exacttargetapis.com/'+apiVersion+'/requestToken',function(error, response, body){
        res.send(body);
    })
});

// fetch data api
router.route('/hub/:v/dataevents/key:obj_id/rowset')
// post a request to the path
.post(function(req,res){
    var dataReq = req.body;
    var dataheaders = req.headers;
    var deKey = req.params.obj_id;
    var apiVersion = req.params.v;
    console.log(req.params);
    console.log(deKey);
    console.log(apiVersion);
    reqAgent.post({
            url: 'https://www.exacttargetapis.com/hub/'+apiVersion+'/dataevents/key'+deKey+'/rowset',
            headers: dataheaders,
            body: clientReq,
            json: true
        }, function(error, response, body){
            res.send(body);
        })
})
// get a request from the path Huawei_Opportunities_Test
.get(function(req, res) {
    var deKey = req.params.obj_id;
    var apiVersion = req.params.v;
    console.log(req.params);
    console.log(deKey);
    console.log(apiVersion);
    reqAgent.get('https://www.exacttargetapis.com/hub/'+apiVersion+'/dataevents/key'+deKey+'/rowset',
            function(error, response, body){
                res.send(body);
            });
});

app.use('/', router);

app.get('/clearList', function( req, res ) {
    // The client makes this request to get the data
    activity.logExecuteData = [];
    res.send( 200 );
});

app.get( '/version', function( req, res ) {
    res.setHeader( 'content-type', 'application/json' );
    res.send(200, JSON.stringify( {
        version: pkgjson.version
    } ) );
} );
//Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
    // The client makes this request to get the data
    if( !activity.logExecuteData.length ) {
        res.send( 200, {data: null} );
    } else {
        res.send( 200, {data: activity.logExecuteData} );
    }
});
app.listen(PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
// app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
