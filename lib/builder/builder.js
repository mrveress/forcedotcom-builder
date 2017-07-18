var shell = require('shell');
var fs = require('fs');
var qs = require('querystring');
var pathModule = require('path');
var remote = require("remote");
var utils = require('../utils');

var jsforce = require('jsforce');

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Builder = (function(){
	function Builder(){
	}

	Builder.prototype.retrieveSingleFile = function() {
		//this - is build instanse!
		//console.log(arguments, this);
		var props = this.builder.getProjectParams(this.root);
		console.log(props);

		var conn;
		if (props.proxy && props.proxy[0] && props.proxy[0].active) {
			conn = new jsforce.Connection({
				httpProxy: 
					'http://' + props.proxy[0].user 
					+ ':' + props.proxy[0].pass
					+ '@' + props.proxy[0].host
					+ ':' + props.proxy[0].port,
				loginUrl : 
					'https://' + props.creds[0].url
				//,logLevel: "DEBUG"
			});
		} else {
			conn = new jsforce.Connection({loginUrl : 'https://' + props.creds[0].url});
		}
		var retrievePath = pathModule.resolve(utils.getPlatformPath(this.root + '/tmp/retrieve/' + Date.now()));
		utils.createFolderRecursive(retrievePath);
		var retrieveZip = utils.getPlatformPath(retrievePath + '/retrieve.zip');
		conn.login(props.creds[0].username, props.creds[0].password, function(err, res) {
		  if (err) { return console.error(err); }
		  /*conn.query('SELECT Id, Name FROM Account', function(err, res) {
		    if (err) { return console.error(err); }
		    console.log(res);
		  });*/
		  conn.metadata.retrieve({
		  	apiVersion: '39.0',
		  	singlePackage: true,
		  	unpackaged : {
		  		types : [{
		  			'members': ['*'],
		  			'name' : 'ApexClass'
		  		}]
		  	}
		  }).stream().pipe(fs.createWriteStream(retrieveZip));
		});
	}

	Builder.prototype.getProjectParams = function(root) {
		var propFile = utils.getPlatformPath(root + '/.sftools/project.json');
		var result = JSON.parse(fs.readFileSync(propFile, 'utf8'));
		return result;
	}

	return Builder;
})();