import { Note, Tag, User } from './model';
import Unique_id_generator from './id';
import fs from 'fs';
import config from './config';
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage';
import { Schema, model, connect, Model } from 'mongoose';
import Mongo_Note from './mongo_models';

let dbConnectingStarted: Boolean = false;

export function setupDBConnection() {
    if (!dbConnectingStarted) {
        dbConnectingStarted = true;
        connect(config.MONGO_URI)
        .then(() => {
            console.log("MongoDB started");
        })
        .catch(e => {
            console.log(e);
        });
    }
}

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
    //notes: Map<number, Note>;
   // filePath: string;
   // gen: Unique_id_generator;
    

    constructor() {
       /* this.filePath = '.db' + config.notesStoragePath;
        if (! fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "{}");
        }
        this.gen = new Unique_id_generator();
        this.notes = new Map<number, Note>();
        readFile(this.filePath).then(notesUnprocessed => {
            this.notes = this.convertJsonStringToMap(notesUnprocessed);
        });*/
    }

    /*convertMapToJsonString(notes: Map<number, Note>): string {
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
    }*/

    async hasNote(id: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    async getNote(id: number): Promise<Note | undefined> {
        //let note: Note | undefined = this.notes.get(id);
        //return Promise.resolve(note);
        return Mongo_Note.findOne({ id }).lean();
    }

    async getNotesCount(): Promise<number> {
       /* return Promise.resolve(this.notes.size);*/
       return Promise.resolve(0);
    }

    async getAllNotes(): Promise<Note[]> {
       /* let note_table: Note[] = [];
        this.notes.forEach((note: Note) => note_table.push(note));
        return Promise.resolve(note_table);
       */
       let notes_empty: Note[] = [{private: false,  title: 'sdfdfgs',  content: 'string' }];
        return Promise.resolve(notes_empty);
    }

    async getAllPublicNotes(userName: string): Promise<Note[]> {
        /*let note_table: Note[] = await this.getAllNotes();
        let note_table_public: Note[] = [];
        note_table.forEach((note: Note) => {
            if (note.private == false &&
                note.owner_name == userName) {
                note_table_public.push(note);
            }
        });
        return Promise.resolve(note_table_public);
        */
        let notes_empty: Note[] = [{private: false,  title: 'sdfdfgs',  content: 'string' }];
        return Promise.resolve(notes_empty);
    }

    async addNote(note: Note): Promise<Note> {
        // update incomming note with creationDate and id fields
        let creation_date = new Date().toISOString();
        note.creationDate = creation_date;
        //processing note.tags should be done before calling this method
        //this.notes.set(id, note);
        //this.save();
        //return Promise.resolve(note);
        return Mongo_Note.create(note);
    }

    /*save(): void {
        let notesStringified: string = this.convertMapToJsonString(this.notes);
        updateStorage(notesStringified, this.filePath);
    }
    */

    async updateNote(note: Note): Promise<void> {
        /*if (note._id) {
            this.notes.set(note._id, note);
            Promise.resolve(this.save());
        }*/
        return Promise.resolve();
    }

    async deleteNote(id: number): Promise<void> {
        /*this.notes.delete(id);
        Promise.resolve(this.save());
        */
        return Promise.resolve();
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

    hasTag(id: number): Promise<boolean> {
        return Promise.resolve(this.tags.has(id));
    }

    getTag(id: number): Promise<Tag | undefined> {
        let tag: Tag | undefined = this.tags.get(id);
        return Promise.resolve(tag);
    }

    findTagId(name: string): Promise<number | undefined> {
        // tag is always lowercase
        let searched_name: string = name.toLowerCase();
        let tag_id: number | undefined = undefined;
        this.tags.forEach((tag: Tag) => {
            if (tag.name == searched_name) {
                tag_id = tag._id;
            }
        });
        return Promise.resolve(tag_id);
    }

    getTagsCount():  Promise<number> {
        return Promise.resolve(this.tags.size);
    }

    getAllTags(): Promise<Tag[]> {
        let tag_table: Tag[] = [];
        this.tags.forEach((tag: Tag) => tag_table.push(tag));
        return Promise.resolve(tag_table);
    }

    addTag(tag: Tag): Promise<Tag> {
        // tag is always lowercase
        tag.name = tag.name.toLowerCase();
        // update incomming tag with id
        let id = this.gen.generate_unique_id(this.tags);
        tag._id = id;
        this.tags.set(id, tag);
        this.save();
        return Promise.resolve(tag);
    }

    save(): Promise<void> {
        let tagsStringified: string = this.convertMapToJsonString(this.tags);
        updateStorage(tagsStringified, this.filePath);
        return Promise.resolve();
    }

    updateTag(tag: Tag): Promise<void> {
        if (tag._id) {
            this.tags.set(tag._id, tag);
            this.save();
        }
        return Promise.resolve();
    }

    deleteTag(id: number): Promise<void> {
        this.tags.delete(id);
        this.save();
        return Promise.resolve();
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

    async getUser(name: string): Promise<User | undefined> {
        let user: User | undefined = this.users.get(name);
        return Promise.resolve(user);
    }

    addUser(user: User): Promise<User | undefined> {
        this.users.set(user.name, user);
        this.save();
        return Promise.resolve(user);
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
