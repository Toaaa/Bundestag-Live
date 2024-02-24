import { SlashCommandBuilder } from "@discordjs/builders";

const channelCommand = new SlashCommandBuilder()
  .setName("kanal")
  .setDescription(
    "Setzt den Kanal, in dem die Livestream-Benachrichtigung gepostet werden soll."
  )
  .addChannelOption((option) =>
    option
      .setName("kanal")
      .setDescription(
        "Setzt den Kanal, in dem die Livestream-Benachrichtigung gepostet werden soll."
      )
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("status")
      .setDescription(
        "Gibt den aktuellen Kanal zurück, in dem die Livestream-Benachrichtigung gepostet wird."
      )
      .setRequired(false)
  );

export default channelCommand;