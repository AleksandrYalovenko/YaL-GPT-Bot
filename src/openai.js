import { Configuration, OpenAIApi } from 'openai';
import { createReadStream } from 'fs';
import config from 'config';

class OpenAI {
	roles = {
		ASSISTANT: 'assistant',
		USER: 'user',
		SYSTEM: 'system',
	};

	constructor(apiKey) {
		const configuration = new Configuration({
			apiKey,
		});

		this.openai = new OpenAIApi(configuration);
	}

	async chat(messages) {
		try {
			const response = await this.openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages,
			});
			return response.data.choices[0].message.content;
		} catch (e) {
			console.log(`Error with GPT chat ${e.message}`);
		}
	}

	async transcription(inputmp3) {
		try {
			const response = await this.openai.createTranscription(
				createReadStream(inputmp3),
				'whisper-1'
			);
			return response.data.text;
		} catch (e) {
			console.log(`Error with transcription mp3 to text ${e.message}`);
		}
	}
}

export const openai = new OpenAI(config.get('OPEN_AI_KEY'));
