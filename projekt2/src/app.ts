import express from 'express';
import {Request, Response} from 'express';
import Note, { Tag } from './model';
import register_tag_routes from './tags';
import { process_tags } from './tags';
import { generate_id } from './id';

const app = express()

app.use(express.json())

let notes: Map<number, Note> = new Map<number, Note>(); 

app.get('/', function (req: Request, res: Response) {
  res.send('GET Hello World')
})
app.post('/', function (req: Request, res: Response) {
  console.log(req.body) // e.x. req.body.title 
  res.status(200).send('POST Hello World')
})

app.get('/note/:id', function (req: Request, res: Response) {
  let id = +req.params.id
  if (notes.has(id)) {
    let note = notes.get(id);
    res.status(200).send(note)
  }
  else {
    res.status(404).send(`note with id=${id} doesn't exist`)
  }
})

app.get('/notes/', function (req: Request, res: Response) {
  if (notes.size > 0) {
    let note_table: Note[] = [];
    notes.forEach((note: Note) => note_table.push(note));
    res.status(200).send(note_table);
  }
  else {
    res.status(404).send(`items not found`)
  }
})

app.post('/note/', (req: Request, res: Response) =>
{
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
    let creation_date = new Date().toISOString();
    let id = generate_id(); //check if note id already exists
    note.creationDate = creation_date;
    note.id = id;
    if (note.tags) {
      note.tags = process_tags(note.tags)
    }
    notes.set(id, note);
    res.status(201).send({'id': id })
  }
})

app.put('/note/:id', (req: Request, res: Response) =>
{
  let note: Note = req.body;
  let id = +req.body.id;
  if(!notes.has(id)){
    res.status(404).send({'err': 'note with this id not found'})
  }
  notes.set(id, note);
  res.status(204).send({'id': id})
})

app.delete('/note/:id', (req: Request, res: Response) =>
{
  let id = +req.params.id;
  if(!notes.has(id)){
    res.status(404).send({'err': 'note with this id not found'})
  }
  notes.delete(id);
  res.status(204).send();
})


register_tag_routes(app);

app.listen(3000)