define([], function(){   
return {
    "workflowApiVersion": "1.1", 
    "configurationArguments": {
        "save": {
            // "verb": "POST", 
            "url": "https://jen-sfmc.herokuapp.com/sfmcApp/activities/bridge-app/save/", 
            // "headers": "", 
            "body": "", 
            "useJwt": false
        }, 
        "validate": {
            // "verb": "POST", test
            "url": "https://jen-sfmc.herokuapp.com/sfmcApp/activities/bridge-app/validate/", 
            // "headers": "", 
            "body": "", 
            "useJwt": false
        }, 
        "defaults": {}, 
        "applicationExtensionKey": "quJw2wUP0wkUOSACyVhk9HfTBweWAjcIgyvNY-fGCBbW1EFCqEOKZDPlMUIOuaaXae3w-vnEoQf7Vv0Ssz2UR-2eoNhjV5N3NaehzhRsMV-6AQkvZdKHozcWpe87tkX76qBOkq3XDMBqyZ1U4FLJ51hynfBVP38IskUeDvEMMCGDuaURqR7L8_utDbPh6xnF5jk4TTzdE7cG3UBN05zAYfUXwZKSH5Zl8BAt1AvwIcqJT5HFbn837DSbSBcA5g2", 
        "publish": {
            // "verb": "POST", 
            "url": "https://jen-sfmc.herokuapp.com/sfmcApp/activities/bridge-app/publish/", 
            // "headers": "", 
            "body": "", 
            "useJwt": false
        }
    }, 
    "metaData": {
        "version": "2.0", 
        "iconSmall": "https://jen-sfmc.herokuapp.com/images/sms1.png", 
        "icon": "https://jen-sfmc.herokuapp.com/images/sms.png"
    }, 
    "type": "REST", 
    "edit": {
        "width": 500, 
        "url": "https://jen-sfmc.herokuapp.com/sfmcApp/activities/bridge-app/", 
        "height": 400
    }, 
    "lang": {
        "en-US": {
            "description": "SMS/MMS Send", 
            "name": "SMS/MMS Send"
        }
    }, 
    "arguments": {
        "execute": {
            "verb": "POST", 
            "body": "", 
            "timeout": 10000, 
            "inArguments": [ 
                {
                    "emailAddress": "{{InteractionDefaults.Email}}"
                }
            ], 
            "header": "", 
            "url": "http://117.78.44.10:5000/sfmcApp/activities/bridge-app/execute/", 
            "format": "json", 
            "useJwt": false, 
            "outArguments": []
        }
    }
}})