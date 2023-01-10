const { debug, flushDebugLog } = require('@friggframework/logs');
const { get } = require('@friggframework/assertions');
const { ModuleManager } = require('@friggframework/module-plugin');
const { Api } = require('./api');
const { Entity } = require('./entity');
const { Credential } = require('./credential');

// the name used for the entity type, generally
const MANAGER_NAME = 'sharepoint';

class Manager extends ModuleManager {
    static Entity = Entity;
    static Credential = Credential;

    constructor(params) {
        super(params);
    }

    //------------------------------------------------------------
    // Required methods
    static getName() {
        return MANAGER_NAME;
    }

    static async getInstance(params) {
        const instance = new this(params);
        // All async code here

        // initializes the Api
        const sharepointParams = { delegate: instance };

        if (params.entityId) {
            instance.entity = await Entity.findById(params.entityId);
            const credential = await Credential.findById(
                instance.entity.credential
            );
            instance.credential = credential;
            sharepointParams.access_token = credential.accessToken;
            sharepointParams.refresh_token = credential.refreshToken;
        }
        instance.api = new Api(sharepointParams);

        return instance;
    }

    async testAuth() {
        let validAuth = false;
        try {
            if (await this.api.getUserDetails()) validAuth = true;
        } catch (e) {
            flushDebugLog(e);
        }
        return validAuth;
    }

    async getAuthorizationRequirements() {
        return {
            url: await this.api.getAuthUri(),
            type: 'oauth2',
        };
    }

    async processAuthorizationCallback(params) {
        const code = get(params.data, 'code');
        await this.getAccessToken(code);

        // TODO: Save the correct entity with all user details for new Sharepooint users
        const userDetails = await this.api.getUserDetails();

        await this.findOrCreateEntity({
            portalId: userDetails.portalId,
            domainName: userDetails.domain,
        });
        return {
            entity_id: this.entity.id,
            credential_id: this.credential.id,
            type: Manager.getName(),
        };
    }

    async findOrCreateEntity(params) {
        // TODO: update this so we can find users that are sharepoint users
        const portalId = get(params, 'portalId');
        const domainName = get(params, 'domainName');
        console.log('JON >>> 3', 3);

        const search = await Entity.find({
            user: this.userId,
            externalId: portalId,
        });
        if (search.length === 0) {
            // validate choices!!!
            // create entity
            const createObj = {
                credential: this.credential.id,
                user: this.userId,
                name: domainName,
                externalId: portalId,
            };
            this.entity = await Entity.create(createObj);
        } else if (search.length === 1) {
            this.entity = search[0];
        } else {
            debug('Multiple entities found with the same portal ID:', portalId);
            this.throwException('');
        }
    }

    //------------------------------------------------------------

    async deauthorize() {
        // wipe api connection
        this.api = new Api();

        // delete credentials from the database
        const entity = await Entity.findByUserId(this.userId);
        if (entity.credential) {
            await Credential.delete(entity.credential);
            entity.credential = undefined;
            await entity.save();
        }
        this.credential = undefined;
    }

    async getAccessToken(code) {
        return this.api.getTokenFromCode(code);
    }
}

module.exports = Manager;
