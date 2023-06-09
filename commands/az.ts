import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import sharp from "sharp";
import AZ from "../structs/AZ";

export default {
	data: new SlashCommandBuilder()
		.setDescription("Starts an AZ quiz")
		.setName("az-quiz")
        .addUserOption(option => option.setName("user").setDescription("The oponent to play against").setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("Starting AZ quiz...");
		await new AZ(interaction).start();
	},
};
