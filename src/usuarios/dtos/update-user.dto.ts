import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    email: string;
    @IsOptional()
    @IsString()
    nombre?: string;
    @IsOptional()
    @IsString()
    apellidos?: string;
    @IsOptional()
    @IsString()
    contrasena?:string;
    @IsOptional()
    @IsNumber()
    activo?: number;
    @IsOptional()
    @IsNumber()
    admin?: number;

}