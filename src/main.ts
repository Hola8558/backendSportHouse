import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//import routes from './wsp/infrastructure/router/index.js'
import * as express from 'express';

async function bootstrap() {
  require("dotenv").config()
  const app = await NestFactory.create(AppModule);
  const cors = require('cors')
  app.use(cors())
  app.use(express.json({ limit: '50mb' })); // Configura el límite del cuerpo JSON
  //app.use(express.static('tmp'))
  //app.use("/lead",routes)
  app.use(express.urlencoded({ limit: '50mb', extended: true })); // Configura el límite del cuerpo de datos codificados
  await app.listen(process.env.PORT,() => {
    console.log(`App is running on port ${process.env.PORT}`);
  });
}
bootstrap();
