const HayasakaClient = require('./lib/structures/HayasakaClient');
const { token, prefix } = require('../config');

new HayasakaClient({
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
	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
	regexPrefix: /^((?:Hey )?(Haya|Hayasaka)(?:,|!| ))/i,
	typing: true
}).login(token);
