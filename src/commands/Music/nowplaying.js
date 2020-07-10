const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			aliases: ['np'],
			permissionLevel: 0,
			description: 'Shows you currently playing music',
			extendedHelp: 'No extended help available.',
			usage: '',
			usageDelim: undefined,
			quotedStringSupport: false,
			subcommands: false
		});
	}

	async run(message) {
		if (!message.member || !message.member.voice.channel) throw '<:xmark:415894324719386634>  ::  You must be in a voice channel';
		const { music } = message.guild;
		const [np] = music.queue;
		if (!music.player) throw '<:xmark:415894324719386634>  ::  I am not currently playing any music in this server';
		return message.send(`Now Playing: **${np.info.title}** by __${np.info.author}__ (Requested by: ${(await this.client.users.fetch(np.requester, false)).username})`);
	}

};
