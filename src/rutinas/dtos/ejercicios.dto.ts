import { IsNotEmpty, IsString } from "class-validator";

export class EjercicioDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
    @IsNotEmpty()
    @IsString()
    description: string;
    @IsNotEmpty()
    @IsString()
    url: string;
    @IsNotEmpty()
    @IsString()
    grupoMuscular:string;
}