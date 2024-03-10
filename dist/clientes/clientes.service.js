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
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const clientes_schema_1 = require("./schemas/clientes.schema");
const mongoose_2 = require("mongoose");
const jwt = require("jsonwebtoken");
let ClientesService = class ClientesService {
    constructor(clientModel) {
        this.clientModel = clientModel;
    }
    async createClient(client) {
        const createdClient = new this.clientModel(client);
        createdClient.save();
    }
    async uploadProfileImage(id, filename) {
        try {
            const updatedClient = await this.clientModel.findOneAndUpdate({ _id: id }, { profileImg: filename }, { new: true });
            return updatedClient;
        }
        catch (error) {
            console.error('Error al actualizar la imagen del perfil:', error.message);
            throw new common_1.HttpException("Error al actualizar imagen de perfil", 401);
            return null;
        }
    }
    async updateClient(id, client) {
        return this.clientModel.findByIdAndUpdate(id, client, {
            new: true,
        }).exec();
    }
    async findAllClients() {
        return this.clientModel.find().exec();
    }
    async findOneClient(id) {
        console.log(id);
        return this.clientModel.findById(id).exec();
    }
    async deleteClient(id) {
        return this.clientModel.findByIdAndDelete(id).exec();
    }
    async setRutina(id, d, rutina) {
        let e = await this.clientModel.findById(id).exec();
        let rutinas = { l: '', M: '', Mi: '', J: '', V: '', S: '' };
        if (e.rutinas) {
            rutinas = { ...rutinas, ...e.rutinas };
        }
        if (d === 'Lunes') {
            rutinas.l = rutina.rutina;
        }
        if (d === 'Martes') {
            rutinas.M = rutina.rutina;
        }
        if (d === 'Miercoles') {
            rutinas.Mi = rutina.rutina;
        }
        if (d === 'Jueves') {
            rutinas.J = rutina.rutina;
        }
        if (d === 'Viernes') {
            rutinas.V = rutina.rutina;
        }
        if (d === 'Sabado') {
            rutinas.S = rutina.rutina;
        }
        if (e) {
            e.set({ rutinas: rutinas });
            return await e.save();
        }
    }
    async findRutina(id, d) {
    }
    async loginSocio(ncuenta) {
        const finUser = await this.clientModel.findOne({ ncuenta });
        if (!finUser)
            throw new common_1.HttpException('Socio_no_encontrado', 404);
        if (this.fechaYaPaso(finUser.fechaVencimiento) === true)
            throw new common_1.HttpException('Usuario_vencido', 404);
        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        return { userData: finUser, token };
    }
    fechaYaPaso(fechaString) {
        const fechaActual = new Date();
        const fechaDada = new Date(fechaString);
        return fechaDada < fechaActual;
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(clientes_schema_1.Client.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map