const { MessageEmbed } = require('discord.js');
const { Event } = require('klasa');

module.exports = class extends Event {

	async run(message) {
		const { watchdog: { channel, messageID: id }, watchlist } = message.guild.settings;
		const textChannel = message.guild.channels.cache.get(channel);

		if (!(channel || textChannel)) return;

		// Move users to the bottom who have left/was banned.
		watchlist.forEach(async (data) => message.guild.members.fetch(data.user)
			.catch(async () => {
				data.left = true;
				return message.guild.settings.update('watchlist', data, message.guild, { arrayPosition: watchlist.indexOf(data) });
			}));

		try {
			const msg = await textChannel.messages.fetch(id);
			await msg.edit(this.buildEmbed(message, watchlist));
		} catch (err) {
			const msg = await textChannel.send(this.buildEmbed(message, watchlist));
			await message.guild.settings.update('watchdog.messageID', msg.id, message.guild);
		}
	}

	buildEmbed(message, watchlistData) {
		const embed = new MessageEmbed()
			.setAuthor(`${message.guild} watchlist`, message.guild.iconURL({ dynamic: true }))
			.addField('<:dnd:415894324522254338> **High Priority**', this._filterByPriority(watchlistData, 'high'))
			.addField('<:idle:415894324610596865> **Medium Priority**', this._filterByPriority(watchlistData, 'medium'))
			.addField('<:online:415894324652277762> **Low Priority**', this._filterByPriority(watchlistData, 'low'))
			.setColor('RED')
			.setTimestamp();
		if (this._filterLeftMembers(watchlistData).length) embed.addField('**Members who left/were banned**', this._filterLeftMembers(watchlistData));
		return embed;
	}

	// Filter watchlist array according to priority.
	_filterByPriority(array, priority) {
		const filtered = array.filter((data) => !data.left && data.priority === priority);
		return filtered.length ?
			filtered.map(({ user, reason, moderator }) => `• <@${user}> ─ ${reason} (<@${moderator}>)`).join('\n') :
			'Empty';
	}

	// Filter members who aren't in the server anymore.
	_filterLeftMembers(array) {
		return array
			.filter(data => data.left)
			.map(({ user, reason, moderator }) => `• <@${user}> ─ ${reason} (<@${moderator}>)`)
			.join('\n');
	}

};
