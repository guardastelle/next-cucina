"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-orange-600">
                    NextCucina 🍝
                </Link>

                <div className="flex gap-4 items-center">
                    {!loading && (
                        <>
                            {user ? (
                                <>
                                    <Link href="/dashboard" className="hover:text-orange-600 transition">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                    >
                                        Esci
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-orange-600 transition">
                                        Accedi
                                    </Link>
                                    <Link href="/register" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition">
                                        Registrati
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}