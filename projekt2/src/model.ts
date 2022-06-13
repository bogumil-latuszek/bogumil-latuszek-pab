
export interface Note {
    owner_name?: string;
    id?: number;
    title: string;
    content: string;
    creationDate?: string; // data w formmacie ISO
    tags?: Tag[];
  }

export interface Tag {
  id?: number;
  name: string;
}

export interface User {
  name: string;
  password: string;
}

export interface UserInfo {
  name: string;
  is_admin: boolean;
}
