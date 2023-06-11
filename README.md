# Tomobot (Discord Multi-Purpose Bot)

> EvoBot is a Discord Music Bot built with TypeScript, discord.js & uses Command Handler from [discordjs.guide](https://discordjs.guide)

> Tomobot is a Discord bot built on top of EvoBot while fixing some issues. It also includes support for SFTP servers (like [SparkedHost](https://sparkedhost.com/))

## Requirements

1. Discord Bot Token
2. Enable 'Message Content Intent' in Discord Developer Portal
2. Node.js v18 or higher
3. [Unsplash](https://unsplash.com) API Access key

## 🚀 Getting Started (with SparkedHost)

First, clone the repo. Then, provide the Secrets:
1. `TOKEN` - being the Discord Bot Token
2. `UNSPLASH_ACCESS_KEY` - being the Unsplash access key (not the secret one)
3. `USERNAME`, `PASSWORD` - Your login info found in the panel

Then commit and run!

## 📝 Features & Commands

- 🎶 Play music from YouTube via url

`/play https://www.youtube.com/watch?v=GLvohMXgcBo`

- 🔎 Play music from YouTube via search query

`/play under the bridge red hot chili peppers`

- 🔎 Search and select music to play

`/search Pearl Jam`

- 📃 Play youtube playlists via url

`/playlist https://www.youtube.com/watch?v=YlUKcNNmywk&list=PL5RNCwK3GIO13SR_o57bGJCEmqFAwq82c`

- 🔎 Play youtube playlists via search query

`/playlist linkin park meteora`

- ❓ Start an AZ quiz

`/az-quiz @oponent`

- Now Playing (/nowplaying)
- Queue system (/queue)
- Loop / Repeat (/loop)
- Shuffle (/shuffle)
- Volume control (/volume)
- Pause (/pause)
- Resume (/resume)
- Skip (/skip)
- Show ping to Discord API (/ping)
- Show bot uptime (/uptime)
- Toggle pruning of bot messages (/pruning)
- Help (/help)
- Media Controls via ~~Reactions~~ Discord buttons
- Unsplash Wallpapers (/wallpaper)
- Running TypeScript and JavaScript code

## Custom command
Creating custom command is as fast as creating a file.

Under the `commands` folder, create a TypeScript file with the same name as your command.

```ts
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
    {
        description: "Your description"
    },
    async function* () {
        // Yielding causes a reply to be sent
        yield "Hello world!";
    },
)
```

or

```ts
import SlashCommand from "../src/SlashCommand";

export = new SlashCommand(
    {
        description: "Your description",
    },
    async function* (user) {
        yield `Hello world, @${user.tag}!`;

        // If you really need the Interaction AI, you use this:
        yield `Hello world, @${this.user.tag}!`;
    },
    {
        type: "User",
        name: "user",
        required: true
    }
)
```

## Tomobot exclusive
1. Button-based media control
2. `delete` and `wallpaper` command
3. Running JS and TS from message
4. AZ quiz (pyramid game)
5. A quiz (single Q/A)
6. Huge API rewrite since v2

## LICENSE
Original Author &copy; Erit Islami 2019
Fork Author &copy; Tomáš Wróbel 2023

MIT License