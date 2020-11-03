const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			aliases: ['wl'],
			permissionLevel: 6,
			description: 'Manage the /r/ZeroTwo user watchlist.',
			extendedHelp: 'No extended help available.',
			usage: '<add|remove|edit|show> [user:user] [high|medium|low] [reason:string] [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async show(message) {
		const watchlist = message.guild.settings.get('watchlist');
		return message.send(new MessageEmbed()
			.setAuthor(`${message.guild} Watchlist`, message.guild.iconURL({ dynamic: true }))
			.setColor('RED')
			.addField('<:dnd:415894324522254338> High Priority', this._filterByPriority(watchlist, 'high'))
			.addField('<:idle:415894324610596865> Medium Priority', this._filterByPriority(watchlist, 'medium'))
			.addField('<:online:415894324652277762> Low Priority', this._filterByPriority(watchlist, 'low'))
			.setTimestamp());
	}

	async add(message, [user, priority, ..._reason]) {
		if (!user) throw 'Who do I add?';
		if (!priority) throw 'Please include a priority level for this user, the options are `high`, `medium` and `low`';

		const reason = _reason.length ? _reason.join(' ') : 'No reason provided';
		const watchlist = message.guild.settings.get('watchlist');
		if (this._exists(watchlist, user.id)) throw 'This user is already in the watchlist, perhaps you would like to remove the user or edit the user\'s entry.';
		await message.guild.settings.update('watchlist', { priority, user: user.id, reason, moderator: message.author.id }, { guild: message.guild, arrayAction: 'add' });
		this.client.emit('watchdog', message);
		return message.sendEmbed({ color: 'GREEN', description: `Successfully added ${user} to the ${priority.toUpperCase()} priority watchlist.` });
	}

	async remove(message, [user]) {
		if (!user) throw 'Who do I remove?';

		const watchlist = message.guild.settings.get('watchlist');
		if (!this._exists(watchlist, user.id)) throw 'This user is not on the watchlist.';
		const entry = watchlist.find(data => data.user === user.id);
		await message.guild.settings.update('watchlist', entry, { guild: message.guild, action: 'remove' });
		this.client.emit('watchdog', message);
		return message.sendEmbed({ color: 'GREEN', description: `Successfully removed ${user} from the watchlist.` });
	}

	async edit(message, [user, priority, ..._reason]) {
		if (!user) throw 'What watchlist entry do I edit?';

		const watchlist = message.guild.settings.get('watchlist');
		if (!this._exists(watchlist, user.id)) throw 'This user is not in the watchlist, perhaps you want to add an entry?';
		const entry = watchlist.find(data => data.user === user.id);
		if (priority) {
			entry.priority = priority;
			entry.reason = _reason.length ? _reason.join(' ') : entry.reason;
		} else {
			if (!_reason.length) throw 'You did not include a new reason.';
			entry.reason = _reason.join(' ');
		}
		await message.guild.settings.update('watchlist', entry, { guild: message.guild, arrayIndex: watchlist.indexOf(entry) });
		this.client.emit('watchdog', message);
		return message.sendEmbed({ color: 'GREEN', description: `Successfully updated watchlist entry for ${user}` });
	}

	_exists(array, target) {
		return array.some(data => data.user === target);
	}

	_filterByPriority(array, priority) {
		const filtered = array.filter(data => data.priority === priority);
		return filtered.length ?
			filtered.map(({ user, reason, moderator }) => `• <@${user}> ─ ${reason} (<@${moderator}>)`).join('\n') :
			'Empty';
	}

};
