const Cooldown = require("../../schemas/Cooldown");

module.exports = () => {
  // Sets A Timer
  setInterval(async () => {
    try {
      // Finds All Cooldowns
      const cooldowns = await Cooldown.find().select("endsAt");

      // Checks If Cooldown Is Over
      for (const cooldown of cooldowns) {
        if (Date.now() < cooldown.endsAt) return;

        // If Cooldown Is Over, Deletes It From The Database
        await Cooldown.deleteOne({ _id: cooldown._id });
      }
    } catch (error) {
      // Logs Any Errors To The Console
      console.log(`Error Clearing Cooldowns: ${error}`);
    }
  }, 3.6e6);
};
