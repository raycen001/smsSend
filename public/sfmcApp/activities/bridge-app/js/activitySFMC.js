define( function( require ) {

    'use strict';
    
    var Postmonger = require( 'postmonger' );
    // var fetchEmails = require('../fetchEmailTmp/fetchEmailTmp').fetchEmailTmp();
    var $ = require( 'vendor/jquery.min' );


    var connection = new Postmonger.Session();
    var toJbPayload = {};
    var step = 1; 
    var tokens;
    var endpoints;

    $(window).ready(onRender);

    connection.on('initActivity', function(payload) {
        var priority, selectedDE, smsMsg, emailtmp;

        if (payload) {
            toJbPayload = payload;
            // console.log('payload',payload);
            
            //merge the array of objects.
            var aArgs = toJbPayload['arguments'].execute.inArguments;
            var oArgs = {};
            for (var i=0; i<aArgs.length; i++) {  
                for (var key in aArgs[i]) { 
                    oArgs[key] = aArgs[i][key]; 
                }
            }
            //oArgs.priority will contain a value if this activity has already been configured:
            priority = oArgs.model || toJbPayload['configurationArguments'].defaults.model;
            smsMsg = oArgs.smsMsg || toJbPayload['configurationArguments'].defaults.smsMsg;
            emailtmp = oArgs.emailtmp || toJbPayload['configurationArguments'].defaults.emailtmp;
            selectedDE = oArgs.emailAddress.split('.')[2];
        }
        console.log("selectedDE - >  " + selectedDE);
        console.log(" - >  " + toJbPayload['configurationArguments'].defaults);
        console.log(toJbPayload);
        $.ajax( 
            {
                url: "/soap/retrieve", 
                dataType: "json", 
                success: function( data ) {
                    console.info(data);
                    // var datasrctmp = $('#datasrc').val();
                    // console.log('datascrtmp==========>'+ $('#datasrc').val());
                    $('#datasource option').remove();
                    $("#datasource").append("<option value=''>请选择数据源...</option>");
                    for(var i in data){
                        // console.log(data[i]);
                        $("#datasource").append("<option value='"+data[i].key+"'>"+data[i].name+"</option>");
                    }  
                    $('#datasource').find('option[value='+ selectedDE +']').attr('selected', 'selected');
                    // $("#datasource").val(datasrctmp);    
                 }
            }
        ) 
        $.ajax( 
            {
                url: "/soap/temps", 
                dataType: "json", 
                success: function( data ) {
                    console.info(data);
                    // var etmp = $('#etmp').val();
                    // console.log('emailtemp==========>' + $('#etmp').val());
                    $('#emailtemp option').remove();
                    $("#emailtemp").append("<option value=''>邮件模版...</option>");
                    for(var i in data){
                        // console.log(data[i]);
                        $("#emailtemp").append("<option value='"+data[i]+"'>"+data[i]+"</option>");
                    }
                    $('#emailtemp').find('option[value='+ emailtmp +']').attr('selected', 'selected');
                    // $("#emailtemp").val(etmp);
                 }
            }
        )              

        // If there is no priority selected, disable the next button
        if (!priority) {
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }
        $('#smstemp').val(smsMsg);
        $('#selectmodel').find('option[value='+ priority +']').attr('selected', 'selected');
        if ($('#selectmodel').val() == 2) {
                $("#section3").hide();
                $("#section4").show();
            } else if($('#selectmodel').val() == 1){
                $("#section3").show();
                $("#section4").hide();
            } else {
                $("#section3").hide();
                $("#section4").hide();
            }
        
        // for(var s in fetchEmails.fetchTmpNames('templates')){
        //     $('#emailtemp').append("<option value='"+s+"'>"+s+"</option>");
        // }
        
        gotoStep(step);
        
    });

    connection.on('requestedTokens', function(data) {
        if( data.error ) {
            console.error( data.error );
        } else {
            tokens = data;
        }        
    });

    connection.on('requestedEndpoints', function(data) {
        if( data.error ) {
            console.error( data.error );
        } else {
            endpoints = data;
        }        
    });

    connection.on('clickedNext', function() {
        step++;
        console.log('steps: '+ step);
        gotoStep(step);
        connection.trigger('ready');
    });

    connection.on('clickedBack', function() {
        step--;
        gotoStep(step);
        connection.trigger('ready');
    });

    function onRender() {
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if a value isn't selected
        $('#selectmodel').change(function() {
            var priority = getModel();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(priority) });
        });
    };

    function gotoStep(step) {
        $('.step').hide();
        switch(step) {
            case 1:
                $('#step1').show();
                connection.trigger('updateButton', { button: 'next', text: 'next', enabled: Boolean(getModel()) });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;
            case 2:
                $('#step2').show();
                $('#showModel').html($('#selectmodel').find('option:selected').text().trim());
                $('#showDataSource').html($('#datasource').find('option:selected').text().trim());
                $('#showEmail').html($('#emailtemp').find('option:selected').text().trim());
                $('#showSMS').html($('#smstemp').val());
                connection.trigger('updateButton', { button: 'back', visible: true });
                connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
                break;
            case 3: // Only 2 steps, so the equivalent of 'done' - send off the payload
                save();
                break;
        }
    };

    function getModel() {
        return $('#selectmodel').find('option:selected').attr('value').trim();
    };


    function save() {

        var value = getModel();

        // toJbPayload is initialized on populateFields above.  Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property may be overridden as desired.
        //toJbPayload.name = "my activity";

        //this will be sent into the custom activity body within the inArguments array.
        // toJbPayload['arguments'].execute.inArguments.push({"priority": value});
        // {{Contact.Attribute."Huawei_Free15Days_3DaysNotPaid_Opportunity"."customerid"}}
        var inArguments = [], param = '{{Contact.Attribute.<selectedDataExtension>.<selectedMode>}}';
        var selectmodel = $('#selectmodel').val();
        var priorityObj = {'model' : selectmodel};
        inArguments.push(priorityObj);
        inArguments.push({'datasource':$('#datasource').val()});
        param = param.replace('<selectedDataExtension>', $('#datasource').val());
        if(selectmodel == 1) {
            param = param.replace('<selectedMode>', 'email_address');
        }else {
            param = param.replace('<selectedMode>', 'phone');
        }
        var selectedSource = {'emailAddress' : param};
        console.log(selectedSource);
        // var selectedSource = {'emailAddress' : '{{InteractionDefaults.Email}}'}
        // var selectedSource = {'emailAddress' : '{{Contact.Attribute.CSB_Test.emaill_address}}'};
        inArguments.push(selectedSource);
        inArguments.push({'smsMsg':$('#smstemp').val()});
        inArguments.push({'emailtmp':$('#emailtemp').val()});
        console.log(inArguments);
        toJbPayload.arguments.execute.inArguments = inArguments;

        for(var key in toJbPayload.arguments.execute.inArguments) {
           
            console.log(toJbPayload.arguments.execute.inArguments[key]);
        }
        /*
        toJbPayload['metaData'].things = 'stuff';
        toJbPayload['metaData'].icon = 'path/to/icon/set/from/iframe/icon.png';
        toJbPayload['configurationArguments'].version = '1.1'; // optional - for 3rd party to track their customActivity.js version
        toJbPayload['configurationArguments'].partnerActivityId = '49198498';
        toJbPayload['configurationArguments'].myConfiguration = 'configuration coming from iframe';
        */
        
        toJbPayload.metaData.isConfigured = true;  //this is required by JB to set the activity as Configured.
        connection.trigger('updateActivity', toJbPayload);
    };
         
});