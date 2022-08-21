import { Note, Tag, User } from './model';
import Unique_id_generator from './id';
import fs from 'fs';
import config from './config';
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage';
import { Schema, model, connect, Model } from 'mongoose';
import {Mongo_Note , Mongo_User, Mongo_Tag, Mongo_Notes_Tags} from './mongo_models';

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

    constructor() {

    }

    async hasNote(id: string): Promise<boolean> {
        /*let exists : boolean = false;
        Mongo_Note.countDocuments({_id: id}, function (err, count){ 
            if(count>0){
                exists = true;
            }
        }); */
        const note = await Mongo_Note.findById(id).lean();
        //const result = await Mongo_Note.findOne({ _id: id }).select("_id").lean();
        // if (result) {
        
       // }
        //else
       // {
       //     return Promise.resolve(false);
       // }
        //let mongo_note = await Mongo_Note.exists({ _id : id}) //im starting to think this shit doesnt work at all
         //Uncaught ReferenceError: Mongo_Note is not defined
         //Uncaught ReferenceError: mongo_note is not defined
        if(note == undefined)
        {
            return Promise.resolve(false);
        }
        else 
        {
            return Promise.resolve(true);
        }
    }

    async getNote(id: string): Promise<Note | undefined> {
        return Mongo_Note.findOne({ id }).lean();
    }

    async getNotesCount(): Promise<number> {
       return Mongo_Note.countDocuments({});
    }
    
    async getAllNotes(): Promise<Note[]> {
        let notes_empty =  Mongo_Note.find({}); //is this of Note[] type?
        return Promise.resolve(notes_empty);
    }

    async getAllPublicNotes(userName: string): Promise<Note[]> {
        let notes_empty =  Mongo_Note.find({ private : false}); //is this of Note[] type?
        return Promise.resolve(notes_empty);
    }

    async addNote(note: Note): Promise<Note> {
        // update incomming note with creationDate and id fields
        let creation_date = new Date().toISOString();
        // see: https://stackoverflow.com/questions/45952928/mongodb-error-document-must-have-an-id-before-saving
        // let id = new Schema.Types.ObjectId();
        note.creationDate = creation_date;
        return Mongo_Note.create(note); //this line causes app to crash 
    }

    async updateNote(note: Note): Promise<void> {
        let id = note._id;
        let retrived_node = await Mongo_Note.findOne({ id });
        if(retrived_node != undefined)
        {
            // przepisz/nadgraj pola
            retrived_node.content = note.content; //note has to have "content" field since it is validated as Note type
            retrived_node.private = note.private;
            retrived_node.title = note.title;
            //if(retrived_node.hasOwnProperty('owner_name')){retrived_node.title = note.title;}
            //owner_name, creation date and _id shouldnt be changed
            await retrived_node.save();
        }
        return Promise.resolve();
    }

    async deleteNote(id: string): Promise<void> {
        let retrived_node = await Mongo_Note.findOne({ id });
        retrived_node?.deleteOne({_id: id})
        return Promise.resolve();
    }
}
class DbTags implements ITagsAccess {

    constructor() {

    }

    async hasTag(id: string): Promise<boolean> {
        if (Mongo_Tag.exists({ _id : id}) == undefined){
            return Promise.resolve(false);
        }
        else{
            return Promise.resolve(true)
        };
    }
    async getTag(id: string): Promise<Tag | undefined> {
        return Mongo_Tag.findOne({id}).lean();
    }

    async findTagId(name: string): Promise<string | undefined> {
        // tag is always lowercase
        let searched_name: string = name.toLowerCase();
        let tag_id: string | undefined = undefined;
        let foundTag = await Mongo_Tag.findOne({name});;
        if(foundTag != undefined){
            let tag_id : string | undefined = foundTag.toJSON()._id
            return Promise.resolve(tag_id);
        }
        else{
            return Promise.resolve(undefined);
        }
    }

    async getTagsCount():  Promise<number> {
        return Mongo_Tag.countDocuments({});
    }

    async getAllTags(): Promise<Tag[]> {
        let tags_empty =  Mongo_Tag.find({}); //is this of Note[] type?
        return Promise.resolve(tags_empty);
    }

    async addTag(tag: Tag): Promise<Tag> {
        // tag is always lowercase
        tag.name = tag.name.toLowerCase();
        return Mongo_Note.create(tag);
    }
    
    save(): Promise<void> {
        return Promise.resolve();
    }

    async updateTag(tag: Tag): Promise<void> {
        
        let id = tag._id;
        let retrived_tag = await Mongo_Tag.findOne({ id });
        if(retrived_tag == undefined){ 

        }
        else{ //if tag which we want to update exists
            let id_of_tag_that_has_this_name = await this.findTagId(tag.name);
            if (id_of_tag_that_has_this_name == undefined){//if new name for it isn't already taken
                retrived_tag.name = tag.name;
            }
        }

        return Promise.resolve();
    }

    async deleteTag(id: string): Promise<void> {
        let retrived_tag = await Mongo_Tag.findOne({ id });
        retrived_tag?.deleteOne({_id: id})
        return Promise.resolve();
    }

    async addNotesTags(note_id: string, tags_ids: string[]): Promise<void> {
        tags_ids.forEach(element => {
            Mongo_Notes_Tags.create(note_id, element);
        });
        return Promise.resolve();
    }

    async findNotesTags(note_id : string): Promise<string[]>{
        let tag_ids! : string[]; 
        //or add 1 default tag, 
        //or make shure in loop that tagids wont be empty 
        //or change its type to string[]|undefined
        let tags = await Mongo_Notes_Tags.find({note_id});
        tags.forEach(tag => {
            tag_ids.push(tag.id);
        });
        return Promise.resolve(tag_ids);

    }

}
class DbUsers implements IUsersAccess {

    constructor() {
    }

    async hasUser(_name: string): Promise<boolean> {
        let existing_doc = await Mongo_User.find({ name : _name});
        if (existing_doc.length > 0){ //it's length is 0 => it is empty
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
