const { Client } = require('klasa');
const { Manager } = require('@lavacord/discord.js');
const { lavalinkConfig: { nodes } } = require('../../../config');
const MusicManager = require('../../../../hayasaka/src/lib/structures/MusicManager');

require('../schemas/ClientSchema');
require('../schemas/GuildSchema');
require('../util/PermissionLevels');
require('../structures/HayasakaGuild');

module.exports = class HayasakaClient extends Client {

	constructor(options) {
		super(options);

		this.music = new MusicManager();
		this.lavacord = null;

		this.once('ready', this._ready.bind(this));
	}

	_ready() {
		this.lavacord = new Manager(this, nodes, {
			user: this.user.id,
			shards: this.options.shardCount
		});
		this.emit('log', 'Music module ready.');
		return this.lavacord.connect();
	}

};
