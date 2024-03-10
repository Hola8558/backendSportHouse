"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
async function bootstrap() {
    require("dotenv").config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const cors = require('cors');
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    await app.listen(process.env.PORT, function () {
        console.log({ env: process.env.PORT });
    });
}
bootstrap();
//# sourceMappingURL=main.js.map