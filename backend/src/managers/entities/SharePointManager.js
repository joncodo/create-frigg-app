const { ModuleManager } = require('../../../api-module-sharepoint');

console.log('JON >>> ModuleManager', ModuleManager)
class SharePointManager extends ModuleManager {
    constructor(params) {
        return super(params);
    }
}

module.exports = SharePointManager;
