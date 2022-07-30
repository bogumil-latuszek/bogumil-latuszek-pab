import { Note, Tag, User } from './model';
import Unique_id_generator from './id';
import fs from 'fs';
import config from './config';
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage';
import { Schema, model, connect, Model } from 'mongoose';
import {Mongo_Note , Mongo_User} from './mongo_models';

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

    }

    async hasNote(id: number): Promise<boolean> {
        if(Mongo_Note.exists({ _id : id}) == undefined){return Promise.resolve(false);}
        else{return Promise.resolve(true)};
    }

    async getNote(id: number): Promise<Note | undefined> {
        //let note: Note | undefined = this.notes.get(id);
        //return Promise.resolve(note);
        return Mongo_Note.findOne({ id }).lean();
    }

    async getNotesCount(): Promise<number> {
       /* return Promise.resolve(this.notes.size);*/
       return Mongo_Note.countDocuments({});
    }

    async getAllNotes(): Promise<Note[]> {
       /* let note_table: Note[] = [];
        this.notes.forEach((note: Note) => note_table.push(note));
        return Promise.resolve(note_table);
       */
        let notes_empty =  Mongo_Note.find({}); //is this of Note[] type?
        //let notes_empty: Note[] = [{private: false,  title: 'sdfdfgs',  content: 'string' }];
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
        let notes_empty =  Mongo_Note.find({ private : false}); //is this of Note[] type?
        //let notes_empty: Note[] = [{private: false,  title: 'sdfdfgs',  content: 'string' }];
        return Promise.resolve(notes_empty);
    }

    async addNote(note: Note): Promise<Note> {
        // update incomming note with creationDate and id fields
        let creation_date = new Date().toISOString();
        // see: https://stackoverflow.com/questions/45952928/mongodb-error-document-must-have-an-id-before-saving
        // let id = new Schema.Types.ObjectId();
        note.creationDate = creation_date;
        return Mongo_Note.create(note);
    }

    async updateNote(note: Note): Promise<void> {
        /*if (note._id) {
            this.notes.set(note._id, note);
            Promise.resolve(this.save());
        }*/
        let id = note._id;
        //let retrived_node : Note | undefined = await this.getNote(id);
        let retrived_node = await Mongo_Note.findOne({ id });
        if(retrived_node == undefined){

        }
        else{
            // przepisz/nadgraj pola
            retrived_node.content = note.content; //note has to have "content" field since it is validated as Note type
            retrived_node.private = note.private;
            retrived_node.title = note.title;
            //if(retrived_node.hasOwnProperty('owner_name')){retrived_node.title = note.title;}
            retrived_node.tags = note.tags;
            //owner_name, creation date and _id shouldnt be changed
            await retrived_node.save();

        }

        return Promise.resolve();
    }

    async deleteNote(id: number): Promise<void> {
        /*this.notes.delete(id);
        Promise.resolve(this.save());
        */
        let retrived_node = await Mongo_Note.findOne({ id });
        retrived_node?.deleteOne({_id: id})
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

    constructor() {
    }

    async hasUser(_name: string): Promise<boolean> {
        let existing_doc = await Mongo_User.find({ name : _name});
        if (existing_doc){
            return Promise.resolve(true);
        }   //empty array should give false
        else {
            return Promise.resolve(false)
        };
    }

    async getUser(name: string): Promise<User | undefined> {
        return Mongo_User.findOne({ name }).lean();
    }

    addUser(user: User): Promise<User | undefined> {
        return Mongo_User.create(user);
    }
}
export {  DbNotes, DbTags, DbUsers };
