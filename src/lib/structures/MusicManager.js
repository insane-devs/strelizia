const { Collection, Guild } = require('discord.js');
const MusicPlayer = require('./MusicPlayer');

module.exports = class MusicManager extends Collection {

	/**
	 * Creates a new player for this guild
	 * @param {Guild} guild A guild instance
	 * @returns {MusicManager}
	 */
	add(guild) {
		if (!(guild instanceof Guild)) throw "Parameter 'guild' must be a Guild instance";
		if (this.has(guild.id)) return this.get(guild.id);
		const guildPlayer = new MusicPlayer(guild);
		this.set(guild.id, guildPlayer);
		return guildPlayer;
	}

};
