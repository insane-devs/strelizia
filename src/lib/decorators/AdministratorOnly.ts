import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { envParseArray } from '../env-parser';

export function AdministratorOnly(): MethodDecorator {
	return createFunctionPrecondition(async (message: Message) => {
		if (
			!envParseArray('OWNERS').includes(message.author.id) ||
			!message.member!.permissions.toArray().some((perms) => ['ADMINISTRATOR'].includes(perms))
		) {
			throw new UserError({ message: 'This command can only run by Administrators!', identifier: 'permissionsMissing' });
		}
		return true;
	});
}
