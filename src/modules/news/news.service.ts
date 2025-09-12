import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NewsEntity } from '../../entities/news.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateNewDto } from './dto/update-new.dto';

@Injectable()
export class NewService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async updateOrCreateNew(dto: UpdateNewDto) {
    const news = await this.newsRepository.findOne({
      where: {},
    });

    if (!news) {
      const newNews = this.newsRepository.create({
        title: dto.title,
        content: dto.content,
      });
      return await this.newsRepository.save(newNews);
    }

    news.title = dto.title;
    news.content = dto.content;
    return await this.newsRepository.save(news);
  }

  async findNew() {
    const newData = await this.newsRepository.findOne({
      where: {},
    });
    return newData;
  }
}
