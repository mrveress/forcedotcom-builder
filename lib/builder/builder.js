var shell = require('shell');
var fs = require('fs');
var qs = require('querystring');
var pathModule = require('path');
var remote = require("remote");
var utils = require('../utils');
var https = require('https');
var parseXml = require('xml2js').parseString;

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Builder = (function(){
	function Builder(){
	}

	Builder.prototype.retrieveSingleFile = function() {
		//this - is build instanse!
		//console.log(arguments, this);
		var props = this.builder.getProjectParams(this.root);
		console.log(props);

		var options = {
		  hostname: props.credentials[0].url,
		  path: '/services/Soap/u/' + props.apiVersion + '.0',
		  method: 'POST',
		  headers: {
		    'Content-Type': 'text/xml',
		    'SOAPAction': 'login'
		  }
		};

		var req = https.request(options, (res) => {
		  console.log('STATUS: ' +res.statusCode);
		  console.log('HEADERS: ' +JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  var fullResponse = '';
		  res.on('data', (chunk) => {
		    fullResponse += chunk;
		  });
		  res.on('end', () => {
		    parseXml(fullResponse, function (err, result) {
			    console.log(err, result);
			});
		  })
		});

		req.on('error', (e) => {
		  console.log('problem with request: '+e.message);
		});

		// write data to request body
		req.write('<?xml version="1.0" encoding="utf-8" ?>'
					+ '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"'
					+ '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
					+ '    xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">'
					+ '  <env:Body>'
					+ '    <n1:login xmlns:n1="urn:partner.soap.sforce.com">'
					+ '      <n1:username>' + props.credentials[0].username + '</n1:username>'
					+ '      <n1:password>' + props.credentials[0].password + '</n1:password>'
					+ '    </n1:login>'
					+ '  </env:Body>'
					+ '</env:Envelope>'
		);
		req.end();
	}

	Builder.prototype.getProjectParams = function(root) {
		var propFile = utils.getPlatformPath(root + '/.sftools/project.json');
		var result = JSON.parse(fs.readFileSync(propFile, 'utf8'));
		return result;
	}

	return Builder;
})();