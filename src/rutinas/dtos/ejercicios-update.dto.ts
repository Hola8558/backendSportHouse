import { IsOptional, IsString } from "class-validator";

export class EjercicioUpdateDto {
    @IsOptional()
    @IsString()
    nombre: string;
    @IsOptional()
    @IsString()
    description: string;
    @IsOptional()
    @IsString()
    url: string;
    @IsOptional()
    @IsString()
    grupoMuscular:string;
}