import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

@InputType()
export class RegisterInputDto {
  @Field()
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @Field()
  @IsString({ message: 'Name is required' })
  name: string;

  @Field()
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password is required and must be at least 8 characters long, with at least 1 number and 1 uppercase letter.',
    },
  )
  password: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  clubId?: string;
}
