import {
	ApplicationCommandDataResolvable,
	Client,
	Collection,
	Events,
	Interaction,
	REST,
	Routes,
	Snowflake,
} from "discord.js";
import SlashCommand from "./SlashCommand";
import {readdir} from "fs/promises";
import {join} from "path";
import {config} from "../utils/config";
import {i18n} from "../utils/i18n";
import {MissingPermissionsException} from "../utils/MissingPermissionsException";
import {MusicQueue} from "./MusicQueue";
import Console from "./Console";
import {version} from "../package.json";

export class Bot {
	public readonly prefix = config.PREFIX;
	public commands = new Collection<string, SlashCommand>();
	public slashCommands = new Array<ApplicationCommandDataResolvable>();
	public slashCommandsMap = new Collection<string, SlashCommand>();
	public cooldowns = new Collection<string, Collection<Snowflake, number>>();
	public queues = new Collection<Snowflake, MusicQueue>();

	public constructor(public readonly client: Client) {
		this.client.login(config.TOKEN);

		this.client.on("ready", () => {
			console.log(`${this.client.user!.username} v${version} ready!`);

			this.registerSlashCommands();
		});

		this.client.on("warn", info => console.log(info));
		this.client.on("error", console.error);

		this.client.on("messageCreate", e => {
			if (/```[tj]s\n[\s\S]+\n```/.test(e.content)) {
				return new Console().run(e);
			}
		});

		this.onInteractionCreate();
	}

	private async registerSlashCommands() {
		const rest = new REST({version: "9"}).setToken(config.TOKEN);

		for (const file of await readdir(join(__dirname, "..", "commands"))) {
			const command: SlashCommand = require(join(__dirname, "..", "commands", file));
			const name = file.split(".")[0];

			this.slashCommands.push(command.build(name));
			this.slashCommandsMap.set(name, command);
		}

		await rest.put(Routes.applicationCommands(this.client.user!.id), {
			body: this.slashCommands,
		});
	}

	private async onInteractionCreate() {
		this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
			if (!interaction.isChatInputCommand()) return;

			const command = this.slashCommandsMap.get(interaction.commandName);

			if (!command) return;

			if (!this.cooldowns.has(interaction.commandName)) {
				this.cooldowns.set(interaction.commandName, new Collection());
			}

			const now = Date.now();
			const timestamps: any = this.cooldowns.get(interaction.commandName);
			const cooldownAmount = (command.cooldown || 1) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return interaction.reply({
						content: i18n.__mf("common.cooldownMessage", {
							time: timeLeft.toFixed(1),
							name: interaction.commandName,
						}),
						ephemeral: true,
					});
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				const permissionsCheck = await command.checkPermissions(interaction);

				if (permissionsCheck.result) {
					await command.execute(interaction);
				} else {
					throw new MissingPermissionsException(permissionsCheck.missing);
				}
			} catch (error: any) {
				console.error(error);

				if (error.message.includes("permissions")) {
					interaction.reply({content: error.toString(), ephemeral: true}).catch(console.error);
				} else {
					interaction
						.reply({
							content: i18n.__("common.errorCommand"),
							ephemeral: true,
						})
						.catch(console.error);
				}
			}
		});
	}
}
