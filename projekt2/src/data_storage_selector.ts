import { FilesNotes, FilesTags, FilesUsers } from './data_storage'
import { INotesAccess, ITagsAccess, IUsersAccess } from './idata_storage'
import {  DbNotes, DbTags, DbUsers, setupDBConnection } from './db_storage'
import config from './config';

 
let dataStorVar = config.data_storage_variant;


function initDataAccess() {
    if (dataStorVar == "db") {
        setupDBConnection()
    }
}

initDataAccess();

export function Select_Notes_Access(): INotesAccess{
    if(dataStorVar == "db"){
        return new DbNotes();
    }
    else if(dataStorVar == "file"){
        return new FilesNotes();
    }
    else{
        throw new Error(`${dataStorVar} is not a valid storage variant`);
    }
}
export function Select_Tags_Access(): ITagsAccess{
    if(dataStorVar == "db"){
        return new DbTags();
    }
    else if(dataStorVar == "file"){
        return new FilesTags();
    }
    else{
        throw new Error(`${dataStorVar} is not a valid storage variant`);
    }
}
export function Select_Users_Access(): IUsersAccess{
    if(dataStorVar == "db"){
        return new DbUsers();
    }
    else if(dataStorVar == "file"){
        return new FilesUsers();
    }
    else{
        throw new Error(`${dataStorVar} is not a valid storage variant`);
    }
}