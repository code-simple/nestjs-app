import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import messages from 'src/utils/messages';
import { OtpService } from 'src/otp/providers/otp.service';
import { generateRandomSuffix } from 'src/utils/helper';
import { UserEmailTemplateService } from 'src/user-email-template-management/providers/user-email-template.service';
import { PredefinedSystemRoles } from 'src/common/types/global';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly otpService: OtpService,
    private readonly userEmailTemplateService: UserEmailTemplateService,
  ) {}

  async findAll(userRole?: number): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.steps', 'steps')
      .leftJoinAndSelect('user.userRoleSecurityGroup', 'userRoleSecurityGroup')
      .leftJoinAndSelect('userRoleSecurityGroup.role', 'role');

    if (userRole) {
      query.where('role.id = :userRole', { userRole });
    }

    const users = await query.getMany();

    return users;
  }

  async findAllUsersWithTournamentPlayerExistenceCheck(
    tournamentId: number,
  ): Promise<(User & { isAddedToTournament: boolean })[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.steps', 'steps')
      .leftJoinAndSelect('user.userRoleSecurityGroup', 'userRoleSecurityGroup')
      .leftJoinAndSelect('userRoleSecurityGroup.role', 'role')
      .leftJoin(
        'tournament_player',
        'tp',
        'tp.playerId = user.id AND tp.tournamentId = :tournamentId',
        { tournamentId },
      )
      .addSelect('CASE WHEN tp.id IS NOT NULL THEN true ELSE false END', 'isAddedToTournament')
      .where('role.id = :userRole', { userRole: PredefinedSystemRoles.player })
      .getRawAndEntities();

    // Map entity.id to isAddedToTournament from raw
    const userIdToAddedMap: Record<number, boolean> = {};
    for (const row of users.raw) {
      userIdToAddedMap[row['user_id']] ||= row['isAddedToTournament'];
    }

    // Merge map back into each entity
    const result = users.entities.map((user) => ({
      ...user,
      isAddedToTournament: userIdToAddedMap[user.id] ?? false,
    }));

    return result;
  }

  async findAllWithRelations(options: {
    userRole: number;
    page: number;
    pageSize: number;
    filterBy?: string;
    filter?: string;
    sort?: { field: string; direction: 'ASC' | 'DESC' };
    relations?: string[];
  }): Promise<[User[], number]> {
    const { page, pageSize, filterBy, filter, sort, userRole } = options;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.steps', 'steps')
      .leftJoinAndSelect('user.userRoleSecurityGroup', 'userRoleSecurityGroup')
      .leftJoinAndSelect('userRoleSecurityGroup.role', 'role')
      .where('userRoleSecurityGroup.role.id = :userRole', { userRole })
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (filterBy && filter) {
      query.andWhere(`user.${filterBy} LIKE :filter`, {
        filter: `%${filter}%`,
      });
    }

    if (sort) {
      query.orderBy(`user.${sort.field}`, sort.direction);
    }

    const [users, totalRecords] = await query.getManyAndCount();

    return [users, totalRecords];
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findMultipleUsersById(ids: number[]): Promise<User[]> {
    return this.userRepository.findBy({ id: In(ids) });
  }

  findOneWithRelations(userId: number, relations: string[]): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations,
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  findOneByEmailWithRelations(email: string, relations: string[]): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations,
    });
  }

  findUsersWithRelationsByUserIds(userIds: number[], relations: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(userIds) },
      relations,
    });
  }

  async create(createUserInput: CreateUserDto): Promise<User> {
    let hashedPassword;
    if (createUserInput.password) {
      hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    } else {
      hashedPassword = null;
    }

    const newUser = this.userRepository.create({
      ...createUserInput,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async update(id: number, updateUserInput: Partial<User>): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...updateUserInput,
    });
    if (!user) {
      throw new Error(messages.USER_NOT_FOUND);
    }
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findUserByField(field: keyof User, value: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { [field]: value },
    });
  }

  async createGhostUser(email: string, phoneNumber?: string, name?: string): Promise<User> {
    const checkUser = await this.findOneByEmail(email);
    if (checkUser) {
      throw new Error(messages.USER_ALREADY_EXISTS);
    }

    const randomSuffix = generateRandomSuffix(3);

    let userName = name || '';
    let user: User | null = null;

    do {
      userName = name && !user ? name : `Guest-${randomSuffix}`;
      user = await this.findUserByField('name', userName);
    } while (user);

    const otpSecret = this.otpService.generateSecret();
    const newUser = this.userRepository.create({
      email,
      name: userName,
      phoneNumber,
      otpSecret,
      isGhostUser: true,
    });

    return this.userRepository.save(newUser);
  }
}
