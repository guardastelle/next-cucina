"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Recipe } from "@/types/recipe";
import { toast } from "react-hot-toast"; // Import Toast

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [time, setTime] = useState(30);
    const [difficulty, setDifficulty] = useState<Recipe["difficulty"]>("media");
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [currentIngredient, setCurrentIngredient] = useState("");

    const [steps, setSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!loading && !user) {
        router.push("/login");
        return null;
    }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            let imageUrl = "";

            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const storageRef = ref(storage, `recipes/${fileName}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const newRecipe = {
                title,
                description,
                time,
                difficulty,
                userId: user.uid,
                ingredients,
                steps,
                imageUrl,
                createdAt: new Date(),
            };

            await addDoc(collection(db, "recipes"), newRecipe);

            // Toast con durata personalizzata
            toast.success("Ricetta pubblicata con foto! 📸🍝", { duration: 3000 });

            // Attendi 2 secondi prima di cambiare pagina per far leggere il messaggio
            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (error) {
            console.error("Errore salvataggio:", error);
            toast.error("Errore durante il salvataggio.");
            setIsSubmitting(false); // Riabilita il bottone solo in caso di errore
        }
        // Rimuoviamo il finally per lasciare il bottone disabilitato durante il redirect
    };

    if (loading) return <p className="p-10 text-center">Caricamento...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2">Benvenuto in cucina, {user?.email} 👨‍🍳</h1>
            <p className="text-gray-600 mb-10">Crea la tua prossima ricetta completa.</p>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-orange-600">Nuova Ricetta</h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Es. Tiramisù"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Piatto 📸</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100"
                            />
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
                                placeholder="Es. 200g di farina"
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
                                placeholder="Es. Mescolare le uova..."
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

                    <button
                        type="submit"
                        disabled={isSubmitting || ingredients.length === 0 || steps.length === 0}
                        className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Caricamento in corso..." : "Pubblica con Foto 📸"}
                    </button>
                </form>
            </div>
        </div>
    );
}
