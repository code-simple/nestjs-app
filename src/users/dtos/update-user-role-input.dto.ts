import { Field, InputType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class UpdateUserRoleDto {
  @Field()
  @IsNumber({}, { message: 'Role ID is required' })
  roleId: number;
}
