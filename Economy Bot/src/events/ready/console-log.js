const { ActivityType } = require("discord.js");

module.exports = (c) => {
  // Logs To The Console When The Bot Is Online
  console.log(`${c.user.username} is online.`);
  // Sets The Bot's Status
  c.user.setActivity({
    name: "Economy Tutorial",
    type: ActivityType.Watching,
  });
};
