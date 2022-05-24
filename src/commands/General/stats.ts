import { ApplyOptions } from '@sapphire/decorators';
import { Command, version as sapphireVersion } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { DurationFormatter } from '@sapphire/time-utilities';
import { version as discordVersion } from 'discord.js';
import { loadavg, uptime } from 'os';
import { codeBlock } from '@discordjs/builders';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: "Display the bot's statistics.",
	chatInputCommand: { register: true }
})
export class UserCommand extends SubCommandPluginCommand {
	public async chatInputRun(interaction: Command.ChatInputInteraction) {

		return interaction.reply({
			content: codeBlock(
				'asciidoc',
				[
					'= STATISTICS =',
					`• Users     ::  ${this.container.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
					`• Guilds    ::  ${this.container.client.guilds.cache.size.toLocaleString()}`,
					`• Channels  ::  ${this.container.client.channels.cache.size.toLocaleString()}`,
					`• Version   ::  v${discordVersion}`,
					`• Node JS   ::  ${process.version}`,
					`• Sapphire     ::  ${sapphireVersion}`,
					`${
						this.container.client.options.shardCount
							? `• Shard     ::  ${((interaction.guild?.shardId ?? this.container.client.options.shards) as number) + 1} / ${
									this.container.client.options.shardCount
							  }`
							: ''
					}`,
					'',
					`= UPTIME =`,
					`• Host      ::  ${new DurationFormatter().format(uptime() * 1000)}`,
					`• Total     ::  ${new DurationFormatter().format(process.uptime() * 1000)}`,
					`• Client    ::  ${new DurationFormatter().format(this.container.client.uptime!)}`,
					'',
					`= USAGE =`,
					`• CPU Load  ::  ${Math.round(loadavg()[0] * 1000) / 100}%`,
					`• RAM +Node ::  ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
					`• RAM Used  ::  ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
				].join('\n')
			)
		});
	}
}
