import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateClientDto {
    @IsOptional()
    @IsString()
    nombre?: string;
    @IsOptional()
    @IsString()
    apellidos?: string;
    @IsOptional()
    @IsString()
    ncuenta?: string;
    @IsOptional()
    @IsString()
    ultimoPago?:string;
    @IsOptional()
    @IsString()
    fechaVencimiento?:string;
    @IsOptional()
    @IsString()
    tipoMensualidad?:string;
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
    @IsOptional()
    @IsString()
    gender ?: string;

}

export class rutinasDTO {
    @IsString()
    rutina:string;
}