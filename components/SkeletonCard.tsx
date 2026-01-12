export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Immagine Skeleton */}
            <div className="h-48 bg-gray-300"></div>

            <div className="p-4 space-y-3">
                {/* Titolo */}
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                {/* Descrizione (2 righe) */}
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>

                {/* Meta info e bottone */}
                <div className="flex justify-between items-center pt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );
}
