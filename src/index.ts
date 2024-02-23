import {
  Client,
  GatewayIntentBits,
  NewsChannel,
  TextChannel,
} from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";

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

let botId: string = "";
let _userId: string = "";

const postedVideoIds = new Set<string>();

if (!youtubeApiKey || !discordBotToken || !youtubeChannelId) {
  console.error("Bitte gib alle erforderlichen Umgebungsvariablen an.");
  process.exit(1);
}

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS guilds (id TEXT PRIMARY KEY, channel_id TEXT)"
  );
});

console.log("Bundestag Live Bot startet...");

client.on("ready", async () => {
  botId = client.user?.id || "";
  console.log(`Logged in as ${client.user?.tag} (${botId})`);
  console.log(
    `Invite Link: https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=134144&scope=bot`
  );

  checkYouTubeLiveStatus();
  setInterval(checkYouTubeLiveStatus, 5 * 60 * 1000);
});

const checkYouTubeLiveStatus = async () => {
  try {
    const guilds = Array.from(client.guilds.cache.values());

    for (const guild of guilds) {
      const guildId = guild.id;

      const query =
        "SELECT channel_id FROM guilds WHERE id = ? AND guild_id = ?";

      db.get(
        query,
        [_userId, guildId],
        async (err, row: { channel_id?: string }) => {
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

              if (!postedVideoIds.has(videoId)) {
                console.log(
                  `Der Bundestag ist Live auf dem Server ${guild.name} (${guildId})!`
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