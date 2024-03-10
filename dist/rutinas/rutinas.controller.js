"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rutinasController = void 0;
const common_1 = require("@nestjs/common");
const rutinas_service_1 = require("./rutinas.service");
const ejercicios_dto_1 = require("./dtos/ejercicios.dto");
const ejercicios_update_dto_1 = require("./dtos/ejercicios-update.dto");
const rutina_dto_1 = require("./dtos/rutina.dto");
let rutinasController = class rutinasController {
    constructor(rutinasService) {
        this.rutinasService = rutinasService;
    }
    async crearEjercicio(ejercicio) {
        return this.rutinasService.createEjercicio(ejercicio);
    }
    async updateEjercicio(id, ejercicio) {
        return this.rutinasService.updateEjercicio(id, ejercicio);
    }
    async findAllEjercicios() {
        return this.rutinasService.findAllEjercicios();
    }
    async findOneEjercicio(id) {
        return this.rutinasService.findOneEjercicio(id);
    }
    async deleteEjercicios(id) {
        return this.rutinasService.deleteEjercicio(id);
    }
    async crearRutina(rutina) {
        console.log(rutina);
        return this.rutinasService.createRutina(rutina);
    }
    async findAllRutinas() {
        return this.rutinasService.findAllRutinas();
    }
    async findOneRutina(id) {
        return this.rutinasService.findOneRutina(id);
    }
};
exports.rutinasController = rutinasController;
__decorate([
    (0, common_1.Post)('/createEjercico'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ejercicios_dto_1.EjercicioDto]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "crearEjercicio", null);
__decorate([
    (0, common_1.Put)('/ejercicio/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ejercicios_update_dto_1.EjercicioUpdateDto]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "updateEjercicio", null);
__decorate([
    (0, common_1.Get)('/ejercicios'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "findAllEjercicios", null);
__decorate([
    (0, common_1.Get)('/ejercicio/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "findOneEjercicio", null);
__decorate([
    (0, common_1.Delete)('/ejercicio/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "deleteEjercicios", null);
__decorate([
    (0, common_1.Post)('/createRutina'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rutina_dto_1.RutinaDto]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "crearRutina", null);
__decorate([
    (0, common_1.Get)('/verRutinas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "findAllRutinas", null);
__decorate([
    (0, common_1.Get)('/rutinasUna/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], rutinasController.prototype, "findOneRutina", null);
exports.rutinasController = rutinasController = __decorate([
    (0, common_1.Controller)('rutinas'),
    __metadata("design:paramtypes", [rutinas_service_1.rutinasService])
], rutinasController);
//# sourceMappingURL=rutinas.controller.js.map