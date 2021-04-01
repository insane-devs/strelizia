const { MessageEmbed } = require('discord.js');
const { Event } = require('klasa');

module.exports = class extends Event {

	async run(message) {
		const { list, channel, messageID: id } = message.guild.settings.get('appeals');
		const appealsChannel = this.client.channels.cache.get(channel);

		if (!(channel || appealsChannel)) return;

		try {
			const msg = await appealsChannel.messages.fetch(id);
			await msg.edit(this.buildEmbed(message, list));
		} catch (err) {
			const msg = await appealsChannel.send(this.buildEmbed(message, list));
			await message.guild.settings.update('appeals.messageID', msg.id, message.guild);
		}
	}

	buildEmbed(message, appealList) {
		const embed = new MessageEmbed()
			.setAuthor(`Appeals for ${message.guild}`, message.guild.iconURL({ dynamic: true }))
			.setColor('BLUE')
			.setDescription(appealList.map(({ user, notes }) => `• <@!${user}> | ${notes}`).join('\n'));

		return embed;
	}

};
