const { Command } = require('klasa');
const { EMOTES: { cross } } = require('#util/constants');

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
		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel.`;
		const { music } = message.guild;
		const [np] = music.queue;
		if (!np) throw `${cross}  ::  Nothing is being played at the moment.`;
		if (!music.player) throw `${cross}  ::  I am not currently playing any music in this server.`;
		return message.send(`Now Playing: **${np.info.title}** by __${np.info.author}__ (Requested by: ${(await this.client.users.fetch(np.requester, false)).username})`);
	}

};
