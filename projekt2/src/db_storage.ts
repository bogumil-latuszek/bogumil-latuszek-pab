import { Note, Tag, User } from './model';
import Unique_id_generator from './id';
import fs from 'fs';
import config from './config';
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage';
//import { Schema, model, connect } from 'mongoose';

//export default function start(){
//    mongoose.connect(config.MONGO_URI, ()=>console.log("działa"));
//}

/*
//schema
const userSchema = new Schema<User>({
    // name: String,
    // password: String,
    // is_admin: Boolean,
    name: { type: String, required: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, required: true },
  });
  
// 3. Create a Model.
const UserInDb = model<User>('UserInDb', userSchema);
*/

async function readFile(filePath: string): Promise<string> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data;
    } catch (err) {
        console.log(err);
        return "";
    }
}

async function updateStorage(dataToSave: string, filePath: string): Promise<void> {
    try {
        await fs.promises.writeFile(filePath, dataToSave);
    } catch (err) {
        console.log(err);
    }
}

class DbNotes implements INotesAccess {
    notes: Map<number, Note>;
    filePath: string;
    gen: Unique_id_generator;

    constructor() {
        this.filePath = '.db' + config.notesStoragePath;
        if (! fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "{}");
        }
        this.gen = new Unique_id_generator();
        this.notes = new Map<number, Note>();
        readFile(this.filePath).then(notesUnprocessed => {
            this.notes = this.convertJsonStringToMap(notesUnprocessed);
        });
    }

    convertMapToJsonString(notes: Map<number, Note>): string {
        let jsonObject: { [k: string]: Note; } = {};
        notes.forEach((value, key) => {
            let keyAsString = key.toString();
            jsonObject[keyAsString] = value;
        });
        let jsonText = JSON.stringify(jsonObject, null, 4);
        return jsonText;
    }

    convertJsonStringToMap(jsonString: string): Map<number, Note> {
        let map = new Map<number, Note>();
        if (jsonString) {
            let jsonObject = JSON.parse(jsonString);
            for (var key in jsonObject) {
                map.set(+key, jsonObject[key]);
            }
        }
        return map;
    }

    hasNote(id: number): boolean {
        return this.notes.has(id);
    }

    getNote(id: number): Note | undefined {
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

    getAllPublicNotes(userName: string): Note[] {
        let note_table: Note[] = this.getAllNotes();
        let note_table_public: Note[] = [];
        note_table.forEach((note: Note) => {
            if (note.private == false &&
                note.owner_name == userName) {
                note_table_public.push(note);
            }
        });
        return note_table_public;
    }

    addNote(note: Note): Note {
        // update incomming note with creationDate and id fields
        let creation_date = new Date().toISOString();
        let id = this.gen.generate_unique_id(this.notes);
        note.creationDate = creation_date;
        note.id = id;
        //processing note.tags should be done before calling this method
        this.notes.set(id, note);
        this.save();
        return note;
    }

    save(): void {
        let notesStringified: string = this.convertMapToJsonString(this.notes);
        updateStorage(notesStringified, this.filePath);
    }

    updateNote(note: Note): void {
        if (note.id) {
            this.notes.set(note.id, note);
            this.save();
        }
    }

    deleteNote(id: number): void {
        this.notes.delete(id);
        this.save();
    }
}
class DbTags implements ITagsAccess {
    tags: Map<number, Tag>;
    filePath: string;
    gen: Unique_id_generator;

    constructor() {
        this.filePath = '.db' + config.tagsStoragePath;
        if (! fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "{}");
        }
        this.gen = new Unique_id_generator();
        this.tags = new Map<number, Tag>();
        readFile(this.filePath).then(tagsUnprocessed => {
            this.tags = this.convertJsonStringToMap(tagsUnprocessed);
        });
    }

    convertMapToJsonString(tags: Map<number, Tag>): string {
        let jsonObject: { [k: string]: Tag; } = {};
        tags.forEach((value, key) => {
            let keyAsString = key.toString();
            jsonObject[keyAsString] = value;
        });
        let jsonText = JSON.stringify(jsonObject, null, 4);
        return jsonText;
    }

    convertJsonStringToMap(jsonString: string): Map<number, Tag> {
        let map = new Map<number, Tag>();
        if (jsonString) {
            let jsonObject = JSON.parse(jsonString);
            for (var key in jsonObject) {
                map.set(+key, jsonObject[key]);
            }
        }
        return map;
    }

    hasTag(id: number): boolean {
        return this.tags.has(id);
    }

    getTag(id: number): Tag | undefined {
        let tag: Tag | undefined = this.tags.get(id);
        return tag;
    }

    findTagId(name: string): number | undefined {
        // tag is always lowercase
        let searched_name: string = name.toLowerCase();
        let tag_id: number | undefined = undefined;
        this.tags.forEach((tag: Tag) => {
            if (tag.name == searched_name) {
                tag_id = tag.id;
            }
        });
        return tag_id;
    }

    getTagsCount(): number {
        return this.tags.size;
    }

    getAllTags(): Tag[] {
        let tag_table: Tag[] = [];
        this.tags.forEach((tag: Tag) => tag_table.push(tag));
        return tag_table;
    }

    addTag(tag: Tag): Tag {
        // tag is always lowercase
        tag.name = tag.name.toLowerCase();
        // update incomming tag with id
        let id = this.gen.generate_unique_id(this.tags);
        tag.id = id;
        this.tags.set(id, tag);
        this.save();
        return tag;
    }

    save(): void {
        let tagsStringified: string = this.convertMapToJsonString(this.tags);
        updateStorage(tagsStringified, this.filePath);
    }

    updateTag(tag: Tag): void {
        if (tag.id) {
            this.tags.set(tag.id, tag);
            this.save();
        }
    }

    deleteTag(id: number): void {
        this.tags.delete(id);
        this.save();
    }
}
class DbUsers implements IUsersAccess {
    users: Map<string, User>;
    filePath: string;

    constructor() {
        this.filePath = '.db' + config.userDataStoragePath;
        if (! fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "{}");
        }
        this.users = new Map<string, User>();
        readFile(this.filePath).then(usersUnprocessed => {
            this.users = this.convertJsonStringToMap(usersUnprocessed);
        });
    }

    convertMapToJsonString(users: Map<string, User>): string {
        let jsonObject: { [k: string]: User; } = {};
        users.forEach((value, key) => {
            let keyAsString = key.toString();
            jsonObject[keyAsString] = value;
        });
        let jsonText = JSON.stringify(jsonObject, null, 4);
        return jsonText;
    }

    convertJsonStringToMap(jsonString: string): Map<string, User> {
        let map = new Map<string, User>();
        if (jsonString) {
            let jsonObject = JSON.parse(jsonString);
            for (var key in jsonObject) {
                map.set(key, jsonObject[key]);
            }
        }
        return map;
    }

    async hasUser(name: string): Promise<boolean> {
        let has_user: boolean = this.users.has(name);
        return Promise.resolve(has_user)
    }

    getUser(name: string): User | undefined {
        let user: User | undefined = this.users.get(name);
        return user;
    }

    addUser(user: User): User {
        this.users.set(user.name, user);
        this.save();
        return user;
    }

    /*
    async addUser_async(user: User): Promise<User> {
        let name: String = user.name;
        let password: String = user.password;
        let is_admin: Boolean = user.is_admin;
        const userInDb = await  UserInDb.create({
            name,
            password,
            is_admin,
        });
        return user
    }

    addUser(user: User): User{
        this.addUser_async(user).then((user:User)=>{ new User{user.name, user.password, user.is_admin}});
    }
    */

    save(): void {
        let usersStringified: string = this.convertMapToJsonString(this.users);
        updateStorage(usersStringified, this.filePath);
    }
}
export {  DbNotes, DbTags, DbUsers };
