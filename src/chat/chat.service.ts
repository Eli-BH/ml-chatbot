import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { OpenaiService } from 'src/openai/openai.service';

@Injectable()
export class ChatService {
  constructor(private openaiService: OpenaiService) {}

  //notes?limit=10`
  //activityTypes
  //users
  //leads
  ///activities?limit=5&user_id=16904093

  async create(createChatDto: CreateChatDto) {
    try {
      const response = await this.openaiService.getChatResponse(
        createChatDto.message,
      );

      return response;
    } catch (error) {
      return 'Sorry, I am unable to process your request at the moment.';
    }
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
