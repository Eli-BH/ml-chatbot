import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAi from 'openai';
import { PipedriveService } from 'src/pipedrive/pipedrive.service';
@Injectable()
export class OpenaiService {
  private openai: OpenAi;

  constructor(
    private readonly configService: ConfigService,
    private pipedriveService: PipedriveService,
  ) {
    this.openai = new OpenAi({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getChatResponse(query: string): Promise<string> {
    const prompt = `
      You are a smart assistant connected to several endpoints that provide data about notes, activity types, users, leads, and specific user activities. Based on the user’s query, you must determine the most relevant endpoint to use from the following list and respond with only the selected endpoint (no other text):

      1. notes : Retrieves a limited set of notes (maximum of 5).
      2. activityTypes : Returns all available types of activities.
      3. users: Retrieves information about all users.
      4. leads : Returns a list of all leads.
      5. activities?limit=5&user_id=16904093: Fetches the last 5 activities for the user with ID 16904093.

      For each query:
      - Analyze the request and select the endpoint that best fits the user’s needs.
      - Respond with only the endpoint name (e.g., notes) and no additional text and no quotation marks.
    `;

    const analysisPrompt = `
    You are a helpful assistant analyzing information provided in a list or set of details. Focus only on providing high-level, human-friendly insights. Describe patterns, trends, and important points in plain language, without mentioning technical details or fields.
    
    For each set of information:
    1. Summarize what it’s generally about (e.g., “This looks like a list of recent activities” or “These appear to be messages exchanged recently”).
    2. Highlight useful insights that a person might want to know, such as:
       - Common times or dates for activities or messages.
       - Frequent contacts or notable exchanges with specific people.
       - Any unique patterns, like a lot of messages from one sender or specific days with high activity.
    3. If there are any particularly important items (like repeated messages from one person, or lots of recent activities), point these out in a simple, friendly way.
    
    Respond as a helpful assistant offering only useful insights, without technical details.
    
    Example responses:
    - “This is a list of activities, with most happening in the morning. You’ve had frequent check-ins with a few key contacts.”
    - “There are a lot of messages here, with several exchanges from one contact in particular.”
    - “It looks like there’s a pattern of increased activity on Mondays and Wednesdays.”
    `;

    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          { role: 'user', content: query },
        ],
        model: 'gpt-4',
      });

      const endpoint = response.choices[0].message.content;

      const pipeDriveResponse =
        await this.pipedriveService.getPipedriveData(endpoint);

      const { data } = pipeDriveResponse;

      const shortenedData = JSON.stringify(data.slice(0, 5));
      const analysisResponse = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: analysisPrompt,
          },
          { role: 'user', content: shortenedData },
        ],
        model: 'gpt-4',
      });

      return analysisResponse.choices[0].message.content;
    } catch (error) {
      return 'Sorry, I am unable to process your request at the moment.';
    }
  }
}
