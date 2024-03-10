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
exports.rutinasService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ejercicios_schema_1 = require("./schemas/ejercicios.schema");
const rutinas_schema_1 = require("./schemas/rutinas.schema");
let rutinasService = class rutinasService {
    constructor(ejercicioModel, rutinaModel) {
        this.ejercicioModel = ejercicioModel;
        this.rutinaModel = rutinaModel;
    }
    async createEjercicio(ejercicio) {
        const createdEjercicio = new this.ejercicioModel(ejercicio);
        createdEjercicio.save();
    }
    async updateEjercicio(id, ejercicio) {
        return this.ejercicioModel.findByIdAndUpdate(id, ejercicio, {
            new: true,
        }).exec();
    }
    async findAllEjercicios() {
        return this.ejercicioModel.find().exec();
    }
    async findOneEjercicio(id) {
        return this.ejercicioModel.findById(id).exec();
    }
    async deleteEjercicio(id) {
        return this.ejercicioModel.findByIdAndDelete(id).exec();
    }
    async createRutina(rutina) {
        const createdRutina = new this.rutinaModel(rutina);
        createdRutina.save();
    }
    async findAllRutinas() {
        return this.rutinaModel.find().exec();
    }
    async findOneRutina(id) {
        return this.rutinaModel.findById(id).exec();
    }
};
exports.rutinasService = rutinasService;
exports.rutinasService = rutinasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ejercicios_schema_1.Ejercicio.name)),
    __param(1, (0, mongoose_1.InjectModel)(rutinas_schema_1.Rutina.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, mongoose_2.Model])
], rutinasService);
//# sourceMappingURL=rutinas.service.js.map