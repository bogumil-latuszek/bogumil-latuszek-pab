
export default interface Note {
    id?: string;
    title: string;
    content: string;
    creationDate?: string; // data w formmacie ISO
    tags?: string[];
  }

export interface Tag {
  id?: number;
  name: string;
}