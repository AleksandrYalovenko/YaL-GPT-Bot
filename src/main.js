import config from 'config';
import { Telegraf, session } from 'telegraf';
import { code } from 'telegraf/format';
import { message } from 'telegraf/filters';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { dirname, resolve } from 'path';
import { RemoveFile } from './utils.js';

const INITAL_SESSION = {
	messages: [],
};
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

//Создадим сессию
bot.use(session());

//Комманды для создания нового контекста, нвой беседы
bot.command('new', async (ctx) => {
	ctx.session = INITAL_SESSION;
	await ctx.reply('Жду вашего запроса...');
});

bot.command('start', async (ctx) => {
	ctx.session = INITAL_SESSION;
	await ctx.reply('Жду вашего запроса...');
});

//При отправке голоса, сообщение фильтруются по voice
bot.on(message('voice'), async (ctx) => {
	ctx.session ??= INITAL_SESSION;
	try {
		await ctx.reply(code('Сообщение принял. Жду ответ от сервера.'));
		const userId = String(ctx.message.from.id);
		const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
		const oggPath = await ogg.create(link.href, userId);
		const mp3Path = await ogg.toMp3(oggPath, userId);
		//Преобразование звука в текст
		const text = await openai.transcription(mp3Path);
		//Удаляем mp3 файл
		const mp3PathForDelete = resolve(dirname(mp3Path), `${userId}.mp3`);
		RemoveFile(mp3PathForDelete);
		await ctx.reply(code(`Ваш запрос: <<${text}>>`));
		//Массив сообщений ChatGPT
		ctx.session.messages.push({ role: openai.roles.USER, content: text });
		//Получение ответа от GPT
		const response = await openai.chat(ctx.session.messages);
		//Добавляем ответ в контекст с ролью ASSISTANT и ответом в content
		ctx.session.messages.push({
			role: openai.roles.ASSISTANT,
			content: response,
		});

		//Выводим в бот
		await ctx.reply(code(`GPT ответ: <<${response}>>`));
	} catch (e) {
		console.log(`Error while voice message ${e.message}`);
	}
});

//При отправке текста, сообщение фильтруются по text
bot.on(message('text'), async (ctx) => {
	ctx.session ??= INITAL_SESSION;
	try {
		await ctx.reply(code('Сообщение принял. Жду ответ от сервера.'));
		//Массив сообщений ChatGPT
		ctx.session.messages.push({
			role: openai.roles.USER,
			content: ctx.message.text,
		});
		//Получение ответа от GPT
		const response = await openai.chat(ctx.session.messages);
		//Добавляем ответ в контекст с ролью ASSISTANT и ответом в content
		ctx.session.messages.push({
			role: openai.roles.ASSISTANT,
			content: response,
		});

		//Выводим в бот
		await ctx.reply(code(`GPT ответ: <<${response}>>`));
	} catch (e) {
		console.log(`Error while voice message ${e.message}`);
	}
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
