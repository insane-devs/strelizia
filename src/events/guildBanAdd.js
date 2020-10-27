const { MessageEmbed } = require('discord.js');
const { Event, Duration } = require('klasa');

module.exports = class extends Event {

	async run(guild, user) {
		if (guild.id !== '508495069914071040') return;

		const auditData = (await guild.fetchAuditLogs({
			type: 22
		})).entries
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.find(data => data.target === user);
		if (!auditData) return;
		const { executor, reason } = auditData;

		if (executor.bot) return;
		await this.client.channels.get('573122270646501376').send(new MessageEmbed()
			.setAuthor('🚨 Member Banned', user.displayAvatarURL())
			.setDescription(`**ID**: ${user.id}`)
			.addField('User', user.tag)
			.addField('Banned by:', executor.tag, true)
			.addField('Reason', reason || 'None', true)
			.setColor('RED')
			.setFooter(`Joined Discord: ${Duration.toNow(user.createdTimestamp)} ago`)
			.setTimestamp()).catch(console.error);
	}

};
