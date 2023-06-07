import { ChannelType } from "discord.js";
import {
	ChatInputCommandInteraction,
	PermissionsBitField,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("delete")
		.setDescription("Delete n messages")
		.addIntegerOption(option =>
			option
				.setName("amount")
				.setDescription("Amount of messages to delete")
				.setRequired(true)
		),
	cooldown: 3,
	permissions: [PermissionsBitField.Flags.ManageMessages],
	async execute(interaction: ChatInputCommandInteraction) {
		const amount = interaction.options.getInteger("amount");

		if (amount == null || amount <= 0 || amount > 100) {
			return interaction.reply({
				content: "You need to input a number between 1 and 100.",
				ephemeral: true,
			});
		}

		const channel = interaction.channel!;

		if (channel.type === ChannelType.GuildText) {
			const messages = await channel.messages.fetch({
				limit: amount,
			});

			channel.bulkDelete(messages);
		}

		return interaction.reply({
			content: `Deleted ${amount} messages.`,
			ephemeral: true,
		});
	},
};
