import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class CreateClientDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
    @IsNotEmpty()
    @IsString()
    apellidos: string;
    @IsNotEmpty()
    @IsString()
    ncuenta: string;
    @IsNotEmpty()
    @IsString()
    ultimoPago:string;
    @IsNotEmpty()
    @IsString()
    fechaVencimiento:string;
    @IsNotEmpty()
    @IsString()
    tipoMensualidad:string;
    @IsOptional()
    diasAsistencia?: any;
    @IsOptional()
    rutinas?: any;
    @IsOptional()
    @IsString()
    numeroCelular?: string;
    @IsOptional()
    @IsString()
    numeroCelularEmergencia?: string;
}