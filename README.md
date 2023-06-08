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
1. TOKEN - being the Discord Bot Token
2. UNSPLASH_ACCESS_KEY - being the Unsplash access key (not the secret one)
3. USERNAME, PASSWORD - Your login info found in the panel

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

- Now Playing (/np)
- Queue system (/queue)
- Loop / Repeat (/loop)
- Shuffle (/shuffle)
- Volume control (/volume)
- Lyrics (/lyrics)
- Pause (/pause)
- Resume (/resume)
- Skip (/skip)
- Skip to song # in queue (/skipto)
- Move a song in the queue (/move)
- Remove song # from queue (/remove)
- Show ping to Discord API (/ping)
- Show bot uptime (/uptime)
- Toggle pruning of bot messages (/pruning)
- Help (/help)
- Command Handler from [discordjs.guide](https://discordjs.guide/)
- Media Controls via ~~Reactions~~ Discord buttons
- Unsplash Wallpapers
- Running TypeScript and JavaScript code

## 🌎 Locales

Currently available locales are:

- English (en)
- Arabic (ar)
- Brazilian Portuguese (pt_br)
- Czech (cs)
- Dutch (nl)
- French (fr)
- German (de)
- Greek (el)
- Indonesian (id)
- Italian (it)
- Japanese (ja)
- Korean (ko)
- Minionese (mi)
- Persian (fa)
- Polish (pl)
- Russian (ru)
- Simplified Chinese (zh_cn)
- Singaporean Mandarin (zh_sg)
- Spanish (es)
- Swedish (sv)
- Traditional Chinese (zh_tw)
- Thai (th)
- Turkish (tr)
- Ukrainian (uk)
- Vietnamese (vi)

## Tomobot exclusive
1. Button-based media control
2. `delete` and `wallpaper` command
3. Running JS and TS from message
4. Quizzes

## LICENSE
Original Author &copy; Erit Islami 2019
Fork Author &copy; Tomáš Wróbel 2023

MIT License