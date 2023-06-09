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
		.setName("az-quiz"),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("⏳ Loading...").catch(console.error);
		const az = new AZ();

		async function update() {
			const buffer = await sharp(Buffer.from(az.toSVG())).png().toBuffer();

			await interaction.editReply({
				content: "AZ plane",
				files: [new AttachmentBuilder(buffer, {name: "az.png"})],
			});
		}

		await update();

		const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("az-quiz")
				.setLabel("Ask")
				.setStyle(ButtonStyle.Primary)
		);

		const reply2 = await interaction.editReply({
			components: [actions],
		});

		const collector = reply2.createMessageComponentCollector({
			componentType: ComponentType.Button,
		});

		collector.on("collect", async interaction => {
			await interaction.reply("⏳ Loading...").catch(console.error);

			const [quiz] = await fetch(
				"https://the-trivia-api.com/v2/questions/?limit=1"
			).then(res => res.json());

			const reply = await interaction.editReply({
				content: "📝 **" + quiz.question.text + "**",
				components: [
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.addOptions(
								[...quiz.incorrectAnswers, quiz.correctAnswer]
									.sort(() => Math.random() - 0.5)
									.map(answer =>
										new StringSelectMenuOptionBuilder()
											.setLabel(answer)
											.setValue(answer)
									)
							)
							.setCustomId("quiz")
							.setMaxValues(1)
							.setMinValues(1)
							.setPlaceholder("Select an answer")
					),
				],
			});

			const collector = reply.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
			});

			collector.on("collect", async interaction => {
				await interaction.reply("⏳ Loading...").catch(console.error);

				if (interaction.values[0] === quiz.correctAnswer) {
					await interaction.followUp("✅ **Correct**");
					az.set(3, "blue");
				} else {
					await interaction.followUp(
						"❌ **Wrong!**. The correct answer was **" +
							quiz.correctAnswer +
							"**"
					);
					az.set(3, "black");
				}

				await update();
			});
		});
	},
};
