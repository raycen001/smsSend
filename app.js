'use strict';
//test
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
var session = require('express-session');
var bodyParser  = require('body-parser');
var routes = require('./routes/index');
var activity = require('./routes/activity');
var activitySOAP = require('./routes/sfmcSOAP');
var pkgjson = require( './package.json' );
var router = express.Router(); 
var reqAgent = require('request');

var PORT = process.env.PORT || 5000

var app = express();
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
// get a request from the path Huawei_Opportunities_Test
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
