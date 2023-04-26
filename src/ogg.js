import axios from 'axios';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { RemoveFile } from './utils.js';

const __dirName = dirname(fileURLToPath(import.meta.url));

class OggConverter {
	constructor() {
		// устанавливаем путь до конвертора
		ffmpeg.setFfmpegPath(installer.path);
	}

	toMp3(input, output) {
		try {
			const outputPath = resolve(dirname(input), `${output}.mp3`);
			return new Promise((resolve, reject) => {
				ffmpeg(input)
					.inputOption('-t 30')
					.output(outputPath)
					.on('end', () => {
						resolve(outputPath);
						RemoveFile(input);
					})
					.on('error', (err) => reject(err.message))
					.run();
			});
		} catch (e) {
			console.log(`Error with converting to mp3 ${e.message}`);
		}
	}

	async create(url, filename) {
		try {
			//Создаем каталог для голосовых сообщений
			const oggPath = resolve(__dirName, '../voices', `${filename}.ogg`);
			//Получаем файл по url
			const response = await axios({
				method: 'get',
				url,
				responseType: 'stream',
			});

			return new Promise((resolve) => {
				const stream = createWriteStream(oggPath);
				response.data.pipe(stream);
				stream.on('finish', () => resolve(oggPath));
			});
		} catch (e) {
			console.log(`Error with GET file ${e.message}`);
		}
	}
}

export const ogg = new OggConverter();
