
export default interface Note {
    id?: number;
    title: string;
    content: string;
    creationDate?: string; // data w formmacie ISO
    tags?: string[];
  }