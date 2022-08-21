
export interface Note {
    private: boolean
    owner_name?: string;
    _id?: string;
    title: string;
    content: string;
    creationDate?: string; // data w formmacie ISO
  }

export interface Tag {
  _id?: string;
  name: string;
  owner_name?: string;
}

export interface User {
  name: string;
  password: string;
  is_admin: boolean;
}

export interface UserInfo {
  name: string;
  is_admin: boolean;
}

export interface NotesTags {
  tag_id: string;
  note_id: string;
}