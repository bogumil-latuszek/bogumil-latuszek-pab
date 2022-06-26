import {Note, Tag , User} from './model';

interface INotesAccess {
    hasNote(id:number): boolean;
    getNote(id:number): Note | undefined;
    getNotesCount(): number;
    getAllNotes(): Note[];
    getAllPublicNotes(userName:string): Note[];
    addNote(note:Note): Note;
    updateNote(note:Note): void;
    deleteNote(id:number): void;
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


