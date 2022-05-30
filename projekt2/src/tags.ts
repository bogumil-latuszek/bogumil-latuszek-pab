import * as core from 'express-serve-static-core';
import {Request, Response} from 'express';
import {Tag} from './model';
import { ITagsAccess, InMemoryTags } from './data_storage'

let tags: ITagsAccess = new InMemoryTags();

export default function register_tag_routes(app: core.Express) {
    app.get('/tags/', (req: Request, res: Response) => {
        if (tags.getTagsCount() > 0) {
            let tag_table: Tag[] = tags.getAllTags();
            res.status(200).send(tag_table);
        }
        else {
            res.status(404).send(`items not found`)
        }
    })
    
    app.get('/tag/:id', (req: Request, res: Response) => {
        let id = +req.params.id
        if (tags.hasTag(id)) {
            let tag = tags.getTag(id);
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
            let tag_id = tags.findTagId(tag.name);
            if (tag_id != undefined) {
                res.status(200).send({'id' : tag_id})
            }
            else {
                tag = tags.addTag(tag);
                res.status(201).send({'id': tag.id })
            }
        }
    })

    app.put('/tag/:id', (req: Request, res: Response) => {
        let tag: Tag = req.body;
        let id = +req.params.id;
        if (!tags.hasTag(id)) {
            res.status(404).send({'err': 'tag with this id not found'})
        }
        let tag_id = tags.findTagId(tag.name);
        if (tag_id != undefined) {
            res.status(400).send({'error' : `'${tag.name}' already used by id:'${tag_id}'`})
        }
        else {
            tag.id = id;
            tags.updateTag(tag);
            res.status(204).send({'id': id})
        }
    })

    app.delete('/tag/:id', (req: Request, res: Response) => {
        let id = +req.params.id;
        if (!tags.hasTag(id)) {
            res.status(404).send({'err': 'tag with this id not found'})
        }
        tags.deleteTag(id);
        res.status(204).send();
    })
}

export function process_tags(new_or_existing: Tag[]): Tag[] {
    let tags_set: Tag[] = [];
    new_or_existing.forEach((tag: Tag) => {
        let full_tag: Tag = process_single_tag(tag.name);
        tags_set.push(full_tag);
    })
    return tags_set;
}

function process_single_tag(tag_name: string): Tag {
    let tag: Tag = {name: tag_name};
    let tag_id = tags.findTagId(tag.name);
    if (tag_id != undefined) {
        tag.id = tag_id;
    }
    else {
        tags.addTag(tag);
    }
    return tag;
}
