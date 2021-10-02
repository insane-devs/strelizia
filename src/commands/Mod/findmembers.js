const { Command, util: { chunk }, RichDisplay } = require('klasa');
const { EMOTES: { typing, cross } } = require('#util/constants');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Tries to locate all members of a specfic role.',
			extendedHelp: 'No extended help available.',
			usage: '<Role:role>'
		});
	}

	async run(message, [role]) {
		await message.send(`${typing}  ::  Attemping to fetch members...`);
		const { guild } = message;

		if (role.id === message.guild.id) throw `${cross}  ::  Use the **membercount** command to view the total number of members in this server.`;

		const members = await guild.members.fetch();
		let filteredMembers = members.filter(member => member.roles.cache.has(role.id)).map(member => member.id);

		if (!filteredMembers.length) throw `${cross}  ::  I haven't found anyone with this role.`;

		const display = new RichDisplay(new MessageEmbed()
			.setColor('#f84859')
			.setAuthor(`All members with the ${role.name} role | Count: ${filteredMembers.length}`, message.guild.iconURL()));

		// Check of filteredMembers size is not more than 20, otherwise chunk by 20
		if (filteredMembers.length > 20) {
			filteredMembers = chunk(filteredMembers, 20);
			for (const members_ of filteredMembers) {
				display.addPage(template => template.setDescription(members_.map(id => `<@${id}>`)));
			}

			return display.run(await message.send(`${typing}  ::  Loading embed...`));
		} else {
			return message.send(new MessageEmbed()
				.setColor('#f84859')
				.setAuthor(`All members with the ${role.name} role | Count: ${filteredMembers.length}`, message.guild.iconURL())
				.setDescription(filteredMembers.map(id => `<@${id}>`)));
		}
	}

};
