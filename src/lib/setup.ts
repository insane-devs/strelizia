// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import 'reflect-metadata';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@kaname-png/plugin-env/register';
import * as colorette from 'colorette';
import { config } from 'dotenv-cra';
import { join } from 'path';
import { inspect } from 'util';
import { srcDir } from './constants';
import { container } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';

// Prisma
container.prisma = new PrismaClient({
	errorFormat: 'pretty',
	log: [
		{ emit: 'stdout', level: 'warn' },
		{ emit: 'stdout', level: 'error' },
		{ emit: 'event', level: 'query' }
	]
});

// Read env var
config({ path: join(srcDir, '.env') });

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });
