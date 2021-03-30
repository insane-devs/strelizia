const StreliziaClient = require('./lib/structures/StreliziaClient');
const { token, prefix } = require('../config');

new StreliziaClient({
	commandEditing: true,
	commandLogging: true,
	console: {
		useColor: true
	},
	consoleEvents: {
		verbose: true
	},
	fetchAllMembers: false,
	messageCacheMaxSize: 30,
	messageCacheLifetime: 300,
	messageSweepInterval: 600,
	restSweepInterval: 60,
	restTimeOffset: 100,
	owners: ['296862433136476160', '295391820744228867'],
	pieceDefaults: {
		commands: {
			deletable: true
		}
	},
	prefix: prefix,
	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.cache.size} guilds.`,
	regexPrefix: /^((?:Hey )?(Haya|Hayasaka)(?:,|!| ))/i,
	typing: true,
	ws: {
		intents: [
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_BANS',
			'GUILD_EMOJIS',
			'GUILD_INTEGRATIONS',
			'GUILD_WEBHOOKS',
			'GUILD_INVITES',
			'GUILD_VOICE_STATES',
			'GUILD_PRESENCES',
			'GUILD_MESSAGES',
			'GUILD_MESSAGE_REACTIONS',
			'GUILD_MESSAGE_TYPING',
			'DIRECT_MESSAGES',
			'DIRECT_MESSAGE_REACTIONS'
		]
	}
}).login(token);
