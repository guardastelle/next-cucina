import { Recipe } from "@/types/recipe";
import Link from "next/link";

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link
            href={`/ricette/${recipe.id}`}
            className="block group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Immagine */}
            <div className="h-64 bg-gray-100 relative overflow-hidden">
                {recipe.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-5xl">🥘</span>
                    </div>
                )}

                {/* Floating Rating Badge (Mock) */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-xs font-bold text-gray-800">
                    <span className="text-yellow-500">★</span> 4.9
                </div>

                {/* Floating Like Button */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ❤
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition leading-tight">
                        {recipe.title}
                    </h3>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                    {recipe.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <span>⏰</span>
                        <span className="font-medium">{recipe.time} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>📊</span>
                        <span className="capitalize font-medium">{recipe.difficulty}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
