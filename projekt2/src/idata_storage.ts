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
    hasTag(id:number): boolean;
    getTag(id:number): Tag | undefined;
    findTagId(name:string): number | undefined;
    getTagsCount(): number;
    getAllTags(): Tag[];
    addTag(tag:Tag): Tag;
    save(): void;
    updateTag(tag:Tag): void;
    deleteTag(id:number): void;
}

interface IUsersAccess {
    hasUser(user_name:string): boolean;
    getUser(user_name:string): User | undefined;
    addUser(user:User): User;
}


export { INotesAccess, ITagsAccess, IUsersAccess };


