const   Discord = require('discord.js'),
        client = new Discord.Client(),
        config = require('./src/data/config.json'),
        CacheService = require('./src/cache/cache'),
        content = require('./src/module/content');

// Init Cache in client
client.cache = new CacheService(10); 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ game: { name: '@Wavenger n\'importe où pour lancer l\'interface', type:"STREAMING", url:"https://www.twitch.tv/yugeo_"} })
});

client.on('message', async msg => {
    // Rapid check
    if (msg.author.bot) return;
    if (msg.content !== `<@${client.user.id}>`) return;

    // Send Base Message
    content.sendBaseMessage(Discord, msg);
    msg.delete();
});

client.on('raw', async info => {
    if (info.t !== "MESSAGE_REACTION_ADD") return;
    await client.users.get(info.d.user_id).createDM();
    let channel = await client.channels.get(info.d.channel_id),
        message = await channel.fetchMessage(info.d.message_id),
        user = await client.users.get(info.d.user_id),
        emoji = info.d.emoji,
        reaction = {channel: channel, message: message, user: user, emoji: emoji};

    // Rapid Check
    if (user.bot) return;
    if (message.author.id !== client.user.id) return;

    if (client.cache.get(message.id)) {
        await client.cache.del(message.id);
    }

    // Is return ?
    content.isReturn(Discord, reaction);

    // Is Hero Icon ?
    content.isHero(Discord, client, reaction);

    // Is Weapon Icon ?
    content.isWeapon(Discord, client, reaction);
})

client.login(process.env.TOKEN);