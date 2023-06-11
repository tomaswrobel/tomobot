/*
 * This is a custom implementation of a slash command
 * It does not come from EvoBot
 *
 * It works perfectly with the TypeScript IntelliSense.
 * To simplify the reply, you can use Async Generators.
 * When you yield a value, it will be sent as a message.
 * If you need access to `interaction`, you can use `this`.
 */
import {
	type RepliableInteraction,
	type ChatInputCommandInteraction,
	type BaseMessageOptions,
	type SharedSlashCommandOptions,
	SlashCommandBuilder,
	type CommandInteractionOptionResolver,
	type PermissionResolvable,
	ButtonInteraction,
} from "discord.js";

/**
 * A slash command
 * @template O The options of the command
 */
class SlashCommand<O extends SlashCommand.Options[] = []> {
	private options: O;
	/**
	 * The constructor of the command
	 * @param data The information about the command
	 * @param fn The Async Generator Function. Yield a string or an object to reply to the interaction
	 * @param options The options of the command
	 */
	public constructor(
		private data: SlashCommand.Data,
		private fn: (
			this: RepliableInteraction,
			...args: SlashCommand.ExtractParams<O>
		) => AsyncGenerator<string | BaseMessageOptions | (typeof SlashCommand)["DEFER" | "DELETE"]>,
		...options: O
	) {
		this.options = options;
	}

	/**
	 * Build the command
	 * @param name The name of the command
	 * @returns The built command
	 */
	public build(name: string) {
		const builder = new SlashCommandBuilder().setName(name);

		if (this.data.description) {
			builder.setDescription(this.data.description);
		}

		for (const {type, name, description, required = false} of this.options) {
			builder[`add${type}Option`]((option: any) =>
				option.setName(name).setDescription(description).setRequired(required)
			);
		}

		return builder;
	}

	/**
	 * Execute from a slash command interaction
	 */
	public execute(interaction: ChatInputCommandInteraction) {
		return this.run(
			interaction,
			// @ts-expect-error - It is not possible to type this correctly
			...this.options.map(({type, name, required}) => interaction.options[`get${type}`](name, required))
		);
	}

	/**
	 * Synthetically execute from a button interaction
	 * @param interaction Interaction
	 * @param args The arguments of the command
	 */
	public async run(interaction: RepliableInteraction, ...args: SlashCommand.ExtractParams<O>) {
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

	public async checkPermissions(interaction: ChatInputCommandInteraction) {
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

	public static readonly DEFER = Symbol("DEFER");
	public static readonly DELETE = Symbol("DELETE");

	public get cooldown() {
		return this.data.cooldown;
	}

	public get description() {
		return this.data.description;
	}
}

declare namespace SlashCommand {
	interface Data {
		/**
		 * The description of the command
		 */
		description: string;
		cooldown?: number;
		/**
		 * The permissions required to run the command
		 */
		permissions?: PermissionResolvable[];
	}

	type OptionsInterfaceMap = {
		[K in keyof SharedSlashCommandOptions as K extends `add${infer R}Option`
			? R
			: never]: SharedSlashCommandOptions[K] extends (builder: (a: any) => infer A) => any ? A : never;
	};

	type OptionsMap = {
		[K in keyof OptionsInterfaceMap]: ReturnType<CommandInteractionOptionResolver[`get${K}`]>;
	};

	interface Options {
		/**
		 * The name of the option
		 */
		name: string;
		/**
		 * The type of the option
		 */
		type: keyof OptionsMap;
		/**
		 * Whether the option is required
		 * If true, the value is non-nullable
		 */
		required?: boolean;
		/**
		 * The description of the option
		 * This is shown in the help menu
		 */
		description: string;
	}

	type ExtractParams<O extends Options[]> = [
		...{
			[K in keyof O]: Exclude<
				OptionsMap[O[K]["type"]],
				// If the option is required, the value is non-nullable
				O[K]["required"] extends true ? null : never
			>;
		}
	];
}

export default SlashCommand;
