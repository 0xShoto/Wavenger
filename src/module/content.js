/**
 * Includes
 */
const   config = require('../data/config.json'),
        base = require(`../data/${config.lang}/base.json`);

/**
 * Functions
 */
const Content = {

    async setCache(client, message, type) {
        client.cache.set(message.id, type);
    },

    /**
     * get Base Message
     * @param {*} Discord 
     */
    async getBaseMessage(Discord) {
        let embed = {
            "author": {
                "name": base.title,
                "icon_url": base.icon_min
            },
            "description": base.desc + "\n\u200B",
            "footer": {
                "text": base.footer.base
            },
            "fields": [],
            "color": 11206655
        }

        base.heros.forEach(h => {
            embed.fields.push({
                "name": h.icon + " \u200B " + h.name,
                "value": "\u200B",
                "inline": true
            })
        })
        
        return embed;
    },
    /**
     * React Emoji Base Message on Message
     * @param {*} message 
     */
    async emojiBaseMessage(message) {
        for ( i = 0 ; base.heros.length > i ; i++ ) {
            await message.react(base.heros[i].icon);
        }
    },
    /**
     * Send Base Message
     * @param {*} Discord 
     * @param {*} message 
     */
    async sendBaseMessage(Discord, message) {
        // Get Interface
        let embed = await this.getBaseMessage(Discord);
        // Send Message
        let channel = await message.author.createDM()
        let newMessage = await channel.send({embed});
        // Emoji
        this.emojiBaseMessage(newMessage);
    },
    /**
     * Change Message to a Base Message
     * @param {*} Discord 
     * @param {*} message 
     * @param {*} reaction 
     */
    async editBaseMessage(Discord, message, reaction) {
        // Clear Reaction
        await reaction.message.delete();
        // Get Interface
        let embed = await this.getBaseMessage(Discord);
        // Send Message
        let newMessage = await reaction.channel.send({embed});
        // Emoji
        await this.emojiBaseMessage(newMessage);
    },


    /**
     * Get Hero Message
     * @param {*} Discord 
     * @param {*} hero 
     */
    getHeroMessage(Discord, hero) {
        const embed = new Discord.RichEmbed()
            .setAuthor(hero.name, hero.img)
            .setDescription(hero.desc)
            .setThumbnail(hero.img)
            .setFooter(base.footer.hero)
        
        return embed;
    },
    /**
     * React with Emoji Hero in Message
     * @param {*} client 
     * @param {*} message 
     * @param {*} hero 
     */
    async emojiHeroMessage(client, message, hero) {
        this.setCache(client, message, hero.name);

        await message.react(base['back-icon']);

        if (!hero.weapons) return;

        for ( i = 0 ; hero.weapons.length > i ; i++) {
            let emoji = await client.guilds.get(base["id-guild-icon"]).emojis.get(hero.weapons[i].icon);

            if (hero.weapons[i].icon && hero.weapons[i].name !== message.embeds[0].author.name) {
                if (client.cache.get(message.id)) {
                    await message.react(emoji);
                } else {
                    break;
                }
            }
        }
    },
    /**
     * Edit for a Hero Message
     * @param {*} Discord 
     * @param {*} client 
     * @param {*} hero 
     * @param {*} message 
     * @param {*} reaction 
     */
    async heroMessage(Discord, client, hero, message, reaction) {
        // Clear Reaction
        await reaction.message.delete();
        // Get Hero Message
        let embed = await this.getHeroMessage(Discord, hero);
        // Edit Message
        let newMessage = await reaction.channel.send({embed});
        // React to the Message
        await this.emojiHeroMessage(client, newMessage, hero);
    },

    async getWeaponMessage(Discord, weapon, hero) {
        let embed = {
            "author": {
                "name": weapon.name,
                "icon_url": hero.img
            },
            "thumbnail": {
                "url": weapon.img
            },
            "footer": {
                "text": base.footer.weapon
            },
            "fields": []
        }

        if (weapon.color) {
            embed.color = weapon.color;
        }

        if (weapon.action) {
            embed.description = `\u200B\n**`+
                                `${base.action_icon.attack} ${weapon.action.attack} ${base.action_icon.separator} `+
                                `${base.action_icon.life} ${weapon.action.life} ${base.action_icon.separator} `+
                                `${base.action_icon.pm} ${weapon.action.pm}` +
                                `**\n\u200B`;
        }

        if (weapon.passif) {
            embed.fields.push({
                "name": "- Passif de l'arme", 
                "value": weapon.passif
            });
        }

        if (weapon.spell) {
            embed.fields.push({
                "name": "- " + `${weapon.spell.name} | ${weapon.spell.pa} PA`, 
                "value": weapon.spell.desc
            });
        }

        if (weapon.infos) {
            embed.fields[embed.fields.length - 1].value += "\n\u200B";
            weapon.infos.forEach(i => {
                embed.fields.push({
                    "name": "- " + base.infos[i].name, 
                    "value": base.infos[i].value
                });
            });
        }
        
        return embed;
    },
    async weaponMessage(Discord, client, reaction, weapon, hero) {
        reaction.channel.startTyping();

        // Clear Reaction
        await reaction.message.delete();
        // Get Weapon Message
        let embed = await this.getWeaponMessage(Discord, weapon, hero);
        // Edit Message
        let newMessage = await reaction.channel.send({embed});
        // React to the Message
        await this.emojiHeroMessage(client, newMessage, hero);

        reaction.channel.stopTyping();
    },

    /**
     * Check if is Hero react
     * @param {*} Discord 
     * @param {*} client 
     * @param {*} reaction 
     */
    async isHero(Discord, client, reaction) {
        let hero = base.heros.find(h => h.icon === reaction.emoji.name);
        
        hero ?
        // True
        this.heroMessage(Discord, client, hero, reaction.message, reaction)
        // False
        : null;
    },
    /**
     * Check if is Weapon react
     * @param {*} Discord 
     * @param {*} client 
     * @param {*} reaction 
     */
    async isWeapon(Discord, client, reaction) {
        if (reaction.emoji.name === base['back-icon']) return;

        let text = reaction.message.embeds[0].footer.text;
        if (text !== base.footer.hero && text !== base.footer.weapon) return;

        let hero = await base.heros.find(h => h.img === reaction.message.embeds[0].author.iconURL),
            weapon = await hero.weapons.find(w => w.icon === reaction.emoji.id);

        this.weaponMessage(Discord, client, reaction, weapon, hero);
    },
    /**
     * Check if is Return react
     * @param {*} Discord 
     * @param {*} reaction 
     */
    async isReturn(Discord, reaction) {
        if (reaction.emoji.name !== base['back-icon']) return;

        // Edit Message
        this.editBaseMessage(Discord, reaction.message, reaction);
    }
}

module.exports = Content;