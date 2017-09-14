var shell = require('shell');
var fs = require('fs');
var qs = require('querystring');
var pathModule = require('path');
var remote = require("remote");

var utils = require('../utils');

var SettingsView = require('../views/settings-view.js');

module.exports = class SettingsModule {
  static get settingsUri() {return 'atom://forcedotcom-project-settings'};
  static get uriRegex () {return /forcedotcom-project-settings\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i};

  static addOpener(parent) {
    atom.workspace.addOpener(function(uri){
      if(uri.startsWith(SettingsModule.settingsUri)){
        parent.getProjectPath("treeview-project", null, null);
        console.log(parent.root);
        parent.settingsViews[parent.root] = 
          parent.settingsViews[parent.root] || new SettingsView(parent.root);
        var match = null;
        if(SettingsModule.uriRegex.exec(uri)) {
          match = SettingsModule.uriRegex.exec(uri);
          panelName = match[1];
          panelName = panelName[0].toUpperCase() + panelName.slice(1);
          SettingsModule.openPanel(parent.settingsViews[parent.root], panelName, uri, parent.root)
        }
        return parent.settingsViews[parent.root];
      }
    });
  }

  static openPanel(settingsView, panelName, uri, projectPath){
    var match = uriRegex.exec(uri)
    var panel = match[1]
    var detail = match[2]
    var options = {
      "uri" : uri
    }
    //settingsView.showPanel(panelName, options);
  }
}
