import {
  ApplicationCommand,
  Client,
  GatewayIntentBits,
  NewsChannel,
  REST,
  Routes,
  TextChannel,
} from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import fs from "fs";

dotenv.config();

const db = new sqlite3.Database("guildConfigurations.db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const discordBotToken = process.env.DISCORD_BOT_TOKEN;
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;

const commands: any[] = [];
const commandsDir = fs
  .readdirSync("./dist/commands")
  .filter((file: string) => file.endsWith(".js"));

for (const file of commandsDir) {
  const command = require(`./commands/${file}`).default;
  commands.push(command);
}

let _guildId: string = "";
let botId: string = "";
const postedVideoIds = new Set<string>();

interface GuildRow {
  channel_id: string | null;
}

if (!youtubeApiKey || !discordBotToken || !youtubeChannelId) {
  console.error("Bitte gib alle erforderlichen Umgebungsvariablen an.");
  process.exit(1);
}

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS guilds (guild_id TEXT, channel_id TEXT, PRIMARY KEY (guild_id))"
  );
});

console.log("Bundestag Live Bot startet...");

client.on("ready", async () => {
  botId = client.user?.id || "";
  console.log(`Logged in as ${client.user?.tag} (${botId})`);
  console.log(
    `Invite Link: https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=277025508352&scope=applications.commands+bot`
  );

  const rest = new REST({ version: "9" }).setToken(discordBotToken);
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(botId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (err: any) {
    console.error(err);
  }

  setInterval(async () => {
    await checkYouTubeLiveStatus();
  }, 30 * 60 * 1000);
});

client.on(
  "guildCreate",
  async (guild: { fetchOwner: () => any; name: any; id: any }) => {
    const owner = await guild.fetchOwner();
    const guildName = guild.name;
    await owner.send(
      `👋 Hey! Irgendjemand (wahrscheinlich du) hat mich gerade dem Server **${guildName}** eingeladen, der dir gehört. Ich bin **Bundestag Live** und ich benachrichtige jeden in deinem Server, sobald der deutsche Bundestag Live ist! 🔔. **Um mich einzurichten, benutze bitte \`/kanal\` auf deinem Server!**`
    );
    console.log(
      `Der Bot wurde zum Server ${guild.name} (${guild.id}) hinzugefügt.`
    );
  }
);

client.on(
  "interactionCreate",
  async (interaction: {
    isCommand?: any;
    reply?: any;
    commandName?: any;
    options?: any;
    guild?: any;
    user?: any;
  }) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild, user } = interaction;

    if (commandName === "kanal" && guild && user) {
      const channelId = options.data[0].value;
      const name = options.data[0]?.name;
      console.log("channelId", channelId);
      console.log("name", name);
      _guildId = guild.id;

      if (name === "status") {
        db.get(
          "SELECT channel_id FROM guilds WHERE guild_id = ?",
          [_guildId],
          (err, row: GuildRow) => {
            if (err) {
              console.error(err.message);
              interaction.reply({
                content: "Fehler beim Festlegen des Benachrichtigungskanals.",
                ephemeral: true,
              });
            } else {
              const currentChannelId = row ? row.channel_id : null;
              interaction.reply({
                content: `Der aktuelle Benachrichtigungskanal ist <#${currentChannelId}>.`,
                ephemeral: true,
              });
            }
          }
        );
      }

      if (channelId && name !== "status") {
        _guildId = guild.id;

        if (user.id != guild.ownerId) {
          interaction.reply({
            content: "Nur der Serverbesitzer kann den Kanal festlegen.",
            ephemeral: true,
          });
          return;
        }

        db.get(
          "SELECT channel_id FROM guilds WHERE guild_id = ?",
          [_guildId],
          (err: { message: any }, row: GuildRow) => {
            if (err) {
              console.error(err.message);
              interaction.reply({
                content: "Fehler beim Festlegen des Kanals.",
                ephemeral: true,
              });
            } else {
              const oldChannelId = row ? row.channel_id : null;

              db.run(
                "INSERT OR REPLACE INTO guilds (guild_id, channel_id) VALUES (?, ?, ?)",
                [_guildId, channelId],
                (updateErr: { message: any }) => {
                  if (updateErr) {
                    console.error(updateErr.message);
                    interaction.reply({
                      content: "Fehler beim Festlegen des Kanals.",
                      ephemeral: true,
                    });
                  } else {
                    interaction.reply({
                      content: `Der Benachrichtigungskanal ${
                        oldChannelId
                          ? oldChannelId === channelId
                            ? `ist bereits <#${channelId}>.`
                            : `wurde von <#${oldChannelId}> auf <#${channelId}> aktualisiert.`
                          : `wurde auf <#${channelId}> festgelegt.`
                      }`,
                      ephemeral: true,
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  }
);

client.on("command", (command: ApplicationCommand) => {
  if (!command.guild) return;
  _guildId = command.guild.id;
  console.log("Guild ID:", _guildId);
});

const checkYouTubeLiveStatus = async () => {
  try {
    const guilds = Array.from(client.guilds.cache.values());

    for (const guild of guilds) {
      const _guildId = guild.id;

      const query = "SELECT channel_id FROM guilds WHERE guild_id = ?";

      db.get(
        query,
        [_guildId],
        async (err: { message: any }, row: { channel_id?: string }) => {
          if (err) {
            console.error(err.message);
            return;
          }

          if (row) {
            const channelId: string = row.channel_id!;

            const response = await axios.get(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&eventType=live&type=video&key=${youtubeApiKey}`
            );

            const liveVideo = response.data.items?.[0];

            if (liveVideo) {
              const videoId = liveVideo.id.videoId;
              const liveChannelId = liveVideo.snippet.channelId;
              if (liveChannelId !== youtubeChannelId) return;

              if (!postedVideoIds.has(videoId)) {
                console.log(
                  `Der Bundestag ist Live auf dem Server ${guild.name} (${_guildId})!`
                );

                const embed = {
                  title: "Der Bundestag ist Live!",
                  description: liveVideo.snippet.title,
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  color: 0xff0000,
                  timestamp: new Date().toISOString(),
                  footer: {
                    text: `Bundestag Live Ankündigung • ${videoId}`,
                  },
                  thumbnail: {
                    url: liveVideo.snippet.thumbnails.default.url,
                  },
                };

                const channel = guild.channels.cache.get(channelId);

                if (
                  channel instanceof TextChannel ||
                  channel instanceof NewsChannel
                ) {
                  console.log("Nachricht wird gesendet...");
                  console.log(channelId, channel.name, channel.type);
                  await channel.send({ embeds: [embed] });
                }

                postedVideoIds.add(videoId);
              }
            }
          }
        }
      );
    }
  } catch (err: any) {
    console.error(
      "Fehler bei der Überprüfung des YouTube-Live-Status: ",
      err.message
    );
  }
};

client.login(discordBotToken);
