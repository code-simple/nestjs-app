import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class VerifyEmailInputDto {
  @Field()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @Field()
  @IsString({ message: 'OTP is required' })
  otp: string;
}
