import { IsBoolean, IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { GenderTypes } from 'src/scheduling/types/common';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email is required' })
  email: string;

  @IsString({ message: 'Name is required' })
  name: string;

  @IsStrongPassword({}, { message: 'Password is required' })
  password?: string | null;

  @IsString()
  otpSecret: string;

  // phoneNumber is optional
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsBoolean()
  isEmailVerified?: boolean;

  @IsString({ message: 'Profile image URL must be a string' })
  profileImage?: string;

  @IsString({ message: 'Gender must be a string' })
  gender?: GenderTypes;
}
