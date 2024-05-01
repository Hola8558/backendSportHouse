import { registerAs } from "@nestjs/config";
import { env } from "process";

export default registerAs('config', () => {
    return{
        PORT: env.PORT,
        USER: env.USER,
        PASS: env.PASS,
        CONECTION: env.CONECTION
    }
})