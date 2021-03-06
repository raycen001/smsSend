'use strict';
var util = require( 'util' );

// Deps
var util = require( 'util' );

exports.logExecuteData = [];

function logData( req ) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
        console.log( "body: " + util.inspect( req.body ) );
        console.log( "headers: " + req.headers );
        console.log( "trailers: " + req.trailers );
        console.log( "method: " + req.method );
        console.log( "url: " + req.url );
        console.log( "params: " + util.inspect( req.params ) );
        console.log( "query: " + util.inspect( req.query ) );
        console.log( "route: " + req.route );
        console.log( "cookies: " + req.cookies );
        console.log( "ip: " + req.ip );
        console.log( "path: " + req.path );
        console.log( "host: " + req.host );
        console.log( "fresh: " + req.fresh );
        console.log( "stale: " + req.stale );
        console.log( "protocol: " + req.protocol );
        console.log( "secure: " + req.secure );
        console.log( "originalUrl: " + req.originalUrl );
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( req.body );
    logData( req );
    res.send( 200, 'Edit' );
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( "=================from save method start=====================" );
    console.log( req.body );
    console.log( "=================from save method end=====================" );
    // logData( req );
    res.send( 200, 'Save' );
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function( req, res ) {
    var beginTime = +new Date();
    // Data from the req and put it in an array accessible to the main app.
    console.log( "=================from execute method start=====================" );
    console.log( req.body );
    console.log( "=================from execute method end=====================" );
    
    // Log the req body into a txt log
    var fs = require('fs');
    var ws1 = fs.createWriteStream('errorlog.txt');
    var dt = new Date();
    ws1.write(new Buffer(dt + '***********' + req.body, 'utf-8'));
    ws1.end();

    // logData( req );
    res.send( 200, 'Execute' );
    var endTime = +new Date();
    console.log("executed time =======" +(endTime-beginTime)+"ms");
};

/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( "=================from publish method start=====================" );
    console.log( req.body );
    console.log( "=================from publish method end=====================" );
    // logData( req );
    res.send( 200, 'Publish' );
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( "=================from validate method start=====================" );
    console.log( req.body );
    console.log( "=================from validate method end=====================" );
    // logData( req );
    res.send( 200, 'Validate' );
};
