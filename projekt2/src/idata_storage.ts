import {Note, Tag , User} from './model';

interface INotesAccess {
    hasNote(id:number): Promise<boolean>;
    getNote(id:number): Promise<Note | undefined>;
    getNotesCount(): Promise<number>;
    getAllNotes(): Promise<Note[]>;
    getAllPublicNotes(userName:string): Promise<Note[]>;
    addNote(note:Note): Promise<Note>;
    updateNote(note:Note): Promise<void>;
    deleteNote(id:number): Promise<void>;
}

interface ITagsAccess {
    hasTag(id:number): Promise<boolean>;
    getTag(id:number): Promise<Tag | undefined>;
    findTagId(name:string): Promise<number | undefined>;
    getTagsCount(): Promise<number>;
    getAllTags(): Promise<Tag[]>;
    addTag(tag:Tag): Promise<Tag>;
    save(): Promise<void>;
    updateTag(tag:Tag): Promise<void>;
    deleteTag(id:number): Promise<void>;
}

interface IUsersAccess {
    hasUser(user_name:string): Promise<boolean>;
    getUser(user_name:string): Promise<User | undefined>;
    addUser(user:User): Promise<User | undefined>;
}


export { INotesAccess, ITagsAccess, IUsersAccess };


