//import { Note, Tag, User } from './model';
//import Unique_id_generator from './id';
//import fs from 'fs';
//import config from './config';
//import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage';
import mongoose from 'mongoose';

export default function start(){
    mongoose.connect('mongodb://localhost:27017/myapp', ()=>console.log("działa"));
}

//export {  InMemoryNotes, InMemoryTags, InMemoryUsers };
