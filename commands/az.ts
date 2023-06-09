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
		await interaction.reply("⏳ Loading...").catch(console.error);
		const az = new AZ(interaction);

		const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("az-quiz")
				.setLabel("Ask")
				.setStyle(ButtonStyle.Primary)
		);

		const reply = await interaction.editReply({
			components: [actions],
		});

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.Button,
		});

		collector.on("collect", async interaction => {
			const reply = await interaction.reply({
				content: "Choose a number",
				components: [
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId("az-quiz")
							.addOptions(
								az.items.filter(item => item.color === "white").map((item, i) => {
									const number = `${i + 1}`;
									return new StringSelectMenuOptionBuilder().setLabel(number).setValue(number);
								})
							)
					),
				],
			});

			const collector = reply.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
			});

			collector.on("collect", async interaction => {
				
			});
		});
	},
};
