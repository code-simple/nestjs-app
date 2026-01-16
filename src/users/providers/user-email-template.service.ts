import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EmailTypesEnum } from 'src/email/types/common';
import { UserEmailTemplate } from 'src/user-email-template-management/entities/userEmailTemplate.entity';

@Injectable()
export class UserEmailTemplateService {
  constructor(
    @InjectRepository(UserEmailTemplate)
    private readonly userEmailTemplateRepository: Repository<UserEmailTemplate>,
  ) {}

  async findOneByIdAndUserId(
    emailTemplateId: number,
    userId: number,
  ): Promise<UserEmailTemplate | null> {
    return this.userEmailTemplateRepository.findOne({
      where: { id: emailTemplateId, user: { id: userId } },
    });
  }

  async save(template: UserEmailTemplate): Promise<UserEmailTemplate> {
    return this.userEmailTemplateRepository.save(template);
  }

  async findByField(field: keyof UserEmailTemplate, value: any): Promise<UserEmailTemplate[]> {
    if (field === 'user') {
      return this.userEmailTemplateRepository.find({
        where: { user: { id: value } },
        relations: ['user'],
      });
    }
    return this.userEmailTemplateRepository.find({
      where: { [field]: value },
      relations: ['user'],
    });
  }

  async create({
    user,
    emailType,
    subject,
    emailHtml,
  }: {
    user: User | number;
    emailType: EmailTypesEnum;
    subject: string;
    emailHtml: string;
  }): Promise<UserEmailTemplate> {
    let userEntity: User;
    if (typeof user === 'number') {
      // If user is an id, fetch the user entity
      userEntity = await this.userEmailTemplateRepository.manager.findOneOrFail(User, {
        where: { id: user },
      });
    } else {
      userEntity = user;
    }
    const template = this.userEmailTemplateRepository.create({
      user: userEntity,
      emailType,
      subject,
      emailHtml,
    });
    return this.userEmailTemplateRepository.save(template);
  }
}
