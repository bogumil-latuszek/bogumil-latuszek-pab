import { FilesNotes, FilesTags, FilesUsers } from './data_storage'
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage'
//import {  DbNotes, DbTags, DbUsers } from './db_storage'


export function Select_Notes_Access(): INotesAccess{
    if(true){
        return new FilesNotes();
    }
    //else{
    //    return new DbNotes();
    //}
}
export function Select_Tags_Access(): ITagsAccess{
    if(true){
        return new FilesTags();
    }
    //else{
    //    return new DbTags();
    //}
}
export function Select_Users_Access(): IUsersAccess{
    if(true){
        return new FilesUsers();
    }
    //else{
    //    return new DbUsers();
    //}
}