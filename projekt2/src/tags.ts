import express from 'express'
import * as core from 'express-serve-static-core';
import {Request, Response} from 'express';
import {Tag, UserInfo} from './model';
import { ITagsAccess } from './idata_storage'
import { InMemoryTags } from './data_storage'
import { authMiddleware } from './auth';

let tags: ITagsAccess = new InMemoryTags();

const  router = express.Router()
export default router

router.get('/tags/', (req: Request, res: Response) => {
    if (tags.getTagsCount() > 0) {
        let tag_table: Tag[] = tags.getAllTags();
        res.status(200).send(tag_table);
    }
    else {
        res.status(404).send(`items not found`)
    }
})

router.get('/tag/:id', (req: Request, res: Response) => {
    let id = +req.params.id
    if (tags.hasTag(id)) {
        let tag = tags.getTag(id);
        res.status(200).send(tag)
    }
    else {
        res.status(404).send(`tag with id=${id} doesn't exist`)
    }
})

router.post('/tag/', authMiddleware, (req: Request, res: Response) => {
    //f (! req.body) {
    //    res.status(400).send({'err': 'no data provided to create a tag'})
    //} 
    //this is never reached
    if (! req.body.name) {
        res.status(400).send({'err': 'tag needs name'})
    } 
    else {
        let logged_user: UserInfo = req.body.user;
        delete req.body.user;
        let tag: Tag = req.body;
        let tag_id = tags.findTagId(tag.name);
        if(logged_user.name == "anonymous" /* || undefined */){  
            res.status(400).send({'err': 'you need to be logged in to post notes'})
          }
        if (tag_id != undefined) {
            res.status(200).send({'err': 'tag with this name already exists'});
        }
        else { 
            //only accepts unique tags from authenticated users
            tag.owner_name = logged_user.name;
            tag = tags.addTag(tag);
            res.status(201).send({'id': tag.id })
        }
    }
})

router.put('/tag/:id', authMiddleware, (req: Request, res: Response) => {
    let logged_user: UserInfo = req.body.user;
    delete req.body.user;
    let new_tag: Tag = req.body;
    let id = +req.params.id;
    if (!tags.hasTag(id)) {
        res.status(404).send({'err': 'tag with this id not found'})
    }
    let tag = tags.getTag(id);
    if (tag != undefined){
        let tag_id = tags.findTagId(new_tag.name);
    if (tag_id != undefined) {
        res.status(400).send({'error' : `'${tag.name}' already used by id:'${tag_id}'`})
    }
    else {
        if(tag.owner_name == logged_user.name ||
            logged_user.is_admin == true){
            new_tag.id = id;
            new_tag.owner_name = tag.owner_name;
            tags.updateTag(new_tag);
            res.status(204).send({'id': id})
        }
        else{
            res.status(404).send({'err': 'you dont have permission to edit this note'})
        }
        
    }
    }
    else{
        res.status(404).send({'err': 'tag with this id not found'})
    }
    
})

router.delete('/tag/:id', authMiddleware, (req: Request, res: Response) => {
    let id = +req.params.id;
    let logged_user: UserInfo = req.body.user;
    if (!tags.hasTag(id)) {
        res.status(404).send({'err': 'tag with this id not found'})
    }
    else{
        let tag_to_delete = tags.getTag(id);
        if(tag_to_delete && 
            tag_to_delete.owner_name == logged_user.name ||
            logged_user.is_admin == true) {
                tags.deleteTag(id);
                res.status(204).send();
        }
        else {
            res.status(404).send({'err': 'you dont have permission to edit this note'});
        }
    }
})

export function process_tags(new_or_existing: Tag[]): Tag[] {
    let tags_set: Tag[] = [];
    new_or_existing.forEach((tag: Tag) => {
        let full_tag: Tag = process_single_tag(tag.name);
        tags_set.push(full_tag);
    })
    tags.save()  // fix for corrupted JSON from races in fs.promises.writeFile()
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
