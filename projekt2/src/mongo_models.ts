import { Schema, model, Model } from 'mongoose';
import { Note, Tag, User, UserInfo} from './model.js';  // 1. interface representing a document in MongoDB.

// 2. Create a Schema corresponding to the document interface.
const NoteSchema = new Schema<Note>({
    // _id is auto-populated by mongoose
    private:  { type: Boolean, required: true },
    owner_name: { type: String, required: false },
    _id: { type: Number, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    creationDate: { type: String, required: false }, // data w formmacie ISO
    tags:  { type: String, required: false } //???
});

// 3. Create a Model.
const Mongo_Note: Model<Note> = model<Note>('Task', NoteSchema);

export default Mongo_Note;