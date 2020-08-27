const playlistIDRegex = new RegExp('[&?]list=([a-z0-9_-]+)', 'i');
const fetch = require('node-fetch');
class MusicPlayer {

	constructor(guild) {
		Object.defineProperty(this, 'client', { value: guild.client });
		Object.defineProperty(this, 'guild', { value: guild });

		this.queue = [];
		this.channel = null;
		this.isPlaying = false;
		this.paused = false;
		this.volume = 100;
	}

	/**
	 * Joins a voice channel
	 * @param {string} channel A voice channel id
	 * @returns {MusicPlayer}
	 */
	join(channel) {
		return this.client.lavacord.join({
			guild: this.guild.id,
			channel: channel,
			node: this.client.lavacord.idealNodes[0].id
		}, { selfdeaf: true });
	}

	/**
	 * Play track from the queue
	 * @async
	 * @returns {MusicPlayer}
	 */
	async play() {
		if (!this.voiceChannel) throw '<:xmark:415894324719386634>  ::  I am not in a voice channel.';
		if (!this.player) throw '<:xmark:415894324719386634>  ::  I could not find a connection.';
		if (!this.queue.length) throw 'No more songs left in the queue.';
		const [song] = this.queue;
		await this.player.play(song.track);
		this.isPlaying = true;
		return this.player;
	}

	/**
	 * Leave the voice channel
	 * @async
	 * @returns {MusicPlayer}
	 */
	async leave() {
		if (this.player && this.isPlaying) this.player.stop();
		await this.client.lavacord.leave(this.guild.id);
		this.isPlaying = false;
		return this;
	}

	/**
	 * Skips through current track and plays the next track
	 * @returns {MusicPlayer}
	 */
	skip() {
		if (!this.player) return null;
		this.queue.shift();
		return this;
	}

	/**
	 * Pauses the player
	 * @returns {MusicPlayer}
	 */
	pause() {
		if (!this.player) return null;
		this.player.pause(true);
		this.paused = true;
		return this;
	}

	/**
	 * Resumes the player
	 * @returns {MusicPlayer}
	 */
	resume() {
		if (!this.player) return null;
		this.player.pause(false);
		this.paused = false;
		return this;
	}

	/**
	 * Shuffles current music queue
	 * @returns {MusicPlayer}
	 */
	shuffle() {
		if (!this.player) return null;
		if (!this.queue.length) return null;
		const [currentTrack] = this.queue;
		this.queue.shift();
		for (let i = this.queue.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
		}
		this.queue.unshift(currentTrack);
		return this;
	}

	/**
	 * Clears the music queue
	 * @returns {MusicPlayer}
	 */
	clearQueue() {
		if (!this.player) return null;
		const [song] = this.queue;
		this.queue = [];
		this.queue.unshift(song);
		return this;
	}

	/**
	 * Destroys the player and leaves voice channel
	 * @returns {boolean}
	 */
	async destroy() {
		this.queue = [];
		this.channel = null;
		this.isPlaying = false;
		this.paused = false;
		this.volume = 100;

		await this.leave();
		this.client.music.delete(this.guild.id);
	}

	/**
	 * Sets the player's volume
	 * @param {number} intensity The new  player volume
	 * @returns {MusicPlayer}
	 */
	setVolume(intensity) {
		if (!this.player) return null;
		this.player.volume(intensity);
		this.volume = intensity;
		return this;
	}

	async getSong(search) {
		let str = search;
		// This gets the best node available, what I mean by that is the idealNodes getter will filter all the connected nodes and then sort them from best to least beast.
		const node = this.client.lavacord.idealNodes[0];
		if (playlistIDRegex.test(search)) str = `https://youtube.com/playlist?list=${playlistIDRegex.exec(search)[1]}`;
		const params = new URLSearchParams();
		params.append('identifier', str);

		return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
			.then(res => res.json())
			.then(data => data.tracks)
			.catch(err => {
				console.error(err);
				return null;
			});
	}

	async handleSong(track) {
		let songs;

		try {
			// eslint-disable-next-line no-new
			new URL(track);
			songs = await this.getSong(track);
		} catch (err) {
			songs = await this.getSong(`ytsearch: ${track}`);
		}
		if (!songs) throw 'There was an error with your search query, try again another keyword';
		if (!songs.length) throw 'No tracks found';

		if (/[?&]list/.test(track)) return songs;

		return songs[0];
	}

	get player() {
		return this.client.lavacord.players.get(this.guild.id) || null;
	}

	get voiceChannel() {
		return this.guild.me.voice.channel || null;
	}

}

module.exports = MusicPlayer;
