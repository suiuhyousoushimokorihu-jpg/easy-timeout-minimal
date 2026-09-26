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

      return {
        target,
        trigger: message.content.trim(),
      };
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

  // 1. Bot権限確認
  if (!me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return reply(message, 'Botに「メンバーをタイムアウト」権限がありません。');
  }

  // 2. 対象が管理者か確認
  if (
    target.id === message.guild.ownerId ||
    target.permissions.has(PermissionFlagsBits.Administrator)
  ) {
    return reply(message, '管理者は対象外です。');
  }

  if (!target.moderatable) {
    return reply(message, 'ロール階層または権限の関係でタイムアウトできません。');
  }

  // 3. CT確認（発動者ごとに10分）
  const now = Date.now();
  const availableAt = cooldowns.get(message.author.id) ?? 0;

  if (availableAt > now) {
    const seconds = Math.ceil((availableAt - now) / 1000);
    const minutes = Math.ceil(seconds / 60);
    return reply(message, `クールタイム中です。あと約${minutes}分です。`);
  }

  // 4. 発動
  try {
    await target.timeout(
      TIMEOUT_MS,
      `Easy Timeout Minimal: triggered by ${message.author.tag}`
    );

    // 成功したときだけCT開始
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_MS);

    await reply(
      message,
      `${target.user.username} を1時間タイムアウトしました。`
    );
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
