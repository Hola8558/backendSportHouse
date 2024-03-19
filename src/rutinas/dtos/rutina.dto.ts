import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RutinaDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsString()
    grupoMuscular:string;
    @IsNotEmpty()
    ejercicios: [];
    @IsNumber()
    favorites:number;
}

export class rutinaUpdateDto {
    @IsOptional()
    @IsString()
    name: string;
    @IsString()
    @IsOptional()
    grupoMuscular:string;
    @IsOptional()
    ejercicios: [];
    @IsNumber()
    @IsOptional()
    favorites:number;
}