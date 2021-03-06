import express from 'express';
import {Request, Response} from 'express';
import { INotesAccess} from './idata_storage'
import {Select_Notes_Access} from './data_storage_selector'
import {Note, UserInfo} from './model';
import { process_tags } from './tags';
import { authMiddleware } from './auth';
import { execPath } from 'process';

const  router = express.Router()
export default router

let notes: INotesAccess = Select_Notes_Access();

router.get('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let logged_user: UserInfo = req.body.user;
  let id = +req.params.id
  if (!notes.hasNote(id)) {
      res.status(404).send(`note with id=${id} doesn't exist`)
  }
  else {
    let note = await notes.getNote(id);
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
      let note: Note = req.body;
      if(logged_user.name == "anonymous"){  
        res.status(400).send({'err': 'you need to be logged in to post notes'})
      }
      if (note.tags) {
          note.tags = await process_tags(note.tags)
      }
      if(note.private == undefined){
        note.private = true;
      }
      note.owner_name = logged_user.name;
      note = await notes.addNote(note);
      res.status(201).send({'id': note._id })
  }
})

router.put('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let logged_user: UserInfo = req.body.user;
  delete req.body.user;
  let note: Note = req.body;
  let id = +req.params.id;
  if (!notes.hasNote(id)) {
      res.status(404).send({'err': 'note with this id not found'})
  }
  let noteToReplace = await  notes.getNote(id);
  if(noteToReplace  && logged_user.name == noteToReplace.owner_name){
    if (note.tags) {
      note.tags = await process_tags(note.tags)
    }
    note._id = id;
    note.owner_name = logged_user.name
    notes.updateNote(note);
    res.status(204).send({'id': id})
  }
  else{
    res.status(404).send({'err': 'you dont have permission to edit this note'})
  }
  
})

router.delete('/note/:id', authMiddleware, async (req: Request, res: Response) => {
  let id = +req.params.id;
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