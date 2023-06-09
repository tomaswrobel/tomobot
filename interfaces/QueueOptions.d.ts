import {VoiceConnection} from "@discordjs/voice";
import {CommandInteraction, TextChannel} from "discord.js";

export interface QueueOptions {
	interaction: CommandInteraction | ButtonInteraction;
	textChannel: TextChannel;
	connection: VoiceConnection;
}
