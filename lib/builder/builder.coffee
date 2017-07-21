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
    props = @builder.getProjectParams @root
    console.log props
    conn = undefined
    if props.proxy?[0]?.active
      conn = new (jsforce.Connection)(
        httpProxy: 'http://' + props.proxy[0].user + ':' + props.proxy[0].pass + '@' + props.proxy[0].host + ':' + props.proxy[0].port
        loginUrl: 'https://' + props.creds[0].url
      )
    else
      conn = new (jsforce.Connection)(loginUrl: 'https://' + props.creds[0].url)
    console.log conn.httpProxy
    conn.metadata.pollInterval = props.metadataConfiguration.pollInterval
    conn.metadata.pollTimeout = props.metadataConfiguration.pollTimeout
    projectPath = utils.getSrcPath @root
    retrievePath = pathModule.resolve(utils.getPlatformPath(@root + '/tmp/retrieve/' + Date.now()))
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
          console.log params
          wS = fs.createWriteStream retrieveZip
          wS.on 'finish', =>
            retrieveZip = new Zip(retrieveZip);
            retrieveZip.deleteFile 'package.xml'
            retrieveZip.extractAllTo(projectPath, true)
          conn.metadata.retrieve(
            apiVersion: '39.0'
            singlePackage: true
            unpackaged: types: [params]).stream().pipe(wS)
        else
          selfModule.buildView.buildUnsupported()

  getProjectParams: (root) ->
    propFile = utils.getPlatformPath(root + '/.sftools/project.json')
    result = JSON.parse(fs.readFileSync(propFile, 'utf8'))
    result