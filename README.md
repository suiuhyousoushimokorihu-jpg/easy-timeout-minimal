# Easy Timeout Minimal

対象をメンションまたはリプライして、`荒らし` / `スパム` / `タイムアウト` と送ると、対象を1時間タイムアウトします。

- クールタイム：10分
- サーバー所有者・Administratorは対象外
- 発動者の権限チェックなし

必要に応じて改造してください。

## 起動

Node.js 18+ / discord.js 14  
Discord Developer Portalで **Message Content Intent** を有効にしてください。

Botには `Moderate Members` 権限が必要です。Botロールは対象より上に配置してください。

```bash
npm install
```

`.env.example` を `.env` にコピーしてTokenを設定します。

```bash
npm start
```

通常版: https://github.com/suiuhyousoushimokorihu-jpg/easy-timeout
