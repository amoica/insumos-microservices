import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';

async function bootstrap() {


  const logger = new Logger('main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
  {
    transport: Transport.TCP,
    options:{
      port: envs.port_insumos
    }
  });

  app.useGlobalPipes( 
    new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true, 
    exceptionFactory: (errors: ValidationError[]) => {
      const detailedErrors = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        children: error.children,
      }));
      console.error('❌ Errores de validación:', JSON.stringify(detailedErrors, null, 2));
      return new BadRequestException('Error de validación');
    }
    }) 
   );

   logger.log(`Insumos Microservice running on port ${envs.port_insumos}`);

   await app.listen();

  //await app.listen(envs.port);

  //app.startAllMicroservices(); podria tener un microservicio y comunicación por apirest

  //Logger.log(`App runnig on port ${envs.port}`);
  

}
bootstrap();
