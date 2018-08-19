const Endpoints = require('../node_modules/eris/lib/rest/Endpoints');
/** @typedef {import("../structures/ExtendedStructures/ExtendedUser")} ExtendedUser 
 * @typedef {import("../main.js")} Client   
 * @typedef {import("eris").PermissionOverwrite} PermissionOverwrite
 * @typedef {import("eris").Member} Member
 * @typedef {import("eris").User} User 
 * @typedef {import("../structures/ExtendedStructures/ExtendedMessage").ExtendedMessage} ExtendedMessage
 * @typedef {import("eris").Message} Message
 * @typedef {import("eris").TextChannel} TextChannel
 * @typedef {import("eris").VoiceChannel} VoiceChannel
*/

class Helpers {
    /**
     * 
     * @param {Client} client - The client instance
     */
    constructor(client) {
        /** @type {Client} */
        this.client = client;
    }

    /**
     * 
     * @param {String} id - The ID of the user to fetch
     * @returns {ExtendedUser} The user, or null if none was resolved
     */
    fetchUser(id) {
        const cachedUser = this.client.bot.users.get(id);
        if (cachedUser) {
            return (cachedUser ? (cachedUser instanceof this.client.structures.ExtendedUser) : false) ? cachedUser : new this.client.structures.ExtendedUser(cachedUser, this.client);
        } else {
            return this.client.bot.requestHandler.request('GET', Endpoints.USER(id), true)
              .catch(e => {
                if (e.message.includes('Unknown User')) {
                  return null;
                }
              }).then(u => {
                  if (!u) {
                      return u;
                  }
                  const newUser = new this.client.structures.ExtendedUser(u, this.client);
                  this.client.bot.users.set(id, newUser);
                  return newUser;
              });
          }
    }

    /**
     * Censor the critical credentials (token and such) from the given text
     * @param {String} text - The text from which to replace all credentials
     * @returns {String} The redacted text
     */
    redact(text) {
        let credentials = [this.client.config.token, this.client.config.database.host];
        const secondaryCredentials = [
            this.client.config.apiKeys.sentryDSN, 
            this.client.config.database.password, 
            this.client.config.apiKeys.weebSH
        ];
        for (const node of this.client.config.options.music.nodes) {
            secondaryCredentials.push(node.password, node.host);
        }
        for (const botList in this.client.config.botLists) {
            if (this.client.config.botLists[botList].token) {
                secondaryCredentials.push(this.client.config.botLists[botList].token);
            }
        }
        for (const value of secondaryCredentials) {
            if (value) {
                credentials.push(value);
            }
        }
        const credentialRX = new RegExp(
            credentials.join('|'),
            'gi'
        );
    
        return text.replace(credentialRX, 'baguette');
    }

    /**
     * Check if the bot has the given permissions to work properly
     * This is a deep check and the channels wide permissions will be checked too
     * @param {Message | ExtendedMessage} message - The message that triggered the command
     * @param {Member | User | ExtendedUser} target  - The user from whose permissions should be checked
     * @param {Array<String>} permissions - An array of permissions to check for
     * @param {VoiceChannel | TextChannel} [channel=message.channel] - Optional, a specific channel to check perms for (to check if the bot can connect to a VC for example), defaults to the message's channel
     * @returns {Boolean | Array<String>} - An array of permissions the bot miss, or true if the bot has all the permissions needed, sendMessages permission is also returned if missing
     */
    hasPermissions(message, target, permissions, channel = message.channel) {
        const missingPerms = [];
        // @ts-ignore
        const member = target.guild ? target : message.channel.guild.members.get(target.id);
        function hasPerm(perm) {
            if (member.permission.has("administrator")) {
                return true;
            }
            const hasChannelOverwrite = this.hasChannelOverwrite(channel, member, perm);
            if (!member.permission.has(perm)) {
                if (!hasChannelOverwrite) {
                    return false;
                } else {
                    return hasChannelOverwrite.has(perm) ? true : false;
                }
            } else {
                if (!hasChannelOverwrite) {
                    return true;
                } else {
                    return hasChannelOverwrite.has(perm) ? true : false;
                }
            }
        }
        hasPerm = hasPerm.bind(this);
        permissions.forEach(perm => {
            if (!hasPerm(perm)) {
                missingPerms.push(perm);
            }
        });
        if (!permissions.includes('sendMessages') && !hasPerm('sendMessages')) {
            missingPerms.push('sendMessages');
        }
        return missingPerms[0] ? missingPerms : true;
    }

    /**
     * This method return the effective permission overwrite for a specific permission of a user
     * It takes into account the roles of the member, their position and the member itself to return the overwrite which actually is effective
     * @param {TextChannel | VoiceChannel} channel - The channel to check permissions overwrites in
     * @param {Member} member - The member object to check permissions overwrites for
     * @param {String} permission - The permission to search channel overwrites for
     * @return {Boolean | PermissionOverwrite} - The permission overwrite overwriting the specified permission, or false if none exist
     */
    hasChannelOverwrite(channel, member, permission) {
        const channelOverwrites = Array.from(channel.permissionOverwrites.values()).filter(co => typeof co.json[permission] !== "undefined" &&
            (co.id === member.id || member.roles.includes(co.id)));
        if (!channelOverwrites[0]) {
            return false;
        } else if (channelOverwrites.find(co => co.type === "user")) {
            return channelOverwrites.find(co => co.type === "user");
        }
        return channelOverwrites
            //Address issue #45(https://github.com/ParadoxalCorp/felix-production/issues/45)
            .filter(co => channel.guild.roles.has(co.id))
            .sort((a, b) => channel.guild.roles.get(b.id).position - channel.guild.roles.get(a.id).position)[0];
    }
}

module.exports = Helpers;