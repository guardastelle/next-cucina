"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Recipe } from "@/types/recipe";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RecipeDetailPage() {
    const { id } = useParams(); // Recupera l'ID dall'URL
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        // Se non c'è ID, non fare nulla (succede durante il primo render a volte)
        if (!id) return;

        const fetchRecipe = async () => {
            try {
                // Usa l'ID per trovare il documento specifico
                const docRef = doc(db, "recipes", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRecipe({ id: docSnap.id, ...docSnap.data() } as Recipe);
                } else {
                    console.log("Nessuna ricetta trovata!");
                }
            } catch (error) {
                console.error("Errore nel recupero della ricetta:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl animate-pulse">Caricamento ricetta... 🍲</p>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-bold text-gray-800">Ricetta non trovata 😢</h1>
                <Link href="/" className="text-orange-600 hover:underline mt-4 block">
                    Torna alla Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white shadow-lg rounded-xl mt-10">
            <div className="flex justify-between items-center mb-6">
                <Link href="/" className="text-gray-500 hover:text-orange-600 mb-6 inline-block">
                    &larr; Torna alle ricette
                </Link>

                {/* Bottone Modifica (Solo Autore) */}
                {user && user.uid === recipe.userId && (
                    <Link
                        href={`/dashboard/edit/${recipe.id}`}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                    >
                        ✏️ Modifica
                    </Link>
                )}
            </div>

            {/* Header */}
            <div className="mb-8 border-b pb-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
            ${recipe.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                            recipe.difficulty === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                        {recipe.difficulty}
                    </span>
                </div>
                <p className="text-gray-600 text-lg mt-2">⏱️ Tempo di preparazione: {recipe.time} minuti</p>
            </div>

            {/* Contenuto Principale */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Colonna Sinistra: Info e Descrizione */}
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3 text-orange-600">Descrizione</h2>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {recipe.description}
                        </p>
                    </section>

                    {/* Placeholder per Ingredienti e Step (Prossimi Capitoli) */}
                    {/* Ingredienti e Preparazione */}
                    <div className="space-y-8">
                        {/* Ingredienti */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">🛒 Ingredienti</h3>
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {recipe.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-center text-gray-700 bg-orange-50 p-2 rounded">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">Nessun ingrediente specificato.</p>
                            )}
                        </section>

                        {/* Passaggi */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">👨‍🍳 Preparazione</h3>
                            {recipe.steps && recipe.steps.length > 0 ? (
                                <ol className="space-y-4">
                                    {recipe.steps.map((step, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 font-bold rounded-full">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-700 mt-1">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-gray-500 italic">Nessun passaggio specificato.</p>
                            )}
                        </section>
                    </div>
                </div>

                {/* Colonna Destra: Immagine */}
                <div className="md:col-span-1">
                    {recipe.imageUrl ? (
                        <div className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-4xl shadow-inner">
                            🥘
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
