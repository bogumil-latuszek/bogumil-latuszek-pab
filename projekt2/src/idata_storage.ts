import {Note, Tag , User} from './model';

interface INotesAccess {
    hasNote(id:string): Promise<boolean>;
    getNote(id:string): Promise<Note | undefined>;
    getNotesCount(): Promise<number>;
    getAllNotes(): Promise<Note[]>;
    getAllPublicNotes(userName:string): Promise<Note[]>;
    addNote(note:Note): Promise<Note>;
    updateNote(note:Note): Promise<void>;
    deleteNote(id:string): Promise<void>;
}

interface ITagsAccess {
    hasTag(id:string): Promise<boolean>;
    getTag(id:string): Promise<Tag | undefined>;
    findTagId(name:string): Promise<string | undefined>;
    getTagsCount(): Promise<number>;
    getAllTags(): Promise<Tag[]>;
    addTag(tag:Tag): Promise<Tag>;
    save(): Promise<void>;
    updateTag(tag:Tag): Promise<void>;
    deleteTag(id:string): Promise<void>;
    addNotesTags(note_id : string, tags_ids: string[]): Promise<void>;
    findNotesTags(note_id : string): Promise<string[]>;
}

interface IUsersAccess {
    hasUser(user_name:string): Promise<boolean>;
    getUser(user_name:string): Promise<User | undefined>;
    addUser(_user:User): Promise<User | undefined>;
}


export { INotesAccess, ITagsAccess, IUsersAccess };


