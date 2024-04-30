const UserProfile = require("../../schemas/UserProfile");
const Cooldown = require("../../schemas/Cooldown");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  // Creates The Slash Command
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Gamble Some Of Your Coins.")
    .setDMPermission(false)
    .addNumberOption((option) =>
      option

        .setName("amount")
        .setDescription("The Amount Of Coins You Want To Gamble.")
        .setRequired(true)
    ),

  // The Code Ran After The Slash Command Is Ran
  run: async ({ interaction }) => {
    await interaction.deferReply();

    // Defines The Cooldown Schema
    const commandName = "gamble";
    const userId = interaction.user.id;

    let cooldown = await Cooldown.findOne({ userId, commandName });

    // Sends Message If User Is On Cooldown
    if (cooldown && Date.now() < cooldown.endsAt) {
      const { default: prettyMs } = await import("pretty-ms");

      await interaction.editReply({
        content: `You Are On Cooldown, This Command Is Available In **${prettyMs(
          cooldown.endsAt - Date.now()
        )}**`,
        ephemeral: true,
      });
      return;
    }

    // If User Is Not On Cooldown Then Creates A New Cooldown
    if (!cooldown) {
      cooldown = new Cooldown({ userId, commandName });
    }

    // Gets The Amount Entered By The User
    const amount = interaction.options.getNumber("amount");

    // If The Amount To Gamble Is Less Than 5 Then Sends A Message
    if (amount < 5) {
      interaction.editReply(`You Must Gamble Atleast 5 Coins!`);
      return;
    }

    // Finds The User Profile
    let userProfile = await UserProfile.findOne({
      userId: interaction.user.id,
    });

    // If The User Profile Does Not Exist Then Creates A New One
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: interaction.user.id,
      });
    }

    // If The User Does Not Have Enough Coins To Gamble Then Sends A Message
    if (amount > userProfile.balance) {
      interaction.editReply("You Do Not Have Enough Coins To Gamble!");
      return;
    }

    // Creates A 50/50 Chance To Win Or Lose
    const didWin = Math.random() > 0.5;

    // If The User Lost Then Removes The Coins From The User Balance And Sends A Message
    if (!didWin) {
      userProfile.balance -= amount;
      await userProfile.save();

      interaction.editReply(`🧨 You Lost ${amount} Coins!`);
      return;
    }

    // The Amount Given To The User If They Win
    const amountWon = amount * 2;

    // Gives The User The Amount Won And Sends A Message
    userProfile.balance += amountWon;
    await userProfile.save();

    interaction.editReply(`🎉 You Won ${amountWon} Coins!`);

    // The Length Of The Cooldown (60_00 = to 1 minute in milliseconds)
    cooldown.endsAt = Date.now() + 60_000;
    await cooldown.save();
    return;
  },
  // Will Be Registered In The Dev Server Or Wont Get Registered If Deleted
  options: {
    //devOnly: true,
    //deleted: true,
  },
};
