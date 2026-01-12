export interface Recipe {
    id: string; // ID del documento Firestore
    title: string;
    description: string;
    time: number; // in minuti
    difficulty: 'facile' | 'media' | 'difficile';
    imageUrl?: string; // opzionale per ora
    userId: string; // chi ha creato la ricetta
    ingredients?: string[];
    steps?: string[];
}
