import Note, { Tag } from './model';
import { generate_id } from './id';

interface INotesAccess {
    hasNote(id:number): boolean;
    getNote(id:number): Note | undefined;
    getNotesCount(): number;
    getAllNotes(): Note[];
    addNote(note:Note): Note;
    updateNote(note:Note): void;
    deleteNote(id:number): void;
}

class InMemoryNotes implements INotesAccess {
    notes: Map<number, Note>;

    constructor() {
        this.notes = new Map<number, Note>();
    }

    hasNote(id:number): boolean {
        return this.notes.has(id)
    }

    getNote(id:number): Note | undefined {
        let note: Note | undefined = this.notes.get(id);
        return note;
    }

    getNotesCount(): number {
        return this.notes.size;
    }

    getAllNotes(): Note[] {
        let note_table: Note[] = [];
        this.notes.forEach((note: Note) => note_table.push(note));
        return note_table;
    }

    addNote(note:Note): Note {
        // update incomming note with creationDate and id fields
        let creation_date = new Date().toISOString();
        let id = generate_id(); //check if note id already exists
        note.creationDate = creation_date;
        note.id = id;
        //processing note.tags should be done before calling this method
        this.notes.set(id, note);
        return note;
    }

    updateNote(note:Note): void {
        if (note.id) {
            this.notes.set(note.id, note);
        }
    }

    deleteNote(id:number): void {
        this.notes.delete(id);
    }
}

export { INotesAccess, InMemoryNotes };
