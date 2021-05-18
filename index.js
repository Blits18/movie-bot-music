/**
 * Module Imports
 */
const Discord = require('discord.js');
const express = require("express");
const app = express();
const bot = new Discord.Client();

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}, basic discord bot template -by Blits16`);
});

function keepAlive() {
  server.listen(3000, () => { console.log("Server is Ready!!" + Date.now()) });
}

bot.on('message', msg => {
  if (msg.content === '!help') {
    msg.channel.send('**Help Commands** \n `!boop` - Boop boop beep beep? \n `!hello` - The bot say hi for you! \n `!hey` - lol');
  }
    if (msg.content === '!hello') {
    msg.reply('hi!');
  }
  if (msg.content === '!boop') {
    msg.channel.send('**Beep!** 🤖');
  }
  if (msg.content === '!hey') {
  msg.channel.send('lol'); 
  }
  //make your own command if you want, no need to be like these commands lol.
});

require('./server')();
bot.login('ODQxNjY0NzgwMTkyNTc5NjM0.YJqDaA.dXPaqjfrHWPHbHcKmFcRtQeVn6Q');

const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX, LOCALE } = require("./util/EvobotUtil");
const path = require("path");
const i18n = require("i18n");

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

i18n.configure({
  locales: ["ar", "de", "en", "es", "fr", "it", "ko", "nl", "pl", "pt_br", "ru", "sv", "tr", "zh_cn", "zh_tw"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: function(msg) {
    console.log("warn", msg);
  },

  logErrorFn: function(msg) {
    console.log("error", msg);
  },

  missingKeyFn: function(locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ["{{", "}}"],
    disable: false
  }
});

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`${PREFIX}help and ${PREFIX}play`, { type: "LISTENING" });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommend")).catch(console.error);
  }
});
