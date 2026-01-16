import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEmailTemplate } from './entities/userEmailTemplate.entity';
import { UserEmailTemplateService } from './providers/user-email-template.service';
import { UsersModule } from 'src/users/users.module';
import { UserEmailTemplateManagementResolver } from './user-email-template-management.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailTemplate]), forwardRef(() => UsersModule)],
  providers: [UserEmailTemplateManagementResolver, UserEmailTemplateService, JwtService],
  exports: [UserEmailTemplateService],
})
export class UserEmailTemplateManagementModule {}
