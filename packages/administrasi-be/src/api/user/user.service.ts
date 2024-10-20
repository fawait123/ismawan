import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { hash } from 'libs/helpers/encryption.helper';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }


  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password)
      }
    })
  }

  async findAll(
    query: PaginationDto
  ) {
    return paginate(this.prismaService.user, new StatementScopeHelper<Prisma.UserFindManyArgs>({ params: query }, ['username', 'email']))
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      }
    })

    if (!user) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    return user
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      }
    })

    if (!user) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const payload: Prisma.UserUpdateInput = Object.assign({}, user)

    if (updateUserDto.password) {
      payload.password = await hash(updateUserDto.password as string)
    }

    const userUpdate = await this.prismaService.user.update({
      where: {
        id
      },
      data: payload
    })
    return userUpdate;
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      }
    })

    if (!user) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const deleteUser = await this.prismaService.user.delete({
      where: {
        id
      }
    })
    return deleteUser;
  }
}
