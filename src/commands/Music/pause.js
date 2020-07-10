const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			permissionLevel: 0,
			description: 'Pauses currently playing music.',
			extendedHelp: 'No extended help available.',
			usage: '',
			usageDelim: undefined,
			quotedStringSupport: false,
			subcommands: false
		});
	}

	async run(message) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw '<:xmark:415894324719386634>  ::  You must be in a voice channel';
		if (!music.player) throw '<:xmark:415894324719386634>  ::  I am not currently playing any music in this server';
		if (message.member.voice.channel.id !== music.voiceChannel.id) throw '<:xmark:415894324719386634>  ::  We should be on the same voice channel for you to do this!';
		music.pause();
		return message.send('⏸  ::  Successfully paused music');
	}

};
