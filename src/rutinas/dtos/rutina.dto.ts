import { IsNotEmpty, IsString } from "class-validator";

export class RutinaDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsString()
    grupoMuscular:string;
    @IsNotEmpty()
    ejercicios: [];
}