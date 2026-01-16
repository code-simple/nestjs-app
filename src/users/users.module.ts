import { forwardRef, Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './providers/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';
import { OtpModule } from 'src/otp/otp.module';
import { UserEmailTemplateManagementModule } from 'src/user-email-template-management/user-email-template-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    UserEmailTemplateManagementModule,
    OtpModule,
  ],
  providers: [UsersResolver, UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
