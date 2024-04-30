const { SlashCommandBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  // Creates The Slash Command
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check Your Current Coin Balance.")
    .setDMPermission(false),

  // The Code That Runs When The Command Is Called
  run: async ({ interaction }) => {
    // Checks If The User Has A Profile
    let userProfile = await UserProfile.findOne({
      userId: interaction.user.id,
    });

    // If The User Doesn't Have A Profile, Send A Message
    if (!userProfile) {
      interaction.reply({
        content:
          "You don't have a profile! Collect Your Daily (with /daily) To Create One.",
        ephemeral: true,
      });
      return;
    }

    // Sends The User's Balance
    interaction.reply(`Your Balance Is ${userProfile.balance} Coins.`);
  },
  options: {
    //devOnly: true,
    //deleted: true,
  },
};
