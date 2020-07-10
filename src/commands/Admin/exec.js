const { Command, util, Stopwatch } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 8,

			description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
			usage: '<Expression:string>'
		});
	}

	async run(message, [input]) {
		const stopwatch = new Stopwatch().start();
		const result = await util.exec(input).catch((err) => { throw err; });
		const output = result.stdout ? `**\`OUTPUT\`**${util.codeBlock('sh', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${util.codeBlock('sh', result.stderr)}` : '';
		return message.send([output, outerr, `⏱  ::  ${stopwatch.stop()}`].join('\n'));
	}

};
