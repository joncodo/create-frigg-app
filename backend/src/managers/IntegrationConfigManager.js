const { Options } = require('@friggframework/integrations');
const SalesforceManager = require('./entities/SalesforceManager');
const SharePointManager = require('./entities/SharePointManager');
const HubSpotManager = require('./entities/HubSpotManager');
const ConnectWiseManager = require('./entities/ConnectWiseManager');

// Entities that we are going to use for integration for this particular app
class IntegrationConfigManager {
    constructor(params) {
        this.primary = ConnectWiseManager;
        this.options = [
            // new Options({
            //     module: SharePointManager,
            //     integrations: [ConnectWiseManager],
            //     display: {
            //         name: 'SharePoint',
            //         description: 'Company SharePoint',
            //         category: 'My New Category',
            //         detailsUrl: 'https://sharepoint.com',
            //         icon: 'https://friggframework.org/assets/img/sharepoint.jpeg',
            //     },
            // }),
            new Options({
                module: SalesforceManager,
                integrations: [ConnectWiseManager],
                display: {
                    name: 'Salesforce',
                    description: 'Sales & CRM',
                    category: 'Sales & CRM',
                    detailsUrl: 'https://salesforce.com',
                    icon: 'https://friggframework.org/assets/img/salesforce.jpeg',
                },
            }),
            new Options({
                module: HubSpotManager,
                integrations: [ConnectWiseManager],
                display: {
                    name: 'HubSpot',
                    description: 'Sales & CRM',
                    category: 'Sales & CRM',
                    detailsUrl: 'https://salesforce.com',
                    icon: 'https://friggframework.org/assets/img/hubspot.jpeg',
                },
                categories: [
                    'Marketing',
                    'Sales',
                    'CMS',
                    'Marketing Automation',
                ],
                name: 'hubspot',
                label: 'HubSpot',
                productUrl: 'https://hubspot.com',
                apiDocs: 'https://developers.hubspot.com',
                logoUrl: 'https://friggframework.org/assets/img/hubspot.jpeg',
                description:
                    'HubSpot is an all-in-one Marketing and Sales solution for scaling companies',
            }),
        ];
    }

    async getIntegrationOptions() {
        return {
            entities: {
                primary: this.primary.getName(),
                options: this.options.map((val) => val.get()),
                authorized: [],
            },
            integrations: [],
        };
    }
}

module.exports = IntegrationConfigManager;
