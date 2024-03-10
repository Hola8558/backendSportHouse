import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    email: string;
    @IsNotEmpty()
    @IsString()
    nombre: string;
    @IsNotEmpty()
    @IsString()
    apellidos: string;
    @IsNotEmpty()
    @IsString()
    contrasena:string;
    @IsOptional()
    @IsNumber()
    activo?: number;
    @IsOptional()
    @IsNumber()
    admin?: number;

}