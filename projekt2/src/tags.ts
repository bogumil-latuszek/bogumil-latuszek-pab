import * as core from 'express-serve-static-core';
import {Request, Response} from 'express';
import {Tag} from './model';
import Unique_id_generator from './id';

let tags: Map<number, Tag> = new Map<number, Tag>(); 
let gen: Unique_id_generator = new Unique_id_generator();

export default function register_tag_routes(app: core.Express) {
    app.get('/tags/', (req: Request, res: Response) => {
        if (tags.size > 0) {
            let tag_table: Tag[] = [];
            tags.forEach((tag: Tag) => tag_table.push(tag));
            res.status(200).send(tag_table);
        }
        else {
            res.status(404).send(`items not found`)
        }
    })
    
    app.get('/tag/:id', (req: Request, res: Response) => {
        let id = +req.params.id
        if (tags.has(id)) {
            let tag = tags.get(id);
            res.status(200).send(tag)
        }
        else {
            res.status(404).send(`tag with id=${id} doesn't exist`)
        }
    })

    app.post('/tag/', (req: Request, res: Response) => {
        if (! req.body) {
            res.status(400).send({'err': 'no data provided to create a tag'})
        }
        else if (! req.body.name) {
            res.status(400).send({'err': 'tag needs name'})
        } 
        else {
            let tag: Tag = req.body;
            tag.name = tag.name.toLowerCase();
            let tag_id = find_tag_id(tag.name);
            if (tag_id != undefined) {
                res.status(200).send({'id' : tag_id})
            }
            else {
                let id: number = gen.generate_unique_id(tags);
                tag.id = id;
                tags.set(id, tag);
                res.status(201).send({'id': id })
            }
        }
    })

    app.put('/tag/:id', (req: Request, res: Response) => {
        let tag: Tag = req.body;
        let id = +req.params.id;
        if (!tags.has(id)) {
            res.status(404).send({'err': 'tag with this id not found'})
        }
        let tag_id = find_tag_id(tag.name);
        if (tag_id != undefined) {
            res.status(400).send({'error' : `'${tag.name}' already used by id:'${tag_id}'`})
        }
        else {
            tag.id = id;
            tags.set(id, tag);
            res.status(204).send({'id': id})
        }
    })

    app.delete('/tag/:id', (req: Request, res: Response) => {
        let id = +req.params.id;
        if (!tags.has(id)) {
            res.status(404).send({'err': 'tag with this id not found'})
        }
        tags.delete(id);
        res.status(204).send();
    })
}

export function process_tags(new_or_existing: Tag[]): Tag[] {
    let new_tags: Tag[] = [];
    new_or_existing.forEach((tag: Tag) => {
        let new_tag: Tag;
        new_tag = process_single_tag(tag.name);
        new_tags.push(new_tag);
    })
    return new_tags;
}

function process_single_tag(tag_name: string): Tag {
    let tag: Tag = {name: tag_name.toLowerCase()};
    let tag_id = find_tag_id(tag.name);
    if (tag_id != undefined) {
        tag.id = tag_id;
    }
    else {
        let id: number = gen.generate_unique_id(tags);
        tag.id = id;
        tags.set(id, tag);
    }
    return tag;
}

function find_tag_id(name: string) {
    let tag_id : number|undefined = undefined;
    tags.forEach((tag: Tag) => { 
        if (tag.name == name) {
            tag_id = tag.id;
        }
    })
    return tag_id;
}
