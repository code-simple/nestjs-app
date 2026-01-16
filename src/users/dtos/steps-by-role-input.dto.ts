import { Field, InputType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class StepsByRoleDto {
  @Field()
  @IsNumber()
  roleId: number;
}
