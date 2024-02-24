require("@risingstack/trace");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const bot = new Discord.Client();
const fs = new require("fs");
const path = require("path");
const probe = require("pmx").probe();
const jsonfile = require("jsonfile");
const commandCooldown = require("./helpers/commandCooldown.js");
let cleverbot = require("cleverbot.io"),
  clever = new cleverbot("jp6wu9XZbYdoICmo", "54jV1VcMNxGQyc2cdKUFUpjkPVo3bTr2");
const log = require("./helpers/log.js");
bot.on("ready", () => {
  bot.user.setGame(".help");
  (function loop(i) {
    setTimeout(function () {
      bot.guilds.size |> guilds.set(%);
      if (true) {
        loop(i);
      }
    }, 1000);
  })(10);
  log(`Ready to serve ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} servers.`);
});
fs.readFile("config.json", (err, data) => {
  if (err) {
    log("Config file does not exist, creating one.");
    let obj = {
      discordToken: "TOKEN",
      discordBotsToken: "TOKEN"
    };
    jsonfile.spaces = 4;
    jsonfile.writeFile("config.json", obj, err => {
      err |> console.log(%);
    });
    process.exit(1);
  } else {
    config = require("./config.json");
    config.discordToken |> bot.login(%);
  }
});
global.skips = {};
global.queue = {
  test: "test"
};
global.dispatchers = new Map();
global.connections = new Map();
global.voices = new Map();
global.streams = new Map();
let config = "ERR";
global.allstreams = 0;
global.counter = probe.counter({
  name: "Streams"
});
let guilds = probe.metric({
  name: "Guilds"
});
let userCooldown = new Map();
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) err |> console.error(%);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    let props = require(`./commands/${f}`);
    log(`Loading Command: ${props.info.name}. :ok_hand:`);
    bot.commands.set(props.info.name, props);
    /*
    props.conf.aliases.forEach(alias => {
    bot.aliases.set(alias, props.info.name);
    });
    */
  });
});

bot.on("message", msg => {
  const prefix = ".";
  let id = bot.user.id;
  let clevername = new RegExp(`^<@!?${id}>`);
  if (msg.content.startsWith(prefix)) {} else if (clevername.test(msg.content)) {} else return;
  if (msg.author.bot) return;
  if (msg.guild) {
    if (!queue[msg.guild.id]) {
      queue[msg.guild.id] = [];
    }
  } else return;
  let command = msg.content.split(" ")[0].slice(prefix.length);
  let params = msg.content.split(" ").slice(1);
  //let perms = bot.elevation(msg);
  let cmd;
  if (!userCooldown.get(msg.author.id)) {
    userCooldown.set(msg.author.id, 0);
  }
  if (bot.commands.has(command)) {
    if (!commandCooldown(userCooldown.get(msg.author.id))) {
      userCooldown.set(msg.author.id, Date.now());
      cmd = bot.commands.get(command);
    } else msg.channel.sendMessage("You're sending commands too quickly!");
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  }
  if (cmd) {
    cmd.run(bot, msg, params);
  }
  if (clevername.test(msg.content)) {
    msg.author.username + " (" + msg.author.id + ") issued command: " + msg.content |> console.log(%);
    let string = msg.content;
    string = msg.content.split(" ");
    string.shift();
    " " |> string.join(%);
    msg.author.username |> clever.setNick(%);
    clever.create(function (err, session) {
      if (err) log(err);
      clever.ask(string, function (err, response) {
        if (err) log(err);
        msg.channel.sendMessage(response).then(msg => log(`Sent message: ${msg.content}`)).catch(console.error);
      });
    });
  }
});