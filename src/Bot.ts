import {Client, GatewayIntentBits, REST, Routes, type Snowflake} from "discord.js";
import MusicQueue from "./MusicQueue";
import SlashCommand from "./SlashCommand";
import {readdir} from "fs/promises";
import {join} from "path";
import MissingPermissionsError from "./MissingPermissionsError";
import Console from "./Console";

class Bot extends Client {
	public constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages,
			],
		});

		this.commands = new Map();
		this.queues = new Map();
		this.cooldowns = new Map();
		this.slashCommandsMap = new Map();
		this.slashCommands = [];

		this.on("warn", info => console.log(info));
		this.on("error", console.error);
		this.on("ready", this.registerSlashCommands);

		this.on("messageCreate", e => {
			if (/```[tj]s\n[\s\S]+\n```/.test(e.content)) {
				return new Console().run(e);
			}
		});

		this.on("interactionCreate", async interaction => {
			if (!interaction.isChatInputCommand()) return;

			const command = this.slashCommandsMap.get(interaction.commandName);

			if (!command) return;

			if (!this.cooldowns.has(interaction.commandName)) {
				this.cooldowns.set(interaction.commandName, new Map());
			}

			const now = Date.now();
			const timestamps = this.cooldowns.get(interaction.commandName)!;
			const cooldownAmount = (command.cooldown || 1) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					await interaction.reply({
						content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
							interaction.commandName
						}\` command.`,
						ephemeral: true,
					});
					return;
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				const permissionsCheck = await command.checkPermissions(interaction);

				if (permissionsCheck.result) {
					await command.execute(interaction);
				} else {
					throw new MissingPermissionsError(permissionsCheck.missing);
				}
			} catch (error: any) {
				console.error(error);

				if (error instanceof MissingPermissionsError) {
					await interaction.reply({content: error.toString(), ephemeral: true}).catch(console.error);
				} else {
					await interaction
						.reply({content: "There was an error while executing this command!", ephemeral: true})
						.catch(console.error);
				}
			}
		});

		this.login(process.env.DISCORD_TOKEN);
	}

	private async registerSlashCommands() {
		const rest = new REST({version: "9"}).setToken(process.env.TOKEN!);

		for (const file of await readdir(join(__dirname, "..", "commands"))) {
			const command: SlashCommand = require(join(__dirname, "..", "commands", file));
			const name = file.split(".")[0];

			this.slashCommands.push(command.build(name));
			this.slashCommandsMap.set(name, command);
		}

		await rest.put(Routes.applicationCommands(this.user!.id), {
			body: this.slashCommands,
		});
	}
}

declare module "discord.js" {
	export interface Client {
		commands: Map<string, SlashCommand>;
		slashCommands: ApplicationCommandDataResolvable[];
		slashCommandsMap: Map<string, SlashCommand>;
		cooldowns: Map<string, Map<Snowflake, number>>;
		queues: Map<Snowflake, MusicQueue>;
	}
}

export default Bot;
