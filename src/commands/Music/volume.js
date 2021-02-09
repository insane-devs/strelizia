const { Command } = require('klasa');
const { EMOTES: { cross } } = require('../../../../hotdog/src/lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			requiredPermissions: [],
			requiredSettings: [],
			aliases: ['vol'],
			permissionLevel: 0,
			description: 'Sets the volume of the player',
			extendedHelp: 'No extended help available.',
			usage: '[Volume:integer{1,200}]'
		});
	}

	async run(message, [volume]) {
		const { music } = message.guild;
		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel`;
		if (!music.player) throw `${cross}  ::  I am not currently playing any music in this server`;
		if (message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this!`;
		if (!volume) return message.send(`🔊  ::  Current volume is **${music.volume}**`);
		music.setVolume(volume);
		return message.send(`🔊  ::  Successfully set the volume to **${volume}**`);
	}

};
