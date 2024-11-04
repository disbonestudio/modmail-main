
const Discord = require("discord.js")
const client = new Discord.Client({intents:[Discord.GatewayIntentBits.Guilds,Discord.GatewayIntentBits.DirectMessages],partials:[Discord.Partials.Channel]})
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const db = require("pro.db")

let GuildId = "1143976452593832077"//ايدي سيرٝرك هنا

client.on("ready", () => {
console.log(client.user.tag)
    client.user.setPresence({
      status: 'idle',
      activities: [{
        name: `I'm ModMail`,
        type: Discord.ActivityType.Playing,
      }]
    })
const commands = [{
name:"setchannel",
description:"Set Admin Channel",
options: [{name:"channel",description:"Channel",type:7,required: true}]
},{
name:"setrole",
description:"Set Admin role",
options: [{name:"role",description:"Role",type:8,required: true}]
},{
name:"unblacklist",
description:"UnBlacklist for users",
options: [{name:"user",description:"User",type:6,required: true}]
}]
const rest = new REST({ version: '10' }).setToken(process.env.token);
(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
  } catch (error) {
    console.error(error);
  }
})();
})
client.on("interactionCreate", async interaction =>{
    if (!interaction.isCommand()) return;
    if (interaction.commandName == "setchannel") {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return await interaction.reply({content:"You don't have permission to use this command",ephemeral:true})
        const channel = interaction.options.getChannel("channel");
        const dbc = db.get(`channel_${interaction.guild.id}`)
        if (dbc == null) {
            db.set(`channel_${interaction.guild.id}`, channel.id)
        }
        await interaction.reply({content:`Set channel to ${channel}`,ephemeral:true})
    }
})
client.on("interactionCreate", async interaction =>{
    if (!interaction.isCommand()) return;
    if (interaction.commandName == "setrole") {
        if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return await interaction.reply({content:"You don't have permission to use this command",ephemeral:true})
        const role = interaction.options.getRole("role");
        const dbr = db.get(`role_${interaction.guild.id}`)
        if (dbr == null) {
            db.set(`role_${interaction.guild.id}`, role.id)
        }
        await interaction.reply({content:`Set Role to ${role}`,ephemeral:true})
    }
})
client.on("interactionCreate", async interaction =>{
    if (!interaction.isCommand()) return;
    if (interaction.commandName == "unblacklist") {
        if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return await interaction.reply({content:"You don't have permission to use this command",ephemeral:true})
        const user = interaction.options.getUser("user");
        let bb = db.get(`blacklist_${user.id}`)
      if(bb) {
        db.delete(`blacklist_${user.id}`)
        await interaction.reply({content:`UnBlackListed ${user}`,ephemeral:true})
      }
      else {
        await interaction.reply({content:`${user} is not blacklisted`,ephemeral:true})
    }}
})
const cooldowns = new Map();
client.on("messageCreate", async message => {
    if(message.channel.type == Discord.ChannelType.DM && !message.author.bot && !db.get(`blacklist_${message.author.id}`)) {
        const guild = await client.guilds.fetch(GuildId);
        const channel = guild.channels.cache.get(db.get(`channel_${guild.id}`));
        const time = cooldowns.get(message.author.id);
let row = new Discord.ActionRowBuilder()
.addComponents(
    new Discord.ButtonBuilder()
    .setCustomId("rr")
    .setLabel("Reply")
    .setEmoji("🗒︝")
    .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
    .setCustomId("dd")
    .setLabel("Delete")
    .setEmoji("🗑︝")
    .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
    .setCustomId("bb")
    .setLabel("BlackList")
    .setEmoji("🔨")
    .setStyle(Discord.ButtonStyle.Secondary)
)
let role = guild.roles.cache.get(db.get(`role_${guild.id}`));
        if (!time || (Date.now() - time) >= 24 * 60 * 60 * 1000) {
        let embed = new Discord.EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("New Message")
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text:message.author.id})
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .addFields(
        { name: "Message:", value: message.content, inline: true },
        { name: "Person : ", value: `${message.author} | \`${message.author.id}\``, inline: false },
        )
        message.reply({content:"تم ارسال رسالتك الي اداره السيرٝر الرجاء انتظار الرد ،"})
        channel.send({content:`${role || "_ _"}`,embeds:[embed],components:[row]});
        const filter = i => i.customId === `dd`;
        const filter2 = i => i.customId === `bb`;

        const collector = channel.createMessageComponentCollector({filter});
        const collector2 = channel.createMessageComponentCollector({filter2});

          collector.on("collect",async i =>{
    if (i.customId === `dd`) {
    if(!i.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return await i.reply({content:"You Can't",ephemeral:true})
      i.message.delete()
      }
    })
    collector2.on("collect",async i =>{
    if (i.customId === `bb`) {
    if(!i.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return  i.reply({content:"You Can't",ephemeral:true})
     db.set(`blacklist_${message.author.id}`, message.author.id)
     row.components[0].setDisabled(true)
     row.components[1].setDisabled(true)
     row.components[2].setDisabled(true)
    await i.update({embeds:[embed],components:[row],content:"This User has been BlackListed"}).then(async ()=>{
         await message.author.send({
             content:"You got BlackListed",
         })
     })
    }
    })
        cooldowns.set(message.author.id, Date.now());
        }
    }
})
const modal = new Discord.ModalBuilder()
.setCustomId('3')
.setTitle(`Reply For Message`)
let gge =  new Discord.TextInputBuilder()
.setCustomId('6')
.setLabel(`Type Your Reply`)
.setStyle(Discord.TextInputStyle.Paragraph)
.setMinLength(1)
.setMaxLength(300)
.setRequired(true)
const First1ee = new Discord.ActionRowBuilder().addComponents(gge);
modal.addComponents(First1ee);
client.on('interactionCreate', async button => {
    if (button.customId == "rr") {
        if(!button.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return await button.reply({content:"You Can't",ephemeral:true})
      button.showModal(modal)
    }
  })
  client.on('interactionCreate', async (modal) => {
    if (modal.customId === '3') {
        const getIdFromFooter = modal.message.embeds[0].footer?.text;
        const getMember = await modal.guild.members.fetch(getIdFromFooter);
        let row = new Discord.ActionRowBuilder()
        .addComponents(
        new Discord.ButtonBuilder()
        .setCustomId("hi")
        .setLabel(`Sent By ${modal.guild.name}`)
        .setDisabled(true)
        .setStyle(Discord.ButtonStyle.Secondary)
        )
        let embed = new Discord.EmbedBuilder()
            .setColor(0x0099ff)
            .setAuthor({ name: modal.user.tag, iconURL: modal.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(modal.user.displayAvatarURL({ dynamic: true }))
            .addFields(
            { name: "Reply:", value: modal.fields.getTextInputValue('6'), inline: true },
            { name: "Moderator: ", value: `${modal.user} | \`${modal.user.id}\``, inline: false },
            )
            await getMember.send({ embeds: [embed],components:[row]});
            modal.reply({content:`Reply sent to ${getMember}`,ephemeral:true}).catch(() => modal.reply({content:`${getMember} Dm is Closed`,ephemeral:true}))
            await modal.message.delete()
    }
})


process.on("unhandledRejection", error => {
return;
});
process.on("rejectionHandled", error => {
return;
});
process.on("uncaughtException", error => {
return;
});



client.login("MTE2NTY5MDI2NDI5MjE3NTg5Mg.GrZGYC.hCcgOF6sbJZfAFs0afrwlJ30dHJ35V6b96fk5k")