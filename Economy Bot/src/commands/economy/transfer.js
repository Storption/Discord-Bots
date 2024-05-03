const { SlashCommandBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  // Creates The Slash Command
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer Some Of Your Coins To Someone.")
    .setDMPermission(false)
    // Creates An Option For A Number
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The Amount Of Coins To Transfer.")
        .setRequired(true)
    )
    // Creates An Option For A User
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("The User To Give The Coins To.")
        .setRequired(true)
    ),

  // The Code Ran When The Command Is Ran
  run: async ({ interaction }) => {
    const amount = interaction.options.getNumber("amount");
    const targetUser = interaction.options.getUser("target-user");

    // Finds The User Running The Commands Profile
    let giverProfile = await UserProfile.findOne({
      userId: interaction.user.id,
    });

    // Finds The User Getting Transferreds Profile
    let userProfile = await UserProfile.findOne({
      userId: targetUser.id,
    });

    // If The User Running The Command Transfers To Themselves Or To A Bot It Sends An Error
    if (targetUser.id == interaction.user.id || targetUser.bot) {
      interaction.reply({
        content: "You Cannot Transfer Coins To Yourself Or Bots!",
        ephemeral: true,
      });
      return;
    }

    // If The Amount To Transfer It 0 Or Less Sends An Error
    if (amount == 0 || amount < 0) {
      interaction.reply({
        content: "You Cannot Transfer 0 Or Less Coins!",
        ephemeral: true,
      });
      return;
    }

    // If The User Running The Command Doesnt Have Enough Coins Sends An Error
    if (giverProfile.balance < amount) {
      interaction.reply({
        content: "You Do Not Have Enough Coins To Transfer!",
        ephemeral: true,
      });
      return;
    }

    // If The User Whos Getting Transferred Doesnt Have A Profile Creates One
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: targetUser.id,
      });
    }

    // If The User Running The Command Doesnt Have A Profile Sends An Error
    if (!giverProfile) {
      interaction.reply({
        content: `You Do Not Have A Profile To Create One Claim Your Daily With "/daily"!`,
        ephemeral: true,
      });
      return;
    }

    // Removes The Amount Transferred From The User Running The Command
    giverProfile.balance -= amount;
    await giverProfile.save();

    // Addes The Amount Transferred To The User Receiving The Coins
    userProfile.balance += amount;
    await userProfile.save();

    // Replys To The Command On Success
    interaction.reply(
      `You Gave ${amount} Coins To ${targetUser}.\nYour New Balance Is ${giverProfile.balance}.`
    );
  },
  options: {
    //devOnly: true,
    //deleted: true,
  },
};
