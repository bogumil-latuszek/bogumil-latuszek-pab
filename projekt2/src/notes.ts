import express from 'express';
import {Request, Response} from 'express';
import { INotesAccess} from './idata_storage'
import {Select_Notes_Access} from './data_storage_selector'
import {Note, UserInfo, Tag} from './model';
import { process_tags, addNotesTags, findNotesTags} from './tags';
import { authMiddleware } from './auth';
import { execPath } from 'process';

const  router = express.Router()
export default router

let notes: INotesAccess = Select_Notes_Access();

router.get('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let logged_user: UserInfo = req.body.user;
  let id = req.params.id
  let exists: boolean = await notes.hasNote(id)
  if (!exists) {
      res.status(404).send(`note with id=${id} doesn't exist`)
  }
  else {
    let note = await notes.getNote(id); //why tf did this find note with id 62ed0257dadcd4c8ad815bfb when asked for id 765439?
    if(note != undefined){
      if(
        note.private == false || //publiczna notatka
        logged_user.is_admin == true || //admin
        note.owner_name == logged_user.name){ //właściciel notatki
           res.status(200).send(note)
      }
      else{
        res.status(403).send(`you dont have permission to access this note`)
      }
    }
  }
})

router.get('/notes/', authMiddleware, async (req: Request, res: Response) => {
  // TODO: return all public notes + private of logged user
  // TODO: return all priv+public if logged as admin
  let logged_user: UserInfo = req.body.user;
  /*if (logged_user is not owner of this note) {
    res.status(404).send(`not autorized`)
  }*/
  if ( await notes.getNotesCount() > 0) {
      let note_table: Note[] = await notes.getAllNotes();
      res.status(200).send(note_table);
  }
  else {
      res.status(404).send(`items not found`)
  }
})

router.get('/notes/user/:userName',  async (req: Request, res: Response) => {
  let user_name: string = req.params.userName;
  if (await notes.getNotesCount() > 0) {
      let public_notes_table: Note[] = await notes.getAllPublicNotes(user_name);
      res.status(200).send(public_notes_table);
  }
  else {
      res.status(404).send(`items not found`)
  }
})

router.post('/note/',authMiddleware, async(req: Request, res: Response) => {
  if (! req.body) {
      res.status(400).send({'err': 'no data provided to create a note'})
  }
  else if (! req.body.title) {
      res.status(400).send({'err': 'note needs title'})
  } 
  else if (! req.body.content) {
      res.status(400).send({'err': 'note needs content'})
  }
  else {
      let logged_user: UserInfo = req.body.user;
      delete req.body.user;

      let tags: Tag[]|undefined = undefined;
      if(req.body.tags){
        tags = req.body.tags;
        delete req.body.tags;
      }
      
      let note: Note = req.body; //why does it cast to note if it doesnt have private field?

      if(logged_user.name == "anonymous"){  
        res.status(400).send({'err': 'you need to be logged in to post notes'})
      }

      if(note.private == undefined){
        note.private = true;
      }
      note.owner_name = logged_user.name;
      note = await notes.addNote(note);

      if (tags != undefined && tags.length > 0) { //if there were any tags attached to note...
        let processed_tags: Tag[] = await process_tags(tags) // than add/find them in tags document...
        let tags_ids! : string[];
        if(processed_tags.length > 0) 
        {
          processed_tags.forEach(element => {
          if(element._id) //every element should have id, but without this check program doesnt compile, sadly
          {
            tags_ids.push(element._id);
          }
          });
        }

        if(note._id != undefined && tags_ids.length > 0)
        {
          await addNotesTags(note._id, tags_ids); //, and map each one's id together with note id in notes_tags document.
        }
        
      }
      res.status(201).send({'id': note._id })
  }
})

router.put('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let logged_user: UserInfo = req.body.user;
  delete req.body.user;

  let tags: Tag[]|undefined = undefined;
  if(req.body.Tags){
    tags = req.body.Tags;
    delete req.body.Tags;
  }

  let note: Note = req.body;
  let id = req.params.id;
  if (!notes.hasNote(id)) {
      res.status(404).send({'err': 'note with this id not found'})
  }
  let noteToReplace = await  notes.getNote(id);
  if(noteToReplace  && logged_user.name == noteToReplace.owner_name){
    if (tags) {
      tags = await process_tags(tags)
    }
    note._id = id;
    note.owner_name = logged_user.name
    notes.updateNote(note);

    //change tags(delete old ones, add new ones):
    //old_tags = findNotesTags(note_id)
    //new_tags = outerJoin(old_tags, tags)  : tags.filter(x => !old_tags.includes(x))
    //addNotesTags(note._id, new_tags)

    
    if(tags!=undefined)
    {
      let old_tags: string[] = await findNotesTags(note._id);
      let new_tags = tags.filter(x => {if(x._id != undefined){!old_tags.includes(x._id);}})
      let new_tags_ids!: string[]; //if newtags isnt empty this wont be empty
      new_tags.forEach (element => 
        {
          if (element._id != undefined)
            {
              new_tags_ids.push(element._id);
            };
        }
      )
      addNotesTags(note._id, new_tags_ids);
    }


    res.status(204).send({'id': id})
  }
  else{
    res.status(404).send({'err': 'you dont have permission to edit this note'})
  }
  
})

router.delete('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let id = req.params.id;
  let logged_user: UserInfo = req.body.user
  if (!notes.hasNote(id)) {
      res.status(404).send({'err': 'note with this id not found'})
  }
  let note = await notes.getNote(id)
  if(logged_user.is_admin|| note && note.owner_name == logged_user.name){
    notes.deleteNote(id);
    res.status(204).send();
  }
  else{
    res.status(403).send({'err': 'you dont have permission to change this note'})
  }
})