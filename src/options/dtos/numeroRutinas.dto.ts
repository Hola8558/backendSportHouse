import { IsNotEmpty, IsString } from "class-validator";

export class NumeroRutina {
    @IsNotEmpty()
    @IsString()
    numeroRutinas: string;

}