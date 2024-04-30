const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  // Command Data for Slash Command Builder
  data: new SlashCommandBuilder()
    .setName("give-coins")
    .setDescription("Give Someone Any Amount Of Coins.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The Amount Of Coins To Give A User")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("The User To Give The Coins.")
        .setRequired(true)
    ),

  // Code To Run When Command Is Called
  run: async ({ interaction }) => {
    // Defines The Targets Entered By The User Running The Command
    const amount = interaction.options.getNumber("amount");
    const targetUser = interaction.options.getUser("target-user");

    // Finds The Target User's Profile
    let userProfile = await UserProfile.findOne({ userId: targetUser.id });

    // If The Target User Does Not Have A Profile, Create One
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: targetUser.id,
      });
    }

    // If The Target User Is A Bot, Reply With An Error
    if (targetUser.bot) {
      interaction.reply({
        content: "You Cannot Give Coins To Bots!",
        ephemeral: true,
      });
      return;
    }

    // If The Amount Is 0 Or Less, Reply With An Error
    if (amount == 0 || amount < 0) {
      interaction.reply({
        content: "You Cannot Give 0 Or Less Coins!",
        ephemeral: true,
      });
      return;
    }

    // Adds The Amount To The Target User's Balance
    userProfile.balance += amount;
    await userProfile.save();

    // Reply To The User Running The Command
    interaction.reply(
      `You Gave ${targetUser} ${amount} Coins! Their New Balance Is ${userProfile.balance}.`
    );
  },
  options: {
    // Only Registers The Command In Your Dev Only Server And Only Devs Can Run It
    //devOnly: true,
    // Deletes The Command By Not Registering It
    //deleted: true,
    // Members With The "Administrator" Permission Can Run The Command
    userPermissions: ["Administrator"],
  },
};
