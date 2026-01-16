import { Field, ObjectType } from '@nestjs/graphql';
import { UserRoleSecurityGroup } from 'src/user-management/entities/user-role-security-group.entity';

@ObjectType()
export class UpdateUserRoleResponseDto {
  @Field()
  message: string;

  @Field()
  userRoleSecurityGroup: UserRoleSecurityGroup;
}
