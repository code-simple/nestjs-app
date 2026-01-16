import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UserEmailTemplate } from './entities/userEmailTemplate.entity';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AuthCheckGuard } from 'src/auth/guards/auth-check.guard';
import { UserEmailTemplateService } from './providers/user-email-template.service';
import { UpdateEmailTemplateInput } from 'src/email/dtos/update-email-template-input.dto';
import { CustomRequest } from 'src/auth/types/types';

@Resolver(() => UserEmailTemplate)
export class UserEmailTemplateManagementResolver {
  constructor(private readonly userEmailTemplateService: UserEmailTemplateService) {}

  @UseGuards(AuthCheckGuard)
  @Mutation(() => UserEmailTemplate)
  async updateEmailTemplateOfOrganizer(
    @Args('input') input: UpdateEmailTemplateInput,
    @Context('req') req: CustomRequest,
  ): Promise<UserEmailTemplate> {
    try {
      const userId = req.user.sub.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      let template = await this.userEmailTemplateService.findOneByIdAndUserId(
        input.emailTemplateId,
        userId,
      );
      if (!template) {
        throw new Error('Email template not found');
      }
      template.subject = input.subject;
      template.emailHtml = input.emailHtml;

      await this.userEmailTemplateService.save(template);

      template = await this.userEmailTemplateService.findOneByIdAndUserId(
        input.emailTemplateId,
        userId,
      );

      return template;
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }

  @UseGuards(AuthCheckGuard)
  @Query(() => [UserEmailTemplate])
  async emailTemplatesByUserId(@Context('req') req: CustomRequest) {
    try {
      const userId = req.user.sub.id;
      if (!userId) {
        throw new Error('Unauthorized');
      }

      return this.userEmailTemplateService.findByField('user', userId);
    } catch (error) {
      throw new InternalServerErrorException('Error: ', error.message);
    }
  }
}
