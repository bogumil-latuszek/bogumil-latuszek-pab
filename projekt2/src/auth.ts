import express from 'express'
import {Request, Response, NextFunction} from 'express';
import {User, UserInfo} from './model';
import { IUsersAccess } from './idata_storage'
import { Select_Users_Access } from "./data_storage_selector";
import * as bcrypt from 'bcrypt';
import { JsonWebTokenError, sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import config from './config';

let users: IUsersAccess = Select_Users_Access();

const  router = express.Router()
export default router

function generateToken(user: User) {
    // information to be encoded in the JWT
    const payload: UserInfo = {
      name: user.name,
      is_admin: user.is_admin
    };
    const signInOptions: SignOptions = {
        algorithm: 'HS256',
        expiresIn: '25m'
    };
    // generate JWT
    return sign(payload, config.JWT_SECRET, signInOptions);
}

function validateToken(token: string): UserInfo {
    const verifyOptions: VerifyOptions = {
        algorithms: ['HS256'],
    };
    const decoded = verify(token, config.JWT_SECRET, verifyOptions); //here it throws error "token expired"
    let authenticated: UserInfo = (decoded as UserInfo);
    return authenticated;
}

export function authMiddleware(req: Request, 
                               res: Response, next: NextFunction) {

    let token: string = '';
    let authHdr = req.headers.authorization;

    if (!authHdr) {
        req.body.user = {name: "anonymous", 
            is_admin: false };
        return next();
    }
    // verify request has authorization
    if (!authHdr || !authHdr.toLowerCase().startsWith('bearer')) {
        return res.status(401).json({ message: 'Missing token' });
    }
    else {
        token = authHdr.slice('bearer'.length).trim();
    }
    try {
        const payload = validateToken(token);
        req.body.user = {name: payload.name, 
                         is_admin: payload.is_admin};

    } catch (error: unknown) {
        if (error instanceof JsonWebTokenError) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Expired token' });
                return;
            }
            else {
                res.status(401).json({ message: 'Invalid token' });
                return;
            }
        }
        res.status(500).json({ message: 'Failed to authenticate user' });
        return;
    }
    return next();
};

router.get('/user/login',  async (req: Request, res: Response) => {
    if (! req.body) {
        res.status(400).send({'err': 'no user data provided'})
    }
    else if (! req.body.name || ! req.body.password  ) {
        res.status(400).send({'err': 'no user name or password provided'})
    } 
    let name = req.body.name
    let password = req.body.password
    let user = await users.getUser(name);
    if (user == undefined) {
        res.status(404).send(`given password or user name is incorrect`)
    }
    else if (bcrypt.compareSync(password, user.password)) {
        let token = generateToken(user)
        res.status(200).send({'token': token})
    }
    else {
        res.status(404).send(`incorrect password`)
    }
})

router.post('/user/register', async (req: Request, res: Response) => {
    if (! req.body) {
        res.status(400).send({'err': 'no user data provided'})
    }
    else if (! req.body.name || ! req.body.password  ) {
        res.status(400).send({'err': 'no user name or password provided'})
    } 
    else {
        let user: User = req.body;
        user.is_admin = false;
        if (await users.hasUser(user.name)) {
            res.status(400).send("this user name is already taken")
        }
        else {
            user.password = bcrypt.hashSync(user.password, 10);
            let user_added = await users.addUser(user);
            if(user_added){
                res.status(201).send({'user_name': user.name })
            }
        }
    }
})
