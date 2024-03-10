import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({required:true})
    email: string;
    @Prop({required:true})
    nombre: string;
    @Prop({required:true})
    apellidos: string;
    @Prop({required:true})
    contrasena:string;
    @Prop({default: 1})
    activo: number;
    @Prop({default:0})
    admin: number;

}

export const UserSchema = SchemaFactory.createForClass(User);