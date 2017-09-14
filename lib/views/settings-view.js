/** @babel */
/** @jsx etch.dom */

var etch = require('etch')

class ChildComponent {
  constructor (props, children) {
    this.props = props
    this.children = children
    etch.initialize(this)
  }

  update(props){
    this.props = props;
    return etch.update(this);
  }

  didChange(event) {
    this.props.login = this.refs.login.value;
    this.props.password = this.refs.password.value;
    this.props.url = this.refs.url.value;
    console.log(this.props);
    //this.update(this.props);
  }

  render () {
    /*return (
      <div>
        <h2>I am a {this.props.adjective} child</h2>
        <h2>And these are *my* children:</h2>
        {this.children}
      </div>
    )*/
    return (
      <div>
        <input type="text" ref="login" class="native-key-bindings" value={this.props.login} on={{keyup: this.didChange}} />
        <input type="text" ref="password" class="native-key-bindings" value={this.props.password} on={{keyup: this.didChange}} />
        <input type="text" ref="url" class="native-key-bindings" value={this.props.url} on={{keyup: this.didChange}} />
      </div>
    );
  }
}

module.exports = class SettingsView {
  constructor(root) {
    this.root = root;
    this.projectName = this.getProjectName();
    this.props = {
      "activeTab" : "creds"
    };
    this.destroyed = false;
    etch.initialize(this)
  }

  render() {
    return (
      <div className='settings-view pane-item' tabIndex='-1'>
        <div className='config-menu' ref='sidebar'>
          <ul className='panels-menu nav nav-pills nav-stacked' ref='panelMenu'>
            <li name="Credentials" onclick={() => this.selectTab("creds")} attributes={{class: (this.props.activeTab == 'creds' ? 'active' : '')}}>
              <a class="icon icon-key">Credentials</a>
            </li>
            <li name="Package" onclick={() => this.selectTab("package")} attributes={{class: (this.props.activeTab == 'package' ? 'active' : '')}}>
              <a class="icon icon-settings">Package</a>
            </li>
            <div className='panel-menu-separator' ref='menuSeparator'></div>
          </ul>
        </div>
        <div className='panels' tabIndex='-1' ref='panels'>
          <div class="panels-item tab-creds" attributes={{style: (this.props.activeTab == 'creds' ? '' : 'display:none;')}}>
            <div class="section view-creds">
              <div class="section-container">
                <h1 class="section-heading icon icon-key">{this.projectName}</h1>
                <h3>Credentials Settings</h3>
              </div>
              <div class="section-container creds-container" ref="credsContainer">
                <ChildComponent login="login hello" password="pass hello" url="url hello" />
              </div>
              <button class="btn btn-danger cancel-btn" on={{click: this.save}}>Save</button>
              <button class="btn btn-danger cancel-btn" on={{click: this.cancel}}>Cancel</button>
            </div>
          </div>
          <div class="panels-item tab-package" attributes={{style: (this.props.activeTab == 'package' ? '' : 'display:none;')}}>
            <div class="section view-package">
              <div class="section-container">
                <h1 class="section-heading icon icon-settings">{this.projectName}</h1>
                <h3>Package Settings</h3>
                <button class="btn btn-danger cancel-btn" on={{click: this.save}}>Save</button>
                <button class="btn btn-danger cancel-btn" on={{click: this.cancel}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  update(props){
    this.props = props;
    return etch.update(this);
  }

  destroy() {
    this.destroyed = true;
    etch.destroy(this);
  }

  selectTab(tabName) {
    this.props.activeTab = tabName;
    this.update(this.props);
  }

  save(event) {
    console.log(event);
    console.log(this);
    this.props.adjective += 'bad';
    this.update(this.props);
  }

  cancel(event) {
    console.log(event);
    console.log(this);
    this.props.adjective += 'bad';
    this.update(this.props);
  }

  getProjectName(){
    var s = this.root.split("/");
    s = s[s.length-1].split("\\");
    return s[s.length-1];
  }

  getTitle(){
    return this.projectName + " - Settings"
  }

  getIconName(){
    return "checklist"
  }

  getURI(){
    return this.root;
  }
}