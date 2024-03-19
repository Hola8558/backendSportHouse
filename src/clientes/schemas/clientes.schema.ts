import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Client {
    @Prop({required:true})
    nombre: string;
    @Prop({required:true})
    apellidos: string;
    @Prop({required:true})
    ncuenta: string;
    @Prop({required:true})
    ultimoPago:string;
    @Prop({required:true})
    fechaVencimiento:string;
    @Prop({required:true})
    tipoMensualidad:string;
    @Prop({type: JSON})
    diasAsistencia: JSON;
    @Prop({type: JSON})
    rutinas: JSON;
    @Prop({type: String})
    numeroCelular: string;
    @Prop({type: String})
    numeroCelularEmergencia: string;
    @Prop({type: String})
    profileImg: string;
    @Prop({type: String})
    gender ?: string;

}

export const ClientSchema = SchemaFactory.createForClass(Client);