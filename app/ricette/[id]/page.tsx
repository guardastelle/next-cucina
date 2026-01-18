"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Recipe } from "@/types/recipe";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RecipeDetailPage() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [servings, setServings] = useState(1);
    const [unit, setUnit] = useState<'Metric' | 'US'>('Metric');

    useEffect(() => {
        if (!id) return;

        const fetchRecipe = async () => {
            try {
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
            <div className="flex justify-center items-center min-h-screen bg-[#F3F7F2]">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center mt-20">
                <h1 className="text-2xl font-bold text-gray-800">Ricetta non trovata 😢</h1>
                <Link href="/" className="text-green-600 hover:underline mt-4 block">
                    Torna alla Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Top Navigation / Breadcrumbs (Optional) */}
            <div className="mb-6 flex justify-between items-center">
                <Link href="/" className="text-gray-500 hover:text-green-700 transition flex items-center gap-2">
                    &larr; Indietro
                </Link>

                {user && user.uid === recipe.userId && (
                    <Link
                        href={`/dashboard/edit/${recipe.id}`}
                        className="bg-white text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition font-medium flex items-center gap-2"
                    >
                        ✏️ Modifica
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Ingredients */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
                            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-semibold">
                                <button
                                    onClick={() => setUnit('Metric')}
                                    className={`px-3 py-1 rounded-md transition ${unit === 'Metric' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500'}`}>
                                    Metric
                                </button>
                                <button
                                    onClick={() => setUnit('US')}
                                    className={`px-3 py-1 rounded-md transition ${unit === 'US' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500'}`}>
                                    US
                                </button>
                            </div>
                        </div>

                        {/* Servings Control */}
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                            <span className="text-green-700 font-medium">{servings} serving{servings > 1 ? 's' : ''}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setServings(Math.max(1, servings - 1))}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => setServings(servings + 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Review Ingredients List */}
                        <div className="space-y-6">
                            {/* Assuming flat list for now, we can group later if data allows */}
                            <div>
                                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                    <ul className="space-y-4">
                                        {recipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xs">
                                                        {/* Generic icon if we don't have ingredient types */}
                                                        🍃
                                                    </div>
                                                    <span className="text-gray-700 font-medium group-hover:text-green-700 transition">{ing}</span>
                                                </div>
                                                {/* Placeholder for quantity if it was separated */}
                                                {/* <span className="font-bold text-gray-900">10g</span> */}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">No ingredients listed.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Hero & Directions */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white min-h-[400px]">
                        {recipe.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="w-full h-[400px] object-cover"
                            />
                        ) : (
                            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center text-6xl">
                                🥘
                            </div>
                        )}

                        {/* Float Overlays */}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                            <span className="text-yellow-500">★</span>
                            <span className="font-bold text-gray-800 text-sm">4.9</span>
                        </div>

                        <div className="absolute top-6 right-6 flex gap-2">
                            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition">
                                <span className="text-gray-600">🔗</span>
                            </button>
                            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition">
                                <span className="text-red-500">❤</span>
                            </button>
                        </div>

                        {/* Title Card Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                            <p className="text-gray-600 line-clamp-2">{recipe.description}</p>
                        </div>
                    </div>

                    {/* Info Row (Level, Time) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                📊
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Level</p>
                                <p className="font-semibold text-gray-900 capitalize">{recipe.difficulty}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                ⏰
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Preparation time</p>
                                <p className="font-semibold text-gray-900">{recipe.time} min</p>
                            </div>
                        </div>
                    </div>

                    {/* Directions */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Directions</h2>

                        {recipe.steps && recipe.steps.length > 0 ? (
                            <div className="space-y-8">
                                {recipe.steps.map((step, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex-shrink-0">
                                            {/* Number or Checkbox */}
                                            {/* <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold group-hover:border-green-500 group-hover:text-green-600 transition">
                                        {i + 1}
                                    </div> */}
                                            {/* Simple Header style */}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{i + 1}. Step</h3>
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="text-gray-700 leading-relaxed">{step}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No steps available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
