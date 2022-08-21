import { Schema, model, Model } from 'mongoose';
import { Note, Tag, User, NotesTags, UserInfo} from './model.js';  // 1. interface representing a document in MongoDB.

// 2. Create a Schema corresponding to the document interface.
const NoteSchema = new Schema<Note>({
    // _id is auto-populated by mongoose
    private:  { type: Boolean, required: true },
    owner_name: { type: String, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    creationDate: { type: String, required: false }//, // data w formmacie ISO
});

const UserSchema = new Schema<User>({
    // _id is auto-populated by mongoose
    name:  { type: String, required: true },
    password:  { type: String, required: true },
    is_admin:  { type: Boolean, required: true }
});

const TagSchema = new Schema<Tag>({
    // _id is auto-populated by mongoose
    name: { type: String, required: true },
    owner_name: { type: String, required: false }
});

const NotesTagsSchema = new Schema<NotesTags>({
    // _id is auto-populated by mongoose
    note_id: { type: String, required: true },
    tag_id: { type: String, required: true }
});


// 3. Create a Model.
const Mongo_Note: Model<Note> = model<Note>('Note', NoteSchema);
const Mongo_User: Model<User> = model<User>('User', UserSchema);
const Mongo_Tag: Model<Tag> = model<Tag>('Tag', TagSchema);
const Mongo_Notes_Tags: Model<NotesTags> = model<NotesTags>('NotesTags', NotesTagsSchema); //app crushes when i add here breakpoint

export {Mongo_Note, Mongo_User, Mongo_Tag, Mongo_Notes_Tags};