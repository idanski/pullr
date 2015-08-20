var fs            = require('fs');
var prompt        = require('prompt');
var colors        = require('colors');
var request       = require('request');
var cacheFileName = process.env.HOME + "/.pullr-token-cache";
var package       = require('../package.json');

// Hash map of Github Error messages
var gh_errors = {
  bad_credentials: /bad credential/i,
  validation_fail: /validation fail/i,
  oauthaccess:     /oauthaccess/i,
  already_exist:   /already.+exist/i
};

function hasAuthToken(forceLogin, cb) {
  fs.readFile(cacheFileName, 'utf8', function(err, d) {
    if (err) {
      cb(err);
    } else if (forceLogin || d === undefined) {
      cb(null, false);
    } else {
      cb(null, JSON.parse(d));
    }
  });
}

function get(forceLogin, cb) {
  hasAuthToken(forceLogin, function(err, authToken) {
    if (authToken) {
      cb(null, authToken);
    } else {
      getAuthToken(function(err, token) {
        if (err) {
          cb(err);
        } else {
          fs.writeFile(cacheFileName, JSON.stringify(token), function(err, d) {
            if (err) {
              cb(err);
            } else  {
              cb(null, token);
            }
          })
        }
      });
    }
  });

  function getAuthToken(cb) {
    prompt.start();
    promptSchema = {
      properties : {
        email    : {
          required    : true,
          description : ' Email:'
        },
        token : {
          hidden      : true,
          required    : true,
          description : ' Access Token:'
        }
      }
    }

    prompt.message   = "";
    prompt.delimiter = "";

    console.log(" Please Enter Your GitHub Credentails ".yellow.inverse);
    prompt.get(promptSchema, function(err, credentials) {
      return cb(null, credentials);
    });
  }
}


module.exports = {
  get: get,
  hasAuthToken: hasAuthToken
};
