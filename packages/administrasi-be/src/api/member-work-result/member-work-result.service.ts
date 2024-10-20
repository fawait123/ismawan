import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMemberWorkResultDto } from './dto/create-member-work-result.dto';
import { UpdateMemberWorkResultDto } from './dto/update-member-work-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';

@Injectable()
export class MemberWorkResultService {
  constructor(private readonly primaService: PrismaService) { }

  async create(createMemberWorkResultDto: CreateMemberWorkResultDto) {
    if (!createMemberWorkResultDto.companyId) {
      throw new BadRequestException('Silahkan pilih perusahaan terlebih dahulu')
    }


    const check = await this.primaService.memberWorkResult.findFirst({
      where: {
        employeeId: createMemberWorkResultDto.employeeId,
        companyId: createMemberWorkResultDto.companyId,
        date: createMemberWorkResultDto.date
      }
    })

    if (check) {
      throw new BadRequestException('Data sudah ada recordnya, silahkan ubah jika ingin mengubah data')
    }

    const transaction = await this.primaService.$transaction(async (t) => {
      const memberWorkResult = await t.memberWorkResult.create({
        data: {
          companyId: createMemberWorkResultDto.companyId,
          date: createMemberWorkResultDto.date,
          employeeId: createMemberWorkResultDto.employeeId
        }
      })

      const payloadMemberWorkResultActivity: Prisma.MemberWorkResultActivityCreateManyInput[] = createMemberWorkResultDto.activities.map((item) => {
        return {
          ActivityId: item.activityId,
          plot: item.plot,
          price: item.price,
          ql: item.ql,
          subTotal: item.subTotal,
          wide: item.wide,
          memberWorkResultId: memberWorkResult.id
        }
      })

      const memberWorkResultActivity = await t.memberWorkResultActivity.createMany({ data: payloadMemberWorkResultActivity })


      const payloadMemberWorkResultBon: Prisma.MemberWorkResultBonCreateManyInput[] = createMemberWorkResultDto.bon.map((item) => {
        return {
          note: item.note,
          total: item.total,
          memberWorkResultId: memberWorkResult.id
        }
      })


      const memberWorkResultBon = await t.memberWorkResultBon.createMany({ data: payloadMemberWorkResultBon })

      return {
        memberWorkResult,
        memberWorkResultActivity,
        memberWorkResultBon
      }
    })

    return new ResponseHelper({ data: transaction })
  }

  findAll(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput
  ) {
    this.primaService.memberWorkResult.findMany({

    })
    return paginate<Prisma.MemberWorkResultFindManyArgs>(this.primaService.memberWorkResult, new StatementScopeHelper<Prisma.MemberWorkResultFindManyArgs>({ params: query }, ['name']), {
      include: {
        employee: true,
        company: true
      },
      where: {
        companyId: company.id
      }
    })
  }

  async findOne(id: string) {
    return await this.primaService.memberWorkResult.findUnique({
      where: {
        id
      },
      include: {
        activities: {
          include: {
            activity: true
          }
        },
        bon: true
      }
    })
  }

  update(id: number, updateMemberWorkResultDto: UpdateMemberWorkResultDto) {
    return `This action updates a #${id} memberWorkResult`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberWorkResult`;
  }
}
