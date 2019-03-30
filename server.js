const   Discord = require('discord.js'),
        client = new Discord.Client(),
        config = require('./src/data/config.json'),
        CacheService = require('./src/cache/cache'),
        content = require('./src/module/content');

const dotenv = require('dotenv');
dotenv.config();

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

    if (msg.deletable) msg.delete();

    let date = new Date();
    console.log(`${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${msg.author.username} a ping le bot depuis ${msg.guild ? "le discord: " + msg.guild.name : "ses messages privés"}`);
});

client.on('raw', async info => {
    if (info.t !== "MESSAGE_REACTION_ADD") return;

    let user = await client.users.get(info.d.user_id),
        channel = await client.channels.get(info.d.channel_id)

    if (!channel) channel = await client.users.get(info.d.user_id).createDM();
    
    let message = await channel.fetchMessage(info.d.message_id),
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

    let date = new Date();
    console.log(`${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${user.username} a utilisé la reaction ${emoji.name}`);
})

client.login(process.env.TOKEN);