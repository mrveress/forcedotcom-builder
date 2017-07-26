shell = require('shell')
fs = require('fs')
qs = require('querystring')
pathModule = require('path')
remote = require('remote')
utils = require('../utils')
jsforce = require('jsforce')
Zip = require("adm-zip")


module.exports = class Builder

  retrieveSingleFile: ->
    selfModule = this
    selfModule.buildView.buildStarted()
    props = @builder.getProjectParams @root
    selfModule.buildView.addMessage 'Retrieving In Progress...', 'text-info'
    selfModule.buildView.addMessage '', 'text-space'
    selfModule.buildView.addMessage 'Root Folder: ' + @root, 'text-info'
    console.log props
    conn = undefined
    if props.proxy?[0]?.active
      conn = new (jsforce.Connection)(
        httpProxy: 'http://' + props.proxy[0].user + ':' + props.proxy[0].pass + '@' + props.proxy[0].host + ':' + props.proxy[0].port
        loginUrl: 'https://' + props.creds[0].url
        logLevel: "DEBUG"
      )
      selfModule.buildView.addMessage 'Proxy URL: ' + 'http://' + props.proxy[0].user + ':' + props.proxy[0].pass + '@' + props.proxy[0].host + ':' + props.proxy[0].port, 'text-info'
    else
      conn = new (jsforce.Connection)(
        loginUrl: 'https://' + props.creds[0].url
        logLevel: "DEBUG"
      )
    selfModule.buildView.addMessage 'Login URL: ' + 'https://' + props.creds[0].url, 'text-info'
    selfModule.buildView.addMessage 'Username: ' + props.creds[0].username, 'text-info'
    selfModule.buildView.addMessage '', 'text-space'
    conn.metadata.pollInterval = props.metadataConfiguration.pollInterval
    conn.metadata.pollTimeout = props.metadataConfiguration.pollTimeout
    projectPath = utils.getSrcPath @root
    retrievePath = pathModule.resolve(utils.getPlatformPath(@root + '/tmp/retrieve/' + Date.now()))
    selfModule.buildView.addMessage 'Retrieving Path: ' + retrievePath, 'text-info'
    selfModule.buildView.addMessage '', 'text-space'
    utils.createFolderRecursive retrievePath
    retrieveZip = utils.getPlatformPath(retrievePath + '/src.zip')
    conn.login props.creds[0].username, props.creds[0].password, (err, res) ->
      if err
        return console.error(err)
      if atom.workspace.getActiveTextEditor()?.buffer?.file?
        filePath = atom.workspace.getActiveTextEditor().buffer.file.path
      if filePath
        fileParams = selfModule.getFileDetails(utils.isWin(), projectPath, filePath)
        console.log(fileParams)
        if fileParams?.metaDataType?
          params = undefined
          if fileParams.metaDataType == 'AuraDefinitionBundle'
            params = { "members" : [fileParams.folderName[1]], "name" : fileParams.metaDataType }
          else if fileParams.metaDataType == 'Document' || fileParams.metaDataType == 'EmailTemplate'
            params = { "members" : [fileParams.fileNameParsed, fileParams.folderName[1]], "name" : fileParams.metaDataType }
          else
            params = { "members" : [fileParams.fileNameParsed], "name" : fileParams.metaDataType }
          params.members.forEach (d, i) ->
            selfModule.buildView.addMessage '- Retrieving Item: ' + params.name + ' | ' + d, 'text-info'
            selfModule.buildView.addMessage '', 'text-space'

          retResLoc = conn.metadata.retrieve(
            apiVersion: props.apiVersion
            singlePackage: true
            unpackaged: types: [params]
          )#.stream().pipe(wS)
          rI = setInterval (() -> selfModule.builder.checkRetrieveStatus(retResLoc, rI, retrieveZip, projectPath, selfModule.buildView)), props.metadataConfiguration.pollInterval
        else
          selfModule.buildView.buildUnsupported()

  getProjectParams: (root) ->
    propFile = utils.getPlatformPath(root + '/.sftools/project.json')
    result = JSON.parse(fs.readFileSync(propFile, 'utf8'))
    result

  checkRetrieveStatus: (retResLoc, rI, retrieveZip, projectPath, buildView) ->
    checkRetrieve = retResLoc.check (err, result) ->
      buildView.addMessage '## Check Status (' + result.id + '): ' + result.state, 'text-info'
      if result.done
        clearInterval rI
        buildView.addMessage '', 'text-space'
        buildView.addMessage '#### Pipe stream to ZIP file...', 'text-info'
        wS = fs.createWriteStream retrieveZip
        wS.on 'finish', =>
          buildView.addMessage '#### Created ZIP file, unpackaging to the src folder...', 'text-info'
          retrieveZip = new Zip(retrieveZip);
          retrieveZip.deleteFile 'package.xml'
          retrieveZip.extractAllTo(projectPath, true)
          buildView.addMessage '', 'text-space'
          buildView.buildFinished true
        retResLoc.stream().pipe(wS)
      else
        console.log result