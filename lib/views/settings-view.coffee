Vue = require('vue')

SettingsViewExtend = Vue.extend({
  template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
  data: ->
    {
      firstName: 'Walter'
      lastName: 'White'
      alias: 'Heisenberg'
    }
})

module.exports = class SettingsView
  constructor:(path)->
    @path = path;
    
  getElement: ()->
    el = document.createElement('span');
    (new SettingsViewExtend()).$mount(el);
    el
 
  getTitle: ()->
    "lol"
    
  getIconName: ()->
    "kek"
  
  getURI:()->
    @path
