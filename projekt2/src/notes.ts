import express from 'express';
import {Request, Response} from 'express';
import { INotesAccess, InMemoryNotes } from './data_storage'
import {Note, UserAuth} from './model';
import { process_tags } from './tags';
import { authMiddleware } from './auth';

const  router = express.Router()
export default router

let notes: INotesAccess = new InMemoryNotes();

router.get('/note/:id', (req: Request, res: Response) => {
  let id = +req.params.id
  if (notes.hasNote(id)) {
      let note = notes.getNote(id);
      res.status(200).send(note)
  }
  else {
      res.status(404).send(`note with id=${id} doesn't exist`)
  }
})

router.get('/notes/', authMiddleware, (req: Request, res: Response) => {
  let logged_user: UserAuth = req.body.user;
  /*if (logged_user is not owner of this note) {
    res.status(404).send(`not autorized`)
  }*/
  if (notes.getNotesCount() > 0) {
      let note_table: Note[] = notes.getAllNotes();
      res.status(200).send(note_table);
  }
  else {
      res.status(404).send(`items not found`)
  }
})

router.post('/note/', (req: Request, res: Response) => {
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
      let note: Note = req.body;
      if (note.tags) {
          note.tags = process_tags(note.tags)
      }
      note = notes.addNote(note);
      res.status(201).send({'id': note.id })
  }
})

router.put('/note/:id', (req: Request, res: Response) => {
  let note: Note = req.body;
  let id = +req.params.id;
  if (!notes.hasNote(id)) {
      res.status(404).send({'err': 'note with this id not found'})
  }
  if (note.tags) {
      note.tags = process_tags(note.tags)
  }
  note.id = id;
  notes.updateNote(note);
  res.status(204).send({'id': id})
})

router.delete('/note/:id', (req: Request, res: Response) => {
  let id = +req.params.id;
  if (!notes.hasNote(id)) {
      res.status(404).send({'err': 'note with this id not found'})
  }
  notes.deleteNote(id);
  res.status(204).send();
})