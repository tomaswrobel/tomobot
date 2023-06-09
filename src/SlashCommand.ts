import {
	type ChatInputCommandInteraction,
	type BaseMessageOptions,
	type SharedSlashCommandOptions,
	SlashCommandBuilder,
	type CommandInteractionOptionResolver,
	type PermissionResolvable,
	ButtonInteraction,
} from "discord.js";
type OptionsInterfaceMap = {
	[K in keyof SharedSlashCommandOptions as K extends `add${infer R}Option`
		? R
		: never]: SharedSlashCommandOptions[K] extends (
		builder: (a: any) => infer A
	) => any
		? A
		: never;
};

type OptionsMap = {
	[K in keyof OptionsInterfaceMap]: ReturnType<
		CommandInteractionOptionResolver[`get${K}`]
	>;
};

type SlashCommandOptions = {
	name: string;
	type: keyof OptionsMap;
	required?: boolean;
	description: string;
};

type ExtractParams<O extends SlashCommandOptions[]> = [
	...{
		[K in keyof O]: Exclude<
			OptionsMap[O[K]["type"]],
			O[K]["required"] extends true ? null : false
		>;
	}
];

class SlashCommand<O extends SlashCommandOptions[] = []> {
	options: O;

	constructor(
		private data: {
            description: string;
			cooldown?: number;
			permissions?: PermissionResolvable[];
		},
		private fn: (
			this: ChatInputCommandInteraction| ButtonInteraction,
			...args: ExtractParams<O>
		) => AsyncGenerator<
			string | BaseMessageOptions | (typeof SlashCommand)["DEFER" | "DELETE"]
		>,
		...options: O
	) {
		this.options = options;
	}

	build(name: string) {
		const builder = new SlashCommandBuilder().setName(name);

		if (this.data.description) {
			builder.setDescription(this.data.description);
		}

		for (const {type, name, description, required = false} of this.options) {
			builder[`add${type}Option`]((option: any) =>
				option
					.setName(name)
					.setDescription(description)
					.setRequired(required)
			);
		}

		return builder;
	}

	execute(interaction: ChatInputCommandInteraction) {
		// @ts-expect-error - It is not possible to type this correctly
		return this.run(interaction, ...this.options.map(({type, name, required}) => interaction.options[`get${type}`](name, required)));
	}

	async run(interaction: ChatInputCommandInteraction | ButtonInteraction, ...args: ExtractParams<O>) {
		for await (const message of this.fn.apply(interaction, args)) {
			if (message === SlashCommand.DEFER) {
				await interaction.deferReply().catch(console.error);
			} else if (message === SlashCommand.DELETE) {
				await interaction.deleteReply().catch(console.error);
			} else if (interaction.replied) {
				await interaction.editReply(message).catch(console.error);
			} else {
				await interaction.reply(message).catch(console.error);
			}
		}
	}

	async checkPermissions(interaction: ChatInputCommandInteraction) {
		if (this.data.permissions) {
			const member = await interaction.guild!.members.fetch({
				user: interaction.client.user!.id,
			});

			const missing = member.permissions.missing(this.data.permissions);

			return {
				result: !missing.length,
				missing,
			};
		} else {
			return {
				result: true,
				missing: [],
			};
		}
	}

	static readonly DEFER = Symbol("DEFER");
	static readonly DELETE = Symbol("DELETE");

	get cooldown() {
		return this.data.cooldown;
	}

	get description() {
		return this.data.description;
	}
}

export default SlashCommand;
