import { Link, Route, Routes } from 'react-router';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentPage } from './pages/DocumentPage';

export function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="bg-indigo-600 px-6 py-4 text-white">
                <Link to="/" className="text-lg font-bold">Paperless Rest DMS</Link>
            </header>

            <main className="mx-auto max-w-5xl p-6">
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/documents/:id" element={<DocumentPage />} />
                    <Route path="*" element={<p>Page not found.</p>} />
                </Routes>
            </main>
        </div>
    );
}
