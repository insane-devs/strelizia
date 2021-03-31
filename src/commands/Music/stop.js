const { Command } = require('klasa');
const { EMOTES: { cross, check } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			requiredPermissions: [],
			requiredSettings: [],
			aliases: ['leave'],
			permissionLevel: 0,
			description: 'Stops the music and leaves the channel.',
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
		if (!music.player) throw `${cross}  ::  I am not currently playing music.`;
		if (message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this!`;
		await music.destroy();
		return message.send(`${check}  ::  Successfully stopped music and left **${message.member.voice.channel}**`);
	}

};
