const HayasakaClient = require('./lib/structures/HayasakaClient');
const { token, prefix } = require('../config');

new HayasakaClient({
	fetchAllMembers: false,
	prefix: prefix,
	commandEditing: true,
	commandLogging: true,
	owners: ['296862433136476160', '295391820744228867'],
	pieceDefaults: {
		commands: {
			deletable: true
		}
	},
	consoleEvents: {
		verbose: true
	},
	console: {
		useColor: true
	},
	regexPrefix: /^((?:Hey )?(Haya|Hayasaka)(?:,|!| ))/i,
	typing: true,
	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`
}).login(token);
