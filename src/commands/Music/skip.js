const { Command } = require('klasa');
const { EMOTES: { cross, check } } = require('#util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			enabled: true,
			runIn: ['text'],
			requiredPermissions: [],
			requiredSettings: [],
			cooldown: 0,
			permissionLevel: 0,
			description: 'Skips the current song',
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
		music.skip();
		const [song] = music.queue;
		await message.send(`${check}  ::  Successfully skipped song.`);
		if (!music.queue.length) {
			music.destroy();
			return message.channel.send('No more songs left in the queue');
		}
		music.play();
		return message.channel.send(`Now playing: **${song.info.title}** by __${song.info.author}__ (Requested by: ${(await this.client.users.fetch(song.requester)).username})`);
	}

};
