import { Client, GatewayIntentBits, Partials, TextChannel } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const MESSAGE_ID = "1371701288890404884";
const CHANNEL_ID = "1371701188336029886";

/**
 * emoji : roleId
 */
const emojiRoleMap: Record<string, string> = {
  "👑": "1371702304310558750", // CK3
  "🔫": "1371702330478690314", // CS2
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent, // <-- This line
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Example config
const channelId = CHANNEL_ID;
const messageId = MESSAGE_ID; // Load from config or storage

async function ensureRoleMessage(client: any) {
  const channel = (await client.channels.fetch(channelId)) as TextChannel;

  let message;
  try {
    message = await channel.messages.fetch(messageId);
  } catch (err) {
    // Message not found
  }

  if (!message) {
    // Send the message
    const sent = await channel.send("please select a role with a reaction");
    // Save sent.id to your config/storage for future use
    console.log("Sent new role message with ID:", sent.id);
  } else {
    console.log("Role message already exists.");
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  ensureRoleMessage(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.message.id !== MESSAGE_ID) return;

  const emojiKey = reaction.emoji.id ?? reaction.emoji.name;
  if (!emojiKey) return;

  const roleId = emojiRoleMap[emojiKey];
  if (!roleId) return;

  const guild = reaction.message.guild;
  if (!guild) return;

  const member = await guild.members.fetch(user.id);
  await member.roles.add(roleId);
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.message.id !== MESSAGE_ID) return;

  const emojiKey = reaction.emoji.id ?? reaction.emoji.name;
  if (!emojiKey) return;

  const roleId = emojiRoleMap[emojiKey];
  if (!roleId) return;

  const guild = reaction.message.guild;
  if (!guild) return;

  const member = await guild.members.fetch(user.id);
  await member.roles.remove(roleId);
});
