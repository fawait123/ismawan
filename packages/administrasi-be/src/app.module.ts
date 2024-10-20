import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ActivityModule } from './api/activity/activity.module';
import { EmployeeModule } from './api/employee/employee.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstant } from 'libs/constant/auth.constant';
import { CompanyModule } from './api/company/company.module';
import { MemberWorkResultModule } from './api/member-work-result/member-work-result.module';

@Module({
  imports: [
    JwtModule.register(
      {
        global: true,
        secret: JwtConstant.secret,
        signOptions: {
          expiresIn: '365d'
        }
      }
    ),
    ConfigModule.forRoot({
      isGlobal: true, // Mengatur agar modul ini tersedia di seluruh aplikasi
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ActivityModule,
    EmployeeModule,
    CompanyModule,
    MemberWorkResultModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
