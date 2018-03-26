'use strict';
var FuelSoap = require('fuel-soap');

var APIKeys = {
    clientId        : '7qbecky52s3x1x4x1pgxwvh9',
    clientSecret    : 'bCZ0YEgPK5akWiII6hPkMQ39',
    soapEndpoint    : 'https://webservice.s10.exacttarget.com/Service.asmx',
    dataExtension   : '',
    customerKey     : '',
};

var options = {
  auth: {
    clientId: APIKeys.clientId,
    clientSecret: APIKeys.clientSecret
  }
  , soapEndpoint: APIKeys.soapEndpoint
};

var SoapClient = new FuelSoap(options);

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.retrieve = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.

    initRetrieve(req,res);
};

exports.create = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    console.log( req.body );
    
    initCreate(req, res);
};

function initCreate(req,res)
{
    var properties = [];
    var keys = [];

    if(req.body.Key)
    {
        keys.push({"Key":{"Name":"Key","Value":req.body.Key}});
    }

    if(req.body.Name)
    {
        properties.push({"Name":"Name","Value":req.body.Name});
    }

    if(req.body.Email)
    {
        properties.push({"Name":"Email","Value":req.body.Email});
    }

    var co = {
        "CustomerKey": APIKeys.customerKey,
        "Keys":keys,
        "Properties":
            {"Property": properties},
    };

    var uo = {
        SaveOptions: [{"SaveOption":{PropertyName:"*",SaveAction:"UpdateAdd"}}]
    };

    SoapClient.update('DataExtensionObject',co,uo, function(err, response){
    if(err){
        res.send( 500, "Update Fail");
        console.log(err);
    }
    else{
        console.log(response.body.Results);
        res.send( 200, "Update Success");
    }
    });
}

function initRetrieve(req,res) {
    var fields = [];
    var results = [];
  
    var options = {
        filter: {
            leftOperand: 'DataExtension.Name',
            operator: 'like',
            rightOperand: 'CSB_%'
        }

    };

    SoapClient.retrieve(
        'DataExtension',
        ["Name","customerKey"],
        options,
        function( err, response ) {
            if ( err ) {
                // error here
                console.log( err );
                return;
            }

            if(response.body.OverallStatus == 'OK')
            {
                for (var i = 0, len = response.body.Results.length; i < len; i++) {
                    var obj = response.body.Results[i];
                    console.log('========obj============');
                    console.log(obj.PartnerProperties);
                    var nameObj = obj.Name;
                    var key = obj.PartnerProperties.Value;
                    fields.push({name:nameObj, key:key});
                }
            }
            res.json(fields);
        }
    );
};
