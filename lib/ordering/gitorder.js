 var shell = require('shell');
 var fs = require('fs');
 var qs = require('querystring');
 var pathModule = require('path');
 var remote = require("remote");
 var utils = require('../utils');
 var Directory = require("atom").Directory;
 var TextEditor = require("atom").TextEditor;
 var parseString = require('xml2js').parseString;
 var xml2js = require('xml2js');

module.exports = {
	order : function(initVal) {
		if (initVal instanceof TextEditor) {
			this.orderItem(initVal.getPath());
		} else {
			var $this = this;
			initVal.forEach(function(item, i, arr) {
				console.log(item);
				$this.orderItem(item);
			});
		}
	},
	orderItem : function(fullPath) {
		var extname = pathModule.extname(fullPath);
		var $this = this;
		filePaths = atom.project.relativizePath(fullPath);
		var repo = atom.project.repositoryForDirectory(new Directory(filePaths[0])).then(function(repo) {
			var relativePath = utils.getGitPath(filePaths[1]);
			var headBlob = repo.repo.getHeadBlob(relativePath);
			var currentBlob = fs.readFileSync(utils.getPlatformPath(fullPath)).toString();
			var headObj = null;
			var currentObj = null;
			parseString(headBlob, function (err, result) {
			    headObj = result;
			    parseString(currentBlob, function(err, currentResult){
			    	currentObj = currentResult;
			    	newObj = {};

			    	if (extname == ".permissionset") {
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "applicationVisibilities", "application");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "classAccesses", "apexClass");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "fieldPermissions", "field");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "objectPermissions", "object");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "pageAccesses", "apexPage");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "recordTypeVisibilities", "recordType");
					    $this.mergeItems(headObj, currentObj, "PermissionSet", "tabSettings", "tab");
					} else if (extname == ".labels"){
						$this.mergeItems(headObj, currentObj, "CustomLabels", "labels", "fullName");
					} else if (extname == ".object"){
						$this.mergeItems(headObj, currentObj, "CustomObject", "fields", "fullName");
					} else if (extname == ".objectTranslation"){
						$this.mergeItems(headObj, currentObj, "CustomObjectTranslation", "fields", "name");
					}

				    var builder = new xml2js.Builder({renderOpts: { 'pretty': true, 'indent': '    ', 'newline': '\n' }});
				    var xml = builder.buildObject(currentObj);
				    xml = xml.replace(/\&amp\;apos\;/g, "&apos;").replace(/\&amp\;quot\;/g, "&quot;")

				    var fh = fs.createWriteStream(utils.getPlatformPath(fullPath));
				    fh.write(xml + "\n")
				    fh.end("");
			    });
			});
		});
	},
	mergeItems : function(srcHead, srcCurrent, rootKey, itemsKey, nameKey, handlerItem) {
		currentItems = [];
	    mergerItems = [];
	    newItems = [];
	    srcCurrentItems = srcCurrent[rootKey][itemsKey];
	    srcHeadItems = srcHead[rootKey][itemsKey];
	    if (srcCurrentItems) {
		    for (var i=0; i < srcCurrentItems.length; i++) {
		    	if (handlerItem) {
		    		handlerItem(srcCurrentItems[i]);
		    	}
		        currentItems[srcCurrentItems[i][nameKey][0]] = srcCurrentItems[i];
		    }
		    if (srcHeadItems) {
			    for (var i=0; i < srcHeadItems.length; i++) {
			    	var className = srcHeadItems[i][nameKey][0];
			    	if(Object.keys(currentItems).includes(className)) {
			    		mergerItems.push(className);
			    		newItems.push(currentItems[className]);
			    	}
			    }
			}
		    for (var i=0; i < srcCurrentItems.length; i++) {
		    	var className = srcCurrentItems[i][nameKey][0];
		    	if(!mergerItems.includes(className)) {
		    		newItems.push(currentItems[className]);
		    	}
		    }
		}
	    srcCurrent[rootKey][itemsKey] = newItems;
	}
}