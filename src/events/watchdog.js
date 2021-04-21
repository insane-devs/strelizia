const { MessageEmbed } = require('discord.js');
const { Event, util: { chunk } } = require('klasa');

const titles = {
	high:	'<:dnd:415894324522254338> **High Priority**',
	medium:	'<:idle:415894324610596865> **Medium Priority**',
	low:	'<:online:415894324652277762> **Low Priority**',
	left:	'**Members who left/were banned**'
};

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
			.setColor('RED')
			.setTimestamp();

		['high', 'medium', 'low'].map(priority => this.addFields(embed, this._filterByPriority(watchlistData, priority), priority));

		const leftMembers = this._filterLeftMembers(watchlistData);

		if (leftMembers.length) {
			this.addFields(embed, leftMembers, 'left');
		}

		return embed;
	}

	// Create a function that splits the text into multiple fields, preventing character limits
	addFields(embed, str, priority) {
		if (str.length > 1028) {
			const chunks = chunk(str.split('\n'), 5);

			for (let i = 0; i < chunks.length; i++) {
				if (i === 0) {
					embed.addField(titles[priority], chunks[i]);
				} else {
					embed.addField('\u200b', chunks[i]);
				}
			}
		} else {
			embed.addField(titles[priority], str);
		}

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
