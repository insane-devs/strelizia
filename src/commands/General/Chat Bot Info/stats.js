const { Command, version: klasaVersion, Duration } = require('klasa');
const { version: discordVersion } = require('discord.js');
const { uptime, loadavg } = require('os');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	async run(message) {
		const now = Date.now();

		message.sendMessage([
			'= STATISTICS =',
			`• Users     ::  ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
			`• Guilds    ::  ${this.client.guilds.size.toLocaleString()}`,
			`• Channels  ::  ${this.client.channels.size.toLocaleString()}`,
			`• Version   ::  v${discordVersion}`,
			`• Node JS   ::  ${process.version}`,
			`• Klasa     ::  ${klasaVersion}`,
			// eslint-disable-next-line max-len
			`${this.client.options.shardCount ? `• Shard     ::  ${((message.guild ? message.guild.shardID : message.channel.shardID) || this.client.options.shardId) + 1} / ${this.client.options.shardCount}` : ''}`,
			'',
			`= UPTIME =`,
			`• Host      ::  ${Duration.toNow(now - (uptime() * 1000))}`,
			`• Total     ::  ${Duration.toNow(now - (process.uptime() * 1000))}`,
			`• Client    ::  ${Duration.toNow(now - this.client.uptime)}`,
			'',
			`= USAGE =`,
			`• CPU Load  ::  ${Math.round(loadavg()[0] * 1000) / 100}%`,
			`• RAM +Node ::  ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			`• RAM Used  ::  ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		].join('\n'), { code: 'asciidoc' });
	}

};
