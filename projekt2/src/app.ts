import express from 'express'
import {Request, Response} from 'express'
import Note from './model'

const app = express()

app.use(express.json())

let notes: Array<Note> = [];

app.get('/', function (req: Request, res: Response) {
  res.send('GET Hello World')
})
app.post('/', function (req: Request, res: Response) {
  console.log(req.body) // e.x. req.body.title 
  res.status(200).send('POST Hello World')
})

app.get('/note/:id', function (req: Request, res: Response) {
  let id = +req.params.id
  if (id >= 0 && id < notes.length) {
    let note = notes[id];
    res.status(200).send(note)
  }
  else {
    res.status(404).send(`note with id=${id} doesn't exist`)
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
    let new_index = notes.length;
    note.id = new_index;
    let creation_date = new Date().toISOString();
    note.creationDate = creation_date;
    notes.push(note);
    res.status(201).send({'id': note.id})
  }
})



app.listen(3000)