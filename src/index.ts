import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

const postedVideoIds = new Set<string>();

if (
  !youtubeApiKey ||
  !discordBotToken ||
  !youtubeChannelId ||
  !discordChannelId
) {
  console.error("Bitte gib alle erforderlichen Umgebungsvariablen an.");
  process.exit(1);
}

console.log("Bundestag Live Bot startet...");

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag} (${client.user?.id})`);
  console.log(`Invite Link: https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot`);
  checkYouTubeLiveStatus();
  setInterval(checkYouTubeLiveStatus, 5 * 60 * 1000);
});

const checkYouTubeLiveStatus = async () => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&eventType=live&type=video&key=${youtubeApiKey}`
    );

    const liveVideo = response.data.items?.[0];

    if (liveVideo) {
      const videoId = liveVideo.id.videoId;

      if (!postedVideoIds.has(videoId)) {
        console.log("Der Bundestag ist Live!");
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

        const channel = client.channels.cache.get(discordChannelId);

        if (channel instanceof TextChannel) {
          console.log("Nachricht wird gesendet...");
          await channel.send({ embeds: [embed] });
        }

        postedVideoIds.add(videoId);
      }
    }
  } catch (err: any) {
    console.error(
      "Fehler bei der Überprüfung des YouTube-Live-Status: ",
      err.message
    );
  }
};

client.login(discordBotToken);
