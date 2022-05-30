import Note, { Tag } from './model';
import Unique_id_generator from './id';
import fs from 'fs';

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
    filePath: string;
    gen: Unique_id_generator;

    constructor() {
        this.filePath = "";
        this.gen = new Unique_id_generator();
        this.notes = new Map<number, Note>();
        this.readFile(".config.json").then(configText => {
            let configObject = JSON.parse(configText)
            let notesStoragePath = configObject["notesStoragePath"]
            this.filePath = notesStoragePath;
            this.readFile(notesStoragePath).then(notesUnprocessed => {
                this.notes = this.convertJsonStringToMap(notesUnprocessed)
            })
        })
    }

    private async readFile(filePath:string):Promise<string>{
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            return data;
        } catch (err) {
            console.log(err)
            return "";
        }
    }

    private async updateStorage(dataToSave: string): Promise<void> {
        try {
            await fs.promises.writeFile(this.filePath, dataToSave );
        } catch (err) {
            console.log(err)
        }
    }
    
    convertMapToJsonString(notes: Map<number, Note>): string {
        let jsonObject: {[k: string]: Note} = {};  
        notes.forEach((value, key) => {
            let keyAsString = key.toString()
            jsonObject[keyAsString] = value  
        });
        let jsonText = JSON.stringify(jsonObject, null, 4)
        return jsonText;
    }

    convertJsonStringToMap(jsonString: string): Map<number, Note> {
        let jsonObject = JSON.parse(jsonString)
        let map = new Map<number, Note>()  
        for (var key in jsonObject) {  
           map.set(+key, jsonObject[key])  
        }  
        return map;
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
        let id = this.gen.generate_unique_id(this.notes);
        note.creationDate = creation_date;
        note.id = id;
        //processing note.tags should be done before calling this method
        this.notes.set(id, note);
        let notesStringified: string = this.convertMapToJsonString(this.notes)
        this.updateStorage(notesStringified)
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
