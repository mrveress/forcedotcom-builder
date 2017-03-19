/** @babel */
/** @jsx etch.dom */

module.exports = class SettingsMarkdown {
  constructor() {}

  mainRender () {
    return (
      <div className='settings-view pane-item' tabIndex='-1'>
        <div className='config-menu' ref='sidebar'>
          <ul className='panels-menu nav nav-pills nav-stacked' ref='panelMenu'>
            <div className='panel-menu-separator' ref='menuSeparator'></div>
          </ul>
        </div>
        <div className='panels' tabIndex='-1' ref='panels'></div>
      </div>
    )
   }

}
