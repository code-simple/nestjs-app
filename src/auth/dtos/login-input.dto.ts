import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class LoginInputDto {
  @Field()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @Field()
  @IsString({ message: 'Password is required' })
  password: string;
}
