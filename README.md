# Easy Timeout Minimal

Discordで荒らし・スパムを見つけたメンバーが、その場で対象を1時間タイムアウトするための最小構成Botです。

設定機能・DB・Slash Commandはありません。必要な変更はソースコードを直接編集してください。AIでの改造・手作業での改造・Forkなど自由です。

## 動作

対象ユーザーをメンションして、

```text
@user 荒らし
```

または対象メッセージへリプライして、

```text
スパム
```

と送信すると発動します。

固定の発動ワード：

- `荒らし`
- `スパム`
- `タイムアウト`

固定設定：

- クールタイム：10分（発動者ごと）
- タイムアウト：1時間
- 発動者の権限チェック：なし
- サーバー所有者・Administrator：対象外
- Botに Moderate Members 権限がない場合：発動しない
- Botのロール階層上タイムアウトできない対象：発動しない

クールタイムはタイムアウト成功時のみ開始します。メモリ上で管理するため、Botを再起動するとリセットされます。

> [!IMPORTANT]
> 発動者の権限チェックはありません。Botが見えるチャンネルでは、一般メンバーも発動できます。

## 必要環境

- Node.js 18+
- discord.js 14
- Discord Developer Portalで **Message Content Intent** を有効化

Botには最低限、以下の権限を与えてください。

- View Channels
- Send Messages
- Read Message History
- Moderate Members

Botロールは、タイムアウト対象にしたいメンバーより上に配置してください。

## インストール

```bash
npm install
```

`.env.example` を `.env` にコピーし、Bot Tokenを設定します。

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
```

起動：

```bash
npm start
```

## カスタマイズ

設定画面はありません。変更したい場合は `index.js` の定数や処理を直接編集してください。

機能付きの実運用版：

https://github.com/suiuhyousoushimokorihu-jpg/easy-timeout

## License

MIT
