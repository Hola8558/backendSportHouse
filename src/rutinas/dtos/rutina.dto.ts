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
    @IsNumber()
    @IsOptional()
    peso?:number;

    @IsNumber()
    @IsOptional()
    conc?:number;
    @IsNumber()
    @IsOptional()
    iso?:number;
    @IsNumber()
    @IsOptional()
    exc?:number;
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
    @IsNumber()
    @IsOptional()
    peso?:number;

    @IsNumber()
    @IsOptional()
    conc?:number;
    @IsNumber()
    @IsOptional()
    iso?:number;
    @IsNumber()
    @IsOptional()
    exc?:number;
}