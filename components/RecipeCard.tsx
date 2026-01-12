import { Recipe } from "@/types/recipe";
import Link from "next/link";

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            {/* Immagine */}
            <div className="h-48 bg-orange-100 relative">
                {recipe.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-400">
                        <span className="text-4xl">🥘</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{recipe.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>🕒 {recipe.time} min</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
            ${recipe.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                            recipe.difficulty === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                        {recipe.difficulty}
                    </span>
                </div>

                <Link
                    href={`/ricette/${recipe.id}`}
                    className="block w-full text-center bg-orange-50 text-orange-600 font-medium py-2 rounded hover:bg-orange-100 transition"
                >
                    Leggi Ricetta
                </Link>
            </div>
        </div>
    );
}
