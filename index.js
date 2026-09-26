require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
} = require('discord.js');

const TRIGGERS = new Set(['荒らし', 'スパム', 'タイムアウト']);
const COOLDOWN_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 60 * 60 * 1000;
const cooldowns = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function reply(message, content) {
  try {
    await message.reply({
      content,
      allowedMentions: { repliedUser: false, parse: [] },
    });
  } catch {}
}

async function resolveTarget(message) {
  if (message.reference?.messageId) {
    try {
      const referenced = await message.fetchReference();
      const target =
        referenced.member ??
        await message.guild.members.fetch(referenced.author.id);

      return { target, trigger: message.content.trim() };
    } catch {
      return null;
    }
  }

  if (message.mentions.members.size !== 1) return null;

  const target = message.mentions.members.first();
  const trigger = message.content
    .replace(new RegExp(`<@!?${target.id}>`, 'g'), '')
    .trim();

  return { target, trigger };
}

client.once('ready', () => {
  console.log(`Ready: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const resolved = await resolveTarget(message);
  if (!resolved || !TRIGGERS.has(resolved.trigger)) return;

  const { target } = resolved;
  const me = message.guild.members.me;

  // Bot権限
  if (!me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return reply(message, 'Botにタイムアウト権限がありません。');
  }

  // 管理者
  if (
    target.id === message.guild.ownerId ||
    target.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    return reply(message, '管理者は対象外です。');
  }

  if (!target.moderatable) {
    return reply(message, 'このユーザーはタイムアウトできません。');
  }

  // CT
  const now = Date.now();
  const availableAt = cooldowns.get(message.author.id) ?? 0;

  if (availableAt > now) {
    const minutes = Math.ceil((availableAt - now) / 60000);
    return reply(message, `CT中です。あと約${minutes}分。`);
  }

  // 発動
  try {
    await target.timeout(
      TIMEOUT_MS,
      `Easy Timeout Minimal: ${message.author.tag}`
    );

    cooldowns.set(message.author.id, Date.now() + COOLDOWN_MS);
    await reply(message, `${target.user.username} を1時間タイムアウトしました。`);
  } catch (error) {
    console.error(error);
    await reply(message, 'タイムアウトに失敗しました。');
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is not set.');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
