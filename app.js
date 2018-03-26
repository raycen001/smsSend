'use strict';
//test
// Module Dependencies
// -------------------
var fs = require('fs');
var express = require('express');
var http = require('http');
var JWT = require('./lib/jwtDecoder');
var path = require('path');
var request = require('request');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser  = require('body-parser');
var routes = require('./routes/index');
var activity = require('./routes/activity');
var activitySOAP = require('./routes/sfmcSOAP');
var pkgjson = require( './package.json' );
var router = express.Router(); 
var reqAgent = require('request');
var schedule = require('node-schedule');
var cache = require('./cache/Cache').createCache("LRU", 100 * 100 * 10); // LRU is the algorithm
cache.set("test","hello",1000*60);

var fetchEmails = require('./fetchEmailTmp/fetchEmailTmp').fetchEmailTmp();
// fetchEmails.fetchTmpNames('templates');
fetchEmails.get();
/* how to use cache, the document is from https://github.com/hh54188/Node-Simple-Cache
  cache.set("key", "value", 1000 * 60); //cache.set(key, value[, expire(millisecond)]); 
  cache.get(key);
  cache.clear()
*/

var PORT = process.env.PORT || 5000

var app = express();
// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config
var APIKeys = {
    appId           : 'aa78435a-07dd-4b28-9211-bb816aa956db',
    clientId        : '7qbecky52s3x1x4x1pgxwvh9',
    clientSecret    : 'bCZ0YEgPK5akWiII6hPkMQ39',
    appSignature    : 'QJCgpU4NwDdo2JiBYCk7PnNwqgbL6hFvlZSD-xjJNKrVzyJ5N2g307kUtRXxV3MSkfxYzMPdHLIwbncb5HLfQFTUR9nzMOLOLhUTrgi0DMUpPODLb98EXEK1P-mlJH6iA4pHTSb_2w0PBxeI9reCARVb7HGZ8h4-5mHDGiI9WQuyhXeIHWp43CevozPYsvSM-5FnlAPqrcrKQ8r32Fa6pdOhTYSAIG8HYCJ5AJUuMOUKuc48GaulsXzYqUjujw2',
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
app.use(cookieParser('abcdefg'));
app.use(session());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").__express)
// app.set('view engine', 'ejs');
app.set('view engine', 'html');

app.use(function(req,res,next){ 
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = "";
    if(err){ 
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
    }
    next();
});

app.use('/',routes);
app.use('/login',routes); 
app.use('/smsconfig',routes); // 即为为路径 /home 设置路由
app.use('/logout',routes); // 即为为路径 /logout 设置路由
app.get('/soap/retrieve',activitySOAP.retrieve);
app.get('/soap/temps',activitySOAP.getEmailTmps);
// app.get('/assets', routes.asset);
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
            res.json(body);
        })
})
// get a request from the path
.get(function(req, res) {
    var apiVersion = req.params.v;
    console.log(apiVersion);
    reqAgent.get('https://auth.exacttargetapis.com/'+apiVersion+'/requestToken',function(error, response, body){
        res.json(body);
    })
});

// fetch data api
router.route('/hub/:v/dataevents/key:obj_id/rowset')
// post a request to the path
.post(function(req,res){
    var dataReq = req.body;
    var dataheaders = {'authorization':req.headers.authorization};
    var deKey = req.params.obj_id;
    var apiVersion = req.params.v;
    console.log(req.params);
    console.log(dataheaders);
    console.log(dataReq);
    console.log(deKey);
    console.log(apiVersion);
    reqAgent.post({
            url: 'https://www.exacttargetapis.com/hub/'+apiVersion+'/dataevents/key'+deKey+'/rowset',
            headers: dataheaders,
            body: dataReq,
            json: true
        }, function(error, response, body){
            console.log(error);
            console.log(body);
            res.json(body);
        })
})
// get a request from the path test_Opportunities_Test
.get(function(req, res) {
    var deKey = req.params.obj_id;
    var apiVersion = req.params.v;
    console.log(req.params);
    console.log(deKey);
    console.log(apiVersion);
    reqAgent.get('https://www.exacttargetapis.com/hub/'+apiVersion+'/dataevents/key'+deKey+'/rowset',
            function(error, response, body){
                res.json(body);
            });
});

app.use('/', router);
app.get('/cache',function(req,res){
    res.send(cache.get("test"));
});
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
    // var rule1 = new schedule.RecurrenceRule();  
    // var times1    = [1,6,11,16,21,26,31,36,41,46,51,56];  
    // rule1.second  = times1;  
    // schedule.scheduleJob(rule1, function(){  
    //     console.log('======schedule is running=========');  
    // }); 
});
// app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
