const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  // Creates The Slash Command
  data: new SlashCommandBuilder()
    .setName("remove-coins")
    .setDescription("Remove Any Amount Of Coins From Someone.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The Amount Of Coins To Remove From A User")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("The User To Remove The Coins.")
        .setRequired(true)
    ),

  // The Code Ran When The Command Is Ran
  run: async ({ interaction }) => {
    // Defines The Targets Entered By The User Running The Command
    const amount = interaction.options.getNumber("amount");
    const targetUser = interaction.options.getUser("target-user");

    // Defines The User Profile Of The Target User
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
        content: "You Cannot Remove Coins From Bots!",
        ephemeral: true,
      });
      return;
    }

    // If The Amount Is 0 Or Less, Reply With An Error
    if (amount == 0 || amount < 0) {
      interaction.reply({
        content: "You Cannot Remove 0 Or Less Coins!",
        ephemeral: true,
      });
      return;
    }

    // Removes The Amount From The Target User's Balance
    userProfile.balance -= amount;
    await userProfile.save();

    // Sends A Message To The User Running The Command
    interaction.reply(
      `You Removed ${amount} Coins From ${targetUser}! Their New Balance Is ${userProfile.balance}.`
    );
  },
  options: {
    //devOnly: true,
    //deleted: true,
    userPermissions: ["Administrator"],
  },
};
