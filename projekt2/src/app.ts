import express from 'express';
import {Request, Response} from 'express';
import Note, { Tag } from './model';
import register_tag_routes from './tags';
import { process_tags } from './tags';
import { INotesAccess, InMemoryNotes } from './data_storage'

const app = express()

app.use(express.json())

let notes: INotesAccess = new InMemoryNotes();

app.get('/', (req: Request, res: Response) => {
    res.send('GET Hello World')
})

app.post('/', (req: Request, res: Response) => {
    console.log(req.body) // e.x. req.body.title 
    res.status(200).send('POST Hello World')
})

app.get('/note/:id', (req: Request, res: Response) => {
    let id = +req.params.id
    if (notes.hasNote(id)) {
        let note = notes.getNote(id);
        res.status(200).send(note)
    }
    else {
        res.status(404).send(`note with id=${id} doesn't exist`)
    }
})

app.get('/notes/', (req: Request, res: Response) => {
    if (notes.getNotesCount() > 0) {
        let note_table: Note[] = notes.getAllNotes();
        res.status(200).send(note_table);
    }
    else {
        res.status(404).send(`items not found`)
    }
})

app.post('/note/', (req: Request, res: Response) => {
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

app.put('/note/:id', (req: Request, res: Response) => {
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

app.delete('/note/:id', (req: Request, res: Response) => {
    let id = +req.params.id;
    if (!notes.hasNote(id)) {
        res.status(404).send({'err': 'note with this id not found'})
    }
    notes.deleteNote(id);
    res.status(204).send();
})

register_tag_routes(app);

app.listen(3000)
