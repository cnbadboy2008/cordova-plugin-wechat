var fs = require('fs');

module.exports = function (context) {
    var options = context.opts;
    var projectConfigFile = options.projectRoot + '/config.xml';
    
    var projectIdRegex = /<widget[^>]*\sid=(["'])((?:(?!\1|\s).)+)/i;
    
    var configXml = fs.readFileSync(projectConfigFile, 'utf-8');
    
    var projectId = (configXml.match(projectIdRegex) || [])[2];
    
    if (!projectId) {
        throw new Error('missing project id');
    }
    
    var entryJavaFile = options.plugin.dir + '/src/android/WXEntryActivity.java';
    
    var entryJavaCode = fs.readFileSync(entryJavaFile, 'utf-8');
    
    entryJavaCode = entryJavaCode.replace(/^package .+/m, 'package ' + projectId + '.wxapi;');
    
    var androidSrcDir = options.projectRoot + '/platforms/android/src/';
    var wxapiDir = projectId.replace(/\./g, '/') + '/wxapi/';
    
    var dirPartRegex = /[^\\\/]+[\\\/]*/g;
    var dirPartGroups;
    var dirToCreate = androidSrcDir;
    
    while (dirPartGroups = dirPartRegex.exec(wxapiDir)) {
        dirToCreate += dirPartGroups[0];
        
        if (!fs.existsSync(dirToCreate)) {
            fs.mkdirSync(dirToCreate);
        }
    }
    
    var entryJavaFileTarget = androidSrcDir + wxapiDir + 'WXEntryActivity.java';
    
    fs.writeFileSync(entryJavaFileTarget, entryJavaCode);
};
