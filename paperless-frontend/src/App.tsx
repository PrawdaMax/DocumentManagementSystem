import { useState } from 'react';
import { Link, Route, Routes } from 'react-router';
import { UserNameForm } from './components/UserNameForm';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentPage } from './pages/DocumentPage';
import { getUserName, saveUserName } from './userName';

export function App() {
    const [userName, setUserName] = useState(getUserName());
    const [nameFormOpen, setNameFormOpen] = useState(false);

    function changeUserName(name: string) {
        saveUserName(name);
        setUserName(name);
        setNameFormOpen(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="flex items-center justify-between gap-4 bg-indigo-600 px-6 py-4 text-white">
                <Link to="/" className="text-lg font-bold">Paperless DMS</Link>
                <button onClick={() => setNameFormOpen(true)} className="text-sm hover:underline">
                    {userName ? `Your name: ${userName}` : 'Set your name'}
                </button>
            </header>

            <main className="mx-auto max-w-5xl p-6">
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/documents/:id" element={<DocumentPage />} />
                    <Route path="*" element={<p>Page not found.</p>} />
                </Routes>
            </main>

            {nameFormOpen && (
                <UserNameForm name={userName} onSave={changeUserName} onCancel={() => setNameFormOpen(false)} />
            )}
        </div>
    );
}
