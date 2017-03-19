shell = require 'shell'
fs = require 'fs'
qs = require 'querystring'
pathModule = require 'path'
remote = require "remote"

utils = require '../utils'

SettingsView = require '../views/settings-view'

settingsUri = 'atom://forcedotcom-project-settings'
uriRegex = /forcedotcom-project-settings\/([a-z]+)\/?([a-zA-Z0-9_-]+)?/i
settingsViews = {}

openPanel = (settingsView, panelName, uri, projectPath) ->
  match = uriRegex.exec(uri)
  panel = match?[1]
  detail = match?[2]
  options = uri: uri
  settingsView.showPanel(panelName, options)

module.exports =
class SettingsModule

  constructor: (parent) ->
    @parent = parent;

    atom.workspace.addOpener (uri) =>
      if uri.startsWith(settingsUri)
      @parent.getProjectPath("treeview-project", null, null)
      console.log @parent.root
      if not settingsViews[@parent.root]? or settingsViews[@parent.root].destroyed
        settingsViews[@parent.root] = new SettingsView(@parent.root)
      if match = uriRegex.exec(uri)
        panelName = match[1]
        panelName = panelName[0].toUpperCase() + panelName.slice(1)
        openPanel(settingsViews[@parent.root], panelName, uri, @parent.root)
      settingsViews[@parent.root]

    atom.commands.add 'atom-workspace',
      'force.com:credentials-management': -> atom.workspace.open(settingsUri);
