const { SlashCommandBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer Some Of Your Coins To Someone.")
    .setDMPermission(false)
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The Amount Of Coins To Transfer.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("The User To Give The Coins To.")
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const amount = interaction.options.getNumber("amount");
    const targetUser = interaction.options.getUser("target-user");

    let giverProfile = await UserProfile.findOne({
      userId: interaction.user.id,
    });

    let userProfile = await UserProfile.findOne({
      userId: targetUser.id,
    });

    if (targetUser.id == interaction.user.id || targetUser.bot) {
      interaction.reply({
        content: "You Cannot Transfer Coins To Yourself Or Bots!",
        ephemeral: true,
      });
      return;
    }

    if (amount == 0 || amount < 0) {
      interaction.reply({
        content: "You Cannot Transfer 0 Or Less Coins!",
        ephemeral: true,
      });
      return;
    }

    if (giverProfile.balance < amount) {
      interaction.reply({
        content: "You Do Not Have Enough Coins To Transfer!",
        ephemeral: true,
      });
      return;
    }

    if (!userProfile) {
      userProfile = new UserProfile({
        userId: targetUser.id,
      });
    }

    if (!giverProfile) {
      interaction.reply({
        content: `You Do Not Have A Profile To Create One Claim Your Daily With "/daily"!`,
        ephemeral: true,
      });
      return;
    }

    giverProfile.balance -= amount;
    await giverProfile.save();

    userProfile.balance += amount;
    await userProfile.save();

    interaction.reply(
      `You Gave ${amount} Coins To ${targetUser}.\nYour New Balance Is ${giverProfile.balance}.`
    );
  },
  options: {
    //devOnly: true,
    //deleted: true,
  },
};
