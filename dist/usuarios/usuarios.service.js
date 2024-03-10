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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const common_2 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const user_schema_1 = require("./schemas/user.schema");
let UsuariosService = class UsuariosService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async createUser(user) {
        const { contrasena } = user;
        const plainToHash = await (0, bcrypt_1.hash)(contrasena, 10);
        user = { ...user, contrasena: plainToHash };
        const createdUser = new this.userModel(user);
        createdUser.save();
    }
    async update(id, user) {
        const { contrasena } = user;
        const plainToHash = await (0, bcrypt_1.hash)(contrasena, 10);
        user = { ...user, contrasena: plainToHash };
        return this.userModel.findByIdAndUpdate(id, user, {
            new: true,
        }).exec();
    }
    async findAll() {
        return this.userModel.find().exec();
    }
    async findOne(id) {
        return this.userModel.findById(id).exec();
    }
    async delete(id) {
        let user = await this.userModel.findById(id).exec();
        user.activo = 0;
        return this.userModel.findByIdAndUpdate(id, user, {
            new: true,
        }).exec();
    }
    async login(user) {
        const { email, contrasena } = user;
        const finUser = await this.userModel.findOne({ email });
        if (!finUser)
            throw new common_2.HttpException('Usuario_no_encontrado', 404);
        const checkPass = await (0, bcrypt_1.compare)(contrasena, finUser.contrasena);
        if (!checkPass)
            throw new common_2.HttpException('Contraseña_incorrecta', 403);
        if (finUser.activo === 0)
            throw new common_2.HttpException('Usuario_no_disponible', 404);
        const token = jwt.sign({ id: finUser.id }, 'secretKey', { expiresIn: '1h' });
        return { userData: finUser, token };
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map