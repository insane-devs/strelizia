const { Command, util: { sleep } } = require('klasa');
const { EMOTES: { cross, check } } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 0,
			aliases: ['p'],
			description: 'Plays music on a voice channel the user is in',
			extendedHelp: 'No extended help available.',
			usage: '<Song:string>'
		});
	}

	async run(message, [track]) {
		const { music } = message.guild;
		music.textChannel = message.channel;

		if (!message.member || !message.member.voice.channel) throw `${cross}  ::  You must be in a voice channel`;
		if (!message.member.voice.channel.permissionsFor(message.guild.me).serialize().CONNECT) throw `${cross}  ::  I do not have the correct permissions to join that channel`;
		if (!message.member.voice.channel.permissionsFor(message.guild.me).serialize().SPEAK) throw `${cross}  ::  Please allow me to speak in this channel so that I can play music`;

		if (!music.player) music.join(message.member.voice.channelID);

		if (music.player && message.member.voice.channelID !== music.voiceChannelID) throw `${cross}  ::  We should be on the same voice channel for you to do this.`;

		const song = await music.handleSong(track);
		song.requester = message.author.id;

		if (/[?&]list/.test(track)) {
			song.forEach(data => {
				data.requester = message.author.id;
			});
			music.queue.push(...song);
			await message.channel.send(`${check}  ::  Added **${song.length}** songs to the queue!`);
		} else if (music.queue.length) {
			song.requester = message.author.id;
			music.queue.push(song);
			await message.channel.send(`${check}  ::  Added **${song.info.title}** by __${song.info.author}__ to the queue!`);
		} else {
			music.queue.push(song);
		}

		if (!music.player) await this.join(music, message.member.voice.channelID);
		if (music.player.playing) return null;
		return this.play(music);
	}

	async join(musicManager, id) {
		const player = await musicManager.join(id);
		const [song] = musicManager.queue;

		player.on('end', async data => {
			if (data.reason === 'REPLACED') return;
			if (song.info.isStream) return;

			musicManager.skip();
			await this.play(musicManager);
		}).on('error', async data => {
			await musicManager.textChannel.send(`Something went wrong playing that song, ${data.reason || data.error}`);
			musicManager.skip();
			await this.play(musicManager);
		});

		return player;
	}

	async play(musicManager) {
		const [song] = musicManager.queue;

		if (!song) {
			musicManager.textChannel.send('No more songs left in the queue.');
			return this.client.schedule.create('musicLeave', Date.now() + (1000 * 60 * 5), {
				data: {
					guildID: musicManager.guild.id
				}
			});
		}

		await sleep(300);

		await musicManager.play();
		await musicManager.textChannel.send(`Now playing: **${song.info.title}** by __${song.info.author}__`);

		return musicManager.player;
	}

};
