import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { env } from "./config/env";
import { StudentsModule } from "./students/students.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: env.databasePath,
      autoLoadEntities: true,
      synchronize: true,
    }),
    StudentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
