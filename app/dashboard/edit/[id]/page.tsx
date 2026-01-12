"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { Recipe } from "@/types/recipe";
import { toast } from "react-hot-toast";

export default function EditRecipePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { id } = useParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [time, setTime] = useState(30);
    const [difficulty, setDifficulty] = useState<Recipe["difficulty"]>("media");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(""); // Per mostrare l'immagine attuale

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState("");

    const [steps, setSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // 1. Carica i dati della ricetta
    useEffect(() => {
        if (!id || !user) return;

        const fetchRecipe = async () => {
            try {
                const docRef = doc(db, "recipes", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Recipe;

                    // Controllo di sicurezza: Solo l'autore può modificare
                    if (data.userId !== user.uid) {
                        toast.error("Non hai i permessi per modificare questa ricetta.");
                        router.push("/");
                        return;
                    }

                    // Popola lo stato con i dati esistenti
                    setTitle(data.title);
                    setDescription(data.description);
                    setTime(data.time);
                    setDifficulty(data.difficulty);
                    setIngredients(data.ingredients || []);
                    setSteps(data.steps || []);
                    setCurrentImageUrl(data.imageUrl || "");
                } else {
                    toast.error("Ricetta non trovata.");
                    router.push("/");
                }
            } catch (error) {
                console.error("Errore fetch:", error);
                toast.error("Errore nel caricamento della ricetta.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchRecipe();
    }, [id, user, router]);

    if (!loading && !user) {
        router.push("/login");
        return null;
    }

    // ... Funzioni di supporto (uguali alla Dashboard)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const addIngredient = () => {
        if (currentIngredient.trim()) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient("");
        }
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const addStep = () => {
        if (currentStep.trim()) {
            setSteps([...steps, currentStep.trim()]);
            setCurrentStep("");
        }
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    // 2. Aggiorna la ricetta
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        setIsSubmitting(true);

        try {
            let imageUrl = currentImageUrl; // Mantieni l'URL vecchio di default

            // Se l'utente ha caricato una NUOVA immagine, caricala su Storage
            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, `recipes/${fileName}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const updatedRecipe = {
                title,
                description,
                time,
                difficulty,
                ingredients,
                steps,
                imageUrl,
                updatedAt: new Date(),
            };

            const docRef = doc(db, "recipes", id as string);
            await updateDoc(docRef, updatedRecipe);

            toast.success("Ricetta aggiornata con successo! ✨", { duration: 3000 });

            setTimeout(() => {
                router.push(`/ricette/${id}`); // Torna al dettaglio
            }, 2000);

        } catch (error) {
            console.error("Errore aggiornamento:", error);
            toast.error("Errore durante l'aggiornamento.");
            setIsSubmitting(false);
        }
    };

    if (loading || isFetching) return <p className="p-10 text-center animate-pulse">Caricamento editor... 🖊️</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-orange-600">Modifica Ricetta ✏️</h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <form onSubmit={handleUpdate} className="space-y-8">
                    {/* Campi identici alla Dashboard creati in precedenza */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Piatto 📸</label>
                            {/* Anteprima immagine attuale */}
                            {currentImageUrl && !imageFile && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">Immagine attuale:</p>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={currentImageUrl} alt="Current" className="h-32 w-auto rounded-md object-cover border" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            {imageFile && <p className="text-xs text-green-600 mt-1">Nuova immagine selezionata</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minuti</label>
                                <input
                                    type="number"
                                    value={time}
                                    onChange={(e) => setTime(Number(e.target.value))}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    min={1}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficoltà</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value as any)}
                                    className="w-full px-4 py-2 border rounded-lg bg-white"
                                >
                                    <option value="facile">Facile</option>
                                    <option value="media">Media</option>
                                    <option value="difficile">Difficile</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Ingredienti */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">🛒 Ingredienti</h3>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentIngredient}
                                onChange={(e) => setCurrentIngredient(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Aggiungi ingrediente..."
                            />
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Aggiungi
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span>• {ing}</span>
                                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-500 hover:text-red-700">✕</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Steps */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">👨‍🍳 Preparazione</h3>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentStep}
                                onChange={(e) => setCurrentStep(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Aggiungi passaggio..."
                            />
                            <button
                                type="button"
                                onClick={addStep}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Aggiungi
                            </button>
                        </div>
                        <ol className="space-y-2 list-decimal list-inside">
                            {steps.map((step, i) => (
                                <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span className="truncate flex-1">{i + 1}. {step}</span>
                                    <button type="button" onClick={() => removeStep(i)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-1/3 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || ingredients.length === 0 || steps.length === 0}
                            className="w-2/3 bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Salvataggio..." : "Salva Modifiche 💾"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
