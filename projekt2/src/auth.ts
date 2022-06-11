import express from 'express'
import {Request, Response} from 'express';
import {User} from './model';
import { IUsersAccess, InMemoryUsers } from './data_storage'
import * as bcrypt from 'bcrypt';
import { sign, SignOptions } from 'jsonwebtoken';
import config from './config';

let users: IUsersAccess = new InMemoryUsers();

const  router = express.Router()
export default router

export function generateToken(user: User) {
    // information to be encoded in the JWT
    const payload = {
      username: user.name,
      is_admin: false
    };
    const signInOptions: SignOptions = {
        algorithm: 'HS256',
        expiresIn: '5m'
    };
    // generate JWT
    return sign(payload, config.JWT_SECRET, signInOptions);
}

router.get('/user/login', (req: Request, res: Response) => {
    if (! req.body) {
        res.status(400).send({'err': 'no user data provided'})
    }
    else if (! req.body.name || ! req.body.password  ) {
        res.status(400).send({'err': 'no user name or password provided'})
    } 
    let name = req.body.name
    let password = req.body.password
    let user = users.getUser(name);
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

router.post('/user/register', (req: Request, res: Response) => {
    if (! req.body) {
        res.status(400).send({'err': 'no user data provided'})
    }
    else if (! req.body.name || ! req.body.password  ) {
        res.status(400).send({'err': 'no user name or password provided'})
    } 
    else {
        let user: User = req.body;
        if (users.hasUser(user.name)) {
            res.status(400).send("this user name is already taken")
        }
        else {
            user.password = bcrypt.hashSync(user.password, 10);
            user = users.addUser(user);
            res.status(201).send({'user_name': user.name })
        }
    }
})
