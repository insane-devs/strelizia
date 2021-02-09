const { Command } = require('klasa');
const { EMOTES: { cross, check } } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			permissionLevel: 0,
			description: 'Resumes music in the queue.',
			extendedHelp: 'No extended help available.',
			usage: '',
			usageDelim: undefined,
			quotedStringSupport: false,
			subcommands: false
		});
	}

	async run(message) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel`;
		if (!music.player) throw `${cross}  ::  I am not currently playing any music in this server`;
		if (message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this!`;
		music.resume();
		return message.send(`${check}  ::  Resuming music...`);
	}

};
