etch = require 'etch'
SettingsMarkdown = require './settings-view.markdown'

module.exports =
class SettingsView

  constructor: (root) ->
    @markdown = new SettingsMarkdown();
    @root = root
    @destroyed = false
    console.log root
    etch.initialize this

  update: () ->
    null

  destroy: () ->
    @destroyed = true
    #for name in @panelsByName {
    #  panel = @panelsByName[name]
    #  panel.destroy()
    etch.destroy this

  render: () ->
    @markdown.render()

  showPanel: (panelName, options) ->
    console.log panelName
    console.log options

  getTitle: () ->
    'Settings'

  getIconName: () ->
    'tools'

  getURI: () ->
    @root
