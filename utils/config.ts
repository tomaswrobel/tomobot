export interface config {
	TOKEN: string;
	PREFIX: string;
	MAX_PLAYLIST_SIZE: number;
	PRUNING: boolean;
	STAY_TIME: number;
	DEFAULT_VOLUME: number;
	LOCALE: string;
	UNSPLASH_ACCESS_KEY: string;
	UNSPLASH_SECRET_KEY: string;
}

try {
	var config: config = require("../config.json");
} catch (error) {
	var config: config = {
		TOKEN: process.env.TOKEN || "",
		PREFIX: process.env.PREFIX || "!",
		MAX_PLAYLIST_SIZE: parseInt(process.env.MAX_PLAYLIST_SIZE!) || 10,
		PRUNING: process.env.PRUNING === "true" ? true : false,
		STAY_TIME: parseInt(process.env.STAY_TIME!) || 30,
		DEFAULT_VOLUME: parseInt(process.env.DEFAULT_VOLUME!) || 100,
		LOCALE: process.env.LOCALE || "en",
		UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || "",
		UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY || "",
	};
}

export {config};
