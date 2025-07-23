import { HttpException, Injectable, NestMiddleware } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const authHeader = req.headers.authorization;
        const apiKey = req.headers['x-api-key'];
        const path = req.originalUrl;        
        
        if(apiKey === 'serverAKey' && path.includes('/usuarios') && path.includes('/generateFreeToken')) { //TODO Resolver acceso raro
            return next();
        };

        if (path.includes('/validGym') || path.includes('/login') || path.includes('/loginSocio') || path.includes('/verifyToken')) return next();

        if (!authHeader) {
            throw new HttpException('Token no proporcionado', 401);
        }

        const token = authHeader.split(' ')[1];        

        try {
            const decoded = jwt.verify(token, 'secretKey');
            req.user = decoded;            
            return next();
        } catch (err) {
            throw new HttpException('Token inválido o expirado', 401);
        }
    }
}