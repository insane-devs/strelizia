import { Command } from "@sapphire/framework";

export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder.setName("ping").setDescription("Check that the bot is responding")
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply("Pong!");
  }
}
