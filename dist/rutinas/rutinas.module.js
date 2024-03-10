"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RutinasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const rutinas_service_1 = require("./rutinas.service");
const rutinas_controller_1 = require("./rutinas.controller");
const ejercicios_schema_1 = require("./schemas/ejercicios.schema");
const rutinas_schema_1 = require("./schemas/rutinas.schema");
let RutinasModule = class RutinasModule {
};
exports.RutinasModule = RutinasModule;
exports.RutinasModule = RutinasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{
                    name: ejercicios_schema_1.Ejercicio.name,
                    schema: ejercicios_schema_1.EjercicioSchema
                }, {
                    name: rutinas_schema_1.Rutina.name,
                    schema: rutinas_schema_1.RutinaSchema
                }
            ])
        ],
        providers: [rutinas_service_1.rutinasService],
        controllers: [rutinas_controller_1.rutinasController]
    })
], RutinasModule);
//# sourceMappingURL=rutinas.module.js.map