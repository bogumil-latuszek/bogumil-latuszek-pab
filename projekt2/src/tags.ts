import * as core from 'express-serve-static-core';
import {Request, Response} from 'express'
import {Tag} from './model'


let tags: Map<number, Tag> = new Map<number, Tag>(); 

let max_id: number= 0;
function generate_id() {
  max_id++;
  return max_id;
}

export default function register_tag_routes(app: core.Express) {
    app.get('/tags/', function (req: Request, res: Response) {
        if (tags.size > 0) {
        let tag_table: Tag[] = [];
        tags.forEach((tag: Tag) => tag_table.push(tag));
        res.status(200).send(tag_table);
        }
        else {
        res.status(404).send(`items not found`)
        }
    })
    
    app.get('/tag/:id', function (req: Request, res: Response) {
    let id = +req.params.id
    if (tags.has(id)) {
        let tag = tags.get(id);
        res.status(200).send(tag)
    }
    else {
        res.status(404).send(`tag with id=${id} doesn't exist`)
    }
    })

    app.post('/tag/', (req: Request, res: Response) =>
    {
    if (! req.body) {
        res.status(400).send({'err': 'no data provided to create a tag'})
    }
    else if (! req.body.name) {
        res.status(400).send({'err': 'tag needs name'})
    } 
    else {
        let tag: Tag = req.body;
        let id: number = generate_id();
        tag.id = id;
        tags.set(id, tag);
        res.status(201).send({'id': id })
    }
    })

    app.put('/tag/:id', (req: Request, res: Response) =>
    {
    let tag: Tag = req.body;
    let id = +req.body.id;
    if(!tags.has(id)){
        res.status(404).send({'err': 'tag with this id not found'})
    }
    tags.set(id, tag);
    res.status(204).send({'id': id})
    })

    app.delete('/tag/:id', (req: Request, res: Response) =>
    {
    let id = +req.params.id;
    if(!tags.has(id)){
        res.status(404).send({'err': 'tag with this id not found'})
    }
    tags.delete(id);
    res.status(204).send();
    })
}
