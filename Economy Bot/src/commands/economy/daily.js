const { SlashCommandBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  // Builds The Slash Command
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect Your Daily Amount Of Coins.")
    // DM Permission Makes It So The Command Can't Be Used In DMs
    .setDMPermission(false),
  // The Code Ran After The Command Is Ran
  run: async ({ interaction }) => {
    try {
      // The Amount Of Coins Recieved Once The Command Is Ran
      const dailyAmount = 15;
      await interaction.deferReply();

      // Searches The Database For The User Who Ran The Commands Profile
      let userProfile = await UserProfile.findOne({
        userId: interaction.user.id,
      });

      // Checks If The User Has Already Collected Their Daily
      if (userProfile) {
        const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
        const currentDate = new Date().toDateString();

        // If The User Has Already Collected Their Daily, Replys With A Message
        if (lastDailyDate === currentDate) {
          interaction.editReply(
            `You Have Already Collected Your Daily For Today. Come Back Tomorrow.`
          );
          return;
        }
      } else {
        // If The User Does Not Have A Profile, Creates One
        userProfile = new UserProfile({
          userId: interaction.member.id,
        });
      }

      // Adds The Daily Amount And Creates A New Date For The Last Daily Collected
      userProfile.balance += dailyAmount;
      userProfile.lastDailyCollected = new Date();

      // Saves The User Profile
      await userProfile.save();

      // Replys To The Command With The Amount Of Coins Recieved And The New Balance
      interaction.editReply(
        `${dailyAmount} Coins Was Added To Your Balance.\nNew Balance: ${userProfile.balance}`
      );
    } catch (error) {
      // Catches Any Errors And Sends Them To The Console
      console.log(`Error handling /daily: ${error}`);
    }
  },
};
