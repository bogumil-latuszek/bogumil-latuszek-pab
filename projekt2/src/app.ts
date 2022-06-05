import express from 'express';
import {Request, Response} from 'express';
import Note, { Tag } from './model';
import register_tag_routes from './tags';
import { process_tags } from './tags';
import notes_router from './notes';

const app = express()

app.use(express.json())



app.get('/', (req: Request, res: Response) => {
    res.send('GET Hello World')
})

app.post('/', (req: Request, res: Response) => {
    console.log(req.body) // e.x. req.body.title 
    res.status(200).send('POST Hello World')
})

register_tag_routes(app);

app.use('/', notes_router)

app.listen(3000)
