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
exports.ClientesController = void 0;
const common_1 = require("@nestjs/common");
const clientes_service_1 = require("./clientes.service");
const create_client_dto_1 = require("./dtos/create-client.dto");
const update_client_dto_1 = require("./dtos/update-client.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const images_helper_1 = require("./images.helper");
let ClientesController = class ClientesController {
    constructor(clientesService) {
        this.clientesService = clientesService;
    }
    async loginSocio(loginUser) {
        return this.clientesService.loginSocio(loginUser.email);
    }
    async crearCliente(createdClient) {
        return this.clientesService.createClient(createdClient);
    }
    async uploadProfilePhoto(res, id, file) {
        return res.status(common_1.HttpStatus.OK).json({
            success: true,
            data: file.path
        });
    }
    async update(id, client) {
        return this.clientesService.updateClient(id, client);
    }
    async setRutina(id, day, rutina) {
        console.log(rutina);
        return this.clientesService.setRutina(id, day, rutina);
    }
    async findAll() {
        return this.clientesService.findAllClients();
    }
    async findOne(id) {
        return this.clientesService.findOneClient(id);
    }
    async delete(id) {
        return this.clientesService.deleteClient(id);
    }
};
exports.ClientesController = ClientesController;
__decorate([
    (0, common_1.Post)('loginSocio'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "loginSocio", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "crearCliente", null);
__decorate([
    (0, common_1.Post)(':id/imgProfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './upload',
            filename: images_helper_1.renameImage
        }),
        fileFilter: images_helper_1.fileFilter
    })),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "uploadProfilePhoto", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/addRutina/:day'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('day')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_client_dto_1.rutinasDTO]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "setRutina", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "delete", null);
exports.ClientesController = ClientesController = __decorate([
    (0, common_1.Controller)('clientes'),
    __metadata("design:paramtypes", [clientes_service_1.ClientesService])
], ClientesController);
//# sourceMappingURL=clientes.controller.js.map