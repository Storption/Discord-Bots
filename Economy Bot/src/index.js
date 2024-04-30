require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { CommandKit } = require("commandkit");
const mongoose = require("mongoose");

// The Bots Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
  ],
});

// The Command Handler
new CommandKit({
  client,
  devGuildIds: ["1114170053949128817"],
  devUserIds: ["690559976615182366"],
  eventsPath: `${__dirname}/events`,
  commandsPath: `${__dirname}/commands`,
  bulkRegister: true,
});

// The Database
mongoose
  .connect(process.env.MONGODB_SRV)
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((error) => {
    console.log(`There Was An Error With The Database ${error}.`);
    return;
  });

// The Bot Login
client.login(process.env.TOKEN);
