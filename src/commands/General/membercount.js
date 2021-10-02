const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: [],
			requiredSettings: [],
			description: "See the server's member count.",
			extendedHelp: 'No extended help available.'
		});
	}

	async run(message) {
		return message.send(new MessageEmbed()
			.setColor('#f84859')
			.setAuthor(`Member count for ${message.guild}: ${message.guild.memberCount.toLocaleString()}`, message.guild.iconURL()));
	}

};
