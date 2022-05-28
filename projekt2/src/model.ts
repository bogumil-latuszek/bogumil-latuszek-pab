
export default interface Note {
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