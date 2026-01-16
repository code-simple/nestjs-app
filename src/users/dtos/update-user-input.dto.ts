import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field()
  @IsNumber()
  id: number;

  @Field()
  @IsString({ message: 'Name is required' })
  name: string;

  @Field()
  @IsEmail()
  @IsString({ message: 'Email is required' })
  email: string;

  @Field()
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
