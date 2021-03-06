/** @typedef {import("../../main.js")} Client */
/** @typedef {import("../../handlers/economyManager.js")} EconomyManager */
/** @typedef {import("../ExtendedStructures/extendedUserEntry.js")} UserEntry */

/** @typedef {Object} ConditionalVariantContext
 * @prop {String} success The description of the variant when it succeed
 * @prop {String} fail The description of the variant when it failed
 * @prop {Number} successRate The percentage of chances this variant can succeed
 */

/** @typedef {Object} ConditionalVariant
 * @prop {Function} condition The condition for this event to happen, this should be called like `.condition(<ExtendedUserEntry>)` with the extended instance of the user's database entry
 * @prop {String} [success] The description of the variant when it succeed. This won't be present if `context` is present
 * @prop {String} [fail] The description of the variant when it failed. This won't be present if `context` is present
 * @prop {Number} [successRate] The percentage of chances this variant can succeed. This won't be present if `context` is present
 * @prop {ConditionalVariantContext} [context] A function to call like `.context(<UserEntry>)` with the user's database entry that will return the `success`, `fail` and `successRate` properties
 */

/** @typedef {Object} DailyEvent
 * @prop {Number} id The ID of the event
 * @prop {String} message The description of the event
 * @prop {Array<Number>} changeRate An array containing two numbers, the two representing the percentage range this event can affect the gains
 * @prop {String} case A string that can be either `lost` or `won`, representing in what case this event may happen
 * @prop {Array<ConditionalVariant>} conditionalVariants An array of conditional variants this event has
 */

/**
 * 
 * @param {Client} client client
 * @param {EconomyManager} economyManager economyManager
 * @returns {Array<DailyEvent>} daily events
 */
const dailyEvents = (client, economyManager) => {
    return [{
        id: 20000,
        message: 'I forgot how much i have to give you, well here\'s something',
        changeRate: [-30, -40],
        conditionalVariants: [],
    }, {
        id: 20001,
        message: 'I forgot how much i have to give you, well here\'s something',
        changeRate: [30, 40],
        conditionalVariants: [],
    }, {
        id: 20002,
        message: 'A cat run into you and steals `{value}` from your daily holy coins !',
        changeRate: [-40, -60],
        conditionalVariants: [{
            /** 
             * @param {UserEntry} userEntry userEntry
             * @returns {Boolean} true / false
            */
            condition: (userEntry) => userEntry.hasItem(1000),
            success: `A cat runs into you and steals \`{value}\` from your daily holy coins ! But your **${economyManager.getItem(1000).name}** catches it and gets your holy coins back !`,
            fail: `A cat runs into you and steals \`{value}\` from your daily holy coins ! But your **${economyManager.getItem(1000).name}** catches it and... wait, your ${economyManager.getItem(1000).name} got beaten by the cat !`,
            successRate: 75
        }]
    }, {
        id: 20003,
        message: 'A pirate ship attack and steals `{value}` from your daily holy coins !',
        changeRate: [-60, -80],
        conditionalVariants: [{
            /** 
             * @param {UserEntry} userEntry userEntry
             * @returns {Boolean} true / false
            */
            // @ts-ignore
            condition: (userEntry) => userEntry.economy.items.find(i => economyManager.getItem(i.id).data && economyManager.getItem(i.id).data.type === 'Destroyer'),
            /** 
             * @param {UserEntry} userEntry userEntry
             * @returns {ConditionalVariantContext} object
            */
            context: (userEntry) => {
                return {
                    success: `A pirate ship is suspiciously approaching the coast, but as soon as their intent to steal you becomes clear, torpedoes hit their broadside and sink the ship. Those torpedoes were from your **${economyManager.marketItems.filter(i => i.data && i.data.type === 'Destroyer' && userEntry.hasItem(i.id))[client.getRandomNumber(0, economyManager.marketItems.filter(i => i.data && i.data.type === 'Destroyer' && userEntry.hasItem(i.id)).length - 1)].name}** !`,
                    fail: '',
                    successRate: 100
                };
            }
        }, {
            /** 
             * @param {UserEntry} userEntry userEntry
             * @returns {Boolean} true / false
             */
            // @ts-ignore
            condition: (userEntry) => userEntry.economy.items.find(i => economyManager.getItem(i.id).data && economyManager.getItem(i.id).data.type === 'Battleship'),
            /** 
             * @param {UserEntry} userEntry userEntry
             * @returns {ConditionalVariantContext} object
             */
            context: (userEntry) => {
                return {
                    success: `A pirate ship is suspiciously approaching the coast, but as soon as their intent to steal you becomes clear, you hear loud gun fires and notice that they come from your **${economyManager.marketItems.filter(i => i.data && i.data.type === 'Battleship' && userEntry.hasItem(i.id))[client.getRandomNumber(0, economyManager.marketItems.filter(i => i.data && i.data.type === 'Battleship' && userEntry.hasItem(i.id)).length - 1)].name}** ! Her main battery guns instantly sank the pirate ship`,
                    fail: '',
                    successRate: 100
                };
            }
        }]
    }];
};

module.exports = dailyEvents;