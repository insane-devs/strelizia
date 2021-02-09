const { Command } = require('klasa');
const { EMOTES: { cross, check } } = require('../../../../hotdog/src/lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			description: 'Shuffles the current music queue.',
			extendedHelp: 'No extended help available.'
		});
	}

	async run(message) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel`;
		if (!music.player) throw `${cross}  ::  I am not currently playing any music in this server`;
		if (message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this!`;
		music.shuffle();
		return message.send(`${check}  ::  Successfully shuffled songs in the queue`);
	}

};
