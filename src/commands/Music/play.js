const { Command } = require('klasa');

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

		if (!message.member || !message.member.voice.channel) throw '<:xmark:415894324719386634>  ::  You must be in a voice channel';
		if (!message.member.voice.channel.permissionsFor(message.guild.me).serialize().CONNECT) throw '<:xmark:415894324719386634>  ::  I do not have the correct permissions to join that channel';
		if (!message.member.voice.channel.permissionsFor(message.guild.me).serialize().SPEAK) throw '<:xmark:415894324719386634>  ::  Please allow me to speak in this channel so that I can play music';

		if (!music.player) music.join(message.member.voice.channel.id);

		if (music.voiceChannel && message.member.voice.channel.id !== music.voiceChannel.id) throw '<:xmark:415894324719386634>  ::  We should be on the same voice channel for you to do this';

		const song = await music.handleSong(track);
		song.requester = message.author.id;

		if (/[?&]list/.test(track)) {
			song.forEach(data => {
				data.requester = message.author.id;
				music.queue.push(data);
			});
			await message.channel.send(`<:checkmark:415894323436191755>  ::  Added **${song.length}** songs to the queue!`);
		} else if (music.queue.length) {
			song.requester = message.author.id;
			music.queue.push(song);
			await message.channel.send(`<:checkmark:415894323436191755>  ::  Added **${song.info.title}** by __${song.info.author}__ to the queue!`);
		} else {
			music.queue.push(song);
		}

		if (!music.player.playing) {
			const [currentTrack] = music.queue;
			await music.play()
				.catch((err) => message.send(err));
			music.textChannel = message.channel;
			if (!music.voiceChannel) await message.channel.send(`Connected to voice channel and now bound to ${music.textChannel}`);
			await music.textChannel.send(`Now playing: **${currentTrack.info.title}** by __${currentTrack.info.author}__`);

			music.player.on('end', async data => {
				if (data.reason === 'REPLACED') return;
				if (currentTrack.info.isStream) return;

				music.skip();
				const [nextTrack] = music.queue;
				await music.play()
					.catch((err) => message.send(err));
				if (!nextTrack) {
					this.client.schedule.create('musicLeave', Date.now() + (1000 * 60 * 5), {
						data: {
							guild: message.guild
						}
					});
				}
				await music.textChannel.send(`Now playing: **${nextTrack.info.title}** by __${nextTrack.info.author}__`);
			});
		}

		return null;
	}

};
