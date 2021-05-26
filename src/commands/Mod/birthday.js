const { Command, Duration: { toNow } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { EMOTES: { cross, check } } = require('#lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text', 'dm', 'group'],
			aliases: ['hbd'],
			permissionLevel: 6,
			description: 'Happy Birthday!',
			extendedHelp: 'No extended help available.',
			usage: '[list|remove] [Member:member]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(message, [member]) {
		if (!member) throw `${cross}  ::  Member is a required argument.`;
		const entry = this.client.schedule.tasks.some(task => task.taskName === 'hbd' && task.data.id === member.id);
		if (entry) throw `${cross}  ::  This member is already added into the database.`;

		await member.roles.add('789359547387084840')
			.catch(() => {
				throw `${cross}  ::  Something went wrong while giving that member a role, please try again.`;
			});
		await this.client.schedule.create('hbd', Date.now() + (1000 * 60 * 60 * 24), {
			data: {
				guildID: message.guild.id,
				id: member.id
			}
		});

		return message.react('🎉');
	}

	async list(message) {
		const tasks = this.client.tasks.filter(task => task.taskName === 'hbd');
		if (!tasks.length) throw `${cross}  ::  There aren't any active birtdays at the moment.`;

		return message.send(new MessageEmbed()
			.setColor('PINK')
			.setTitles(`Birthdays in ${message.guild.name}`)
			.setDescription(tasks.map(entry => `<@!${entry.id}> (${toNow(entry.time)})`)));
	}

	async remove(message, [member]) {
		if (!member) throw `${cross}  ::  Member is a required argument.`;
		const entry = this.client.schedule.tasks.find(task => task.taskName === 'hbd' && task.data.id === member.id);

		await member.roles.remove('789359547387084840')
			.catch(() => {
				throw `${cross}  ::  Something went wrong while removing the role from the user, please try again.`;
			});

		if (!entry) throw `${cross}  ::  This member is not in the database.`;

		await this.client.schedule.delete(entry.id);

		return message.send(`${check}  ::  Successfully removed member from the database.`);
	}

};
