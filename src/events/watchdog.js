const { MessageEmbed } = require('discord.js');
const { Event } = require('klasa');

module.exports = class extends Event {

	async run(message) {
		const [channel, id, watchlist] = message.guild.settings.pluck('watchdog.channel', 'watchdog.messageID', 'watchlist');
		const textChannel = await message.guild.channels.cache.get(channel);

		if (!(channel || textChannel)) return;

		try {
			const msg = await textChannel.messages.fetch(id);
			await msg.edit(this.buildEmbed(message, watchlist));
		} catch (err) {
			const msg = await textChannel.send(this.buildEmbed(message, watchlist));
			await message.guild.settings.update('watchdog.messageID', msg.id, { guild: message.guild });
		}
	}

	buildEmbed(message, watchlistData) {
		return new MessageEmbed()
			.setAuthor(`${message.guild} watchlist`, message.guild.iconURL({ dynamic: true }))
			.addField('<:dnd:415894324522254338> High Priority', this._filterByPriority(watchlistData, 'high'))
			.addField('<:idle:415894324610596865> Medium Priority', this._filterByPriority(watchlistData, 'medium'))
			.addField('<:online:415894324652277762> Low Priority', this._filterByPriority(watchlistData, 'low'))
			.setColor('RED')
			.setTimestamp();
	}

	_filterByPriority(array, priority) {
		const filtered = array.filter((data) => data.priority === priority);
		return filtered.length ?
			filtered.map(({ user, reason, moderator }) => `• <@${user}> ─ ${reason} (<@${moderator}>)`).join('\n') :
			'Empty';
	}

};
