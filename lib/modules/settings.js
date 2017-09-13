var shell = require('shell');
var fs = require('fs');
var qs = require('querystring');
var pathModule = require('path');
var remote = require("remote");
var _ = require("lodash");

var utils = require('../utils');

var SettingsView = require('../views/settings-view');

module.exports = class SettingsModule {
  static get settingsUri() {return 'atom://forcedotcom-project-settings'};
  static get uriRegex () {return /forcedotcom-project-settings\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i};

  static addOpener(parent) {
    atom.workspace.addOpener(function(uri){
      if(uri.startsWith(SettingsModule.settingsUri)){
        parent.getProjectPath("treeview-project", null, null);
        console.log(parent.root);
        parent.settingsViews[parent.root] = 
          parent.settingsViews[parent.root] || new SettingsView();
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
    var element = document.createElement('div')
    var modalPanel = atom.workspace.addModalPanel({
      "item": element, "visible": true
    });
    (new (require('vue').extend({
      template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p><div id="editor" class="settings-view"><textarea :value="input" @input="update"></textarea><div v-html="compiledMarkdown"></div></div>',
      data: function(){
        return {
          firstName: 'Walter',
          lastName: 'White',
          alias: 'Heisenberg',
          input: '# hello'
        }
      },  
      computed: {
        compiledMarkdown: function () {
          return marked(this.input, { sanitize: true })
        }
      },
      methods: {
        update: _.debounce(function (e) {
          this.input = e.target.value
        }, 300)
      }
    }))).$mount(element)
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
