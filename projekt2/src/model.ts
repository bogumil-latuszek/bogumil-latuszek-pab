
export interface Note {
    private: boolean
    owner_name?: string;
    _id?: number;
    title: string;
    content: string;
    creationDate?: string; // data w formmacie ISO
    tags?: Tag[];
  }

export interface Tag {
  _id?: number;
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
