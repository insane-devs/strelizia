const { Command } = require('klasa');
const { EMOTES: { cross, check } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Manage /r/ZeroTwo ban appeals.',
			extendedHelp: 'No extended help available.',
			usage: '<add|edit|rem> <User:user> [Note:string] [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async add(message, [user, ...note]) {
		note = note.length ? note.join(this.usageDelim) : 'No reason provided.';
		const appeals = message.guild.settings.get('appeals.list');
		if (appeals.find(({ user: userID }) => userID === user.id)) throw `${cross}  ::  User is already in the list.`;

		await message.guild.settings.update('appeals.list', {
			user: user.id,
			notes: note,
			moderator: message.author.id
		}, message.guild, { action: 'add' });

		this.client.emit('appealsWatcher', message);
		return message.send(`${check}  ::  Successfuly added user to the list.`);
	}

	async edit(message, [user, ...note]) {
		const appeals = message.guild.settings.get('appeals.list');
		const entry = appeals.find(({ user: userID }) => userID === user.id);

		if (!entry) throw `${cross}  ::  I cannot find this user in the list.`;
		if (!note.length) throw `${cross}  ::  Note is a required argument.`;

		entry.notes = note.join(this.usageDelim);
		await message.guild.settings.update('appeals.list', entry, message.guild, { arrayPosition: appeals.indexOf(entry) });

		this.client.emit('appealsWatcher', message);
		return message.send(`${check}  ::  Successfully edited the notes for this user.`);
	}

	async rem(message, [user]) {
		const appeals = message.guild.settings.get('appeals.list');
		const entry = appeals.find(({ user: userID }) => userID === user.id);

		if (!entry) throw `${cross}  ::  I cannot find this user in the list.`;

		await message.guild.settings.update('appeals.list', entry, message.guild, { action: 'remove' });

		this.client.emit('appealsWatcher', message);
		return message.send(`${check}  ::  Successfully removed user from the list.`);
	}

};
