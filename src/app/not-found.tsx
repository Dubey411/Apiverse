import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
            <div className="max-w-md space-y-4 text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">404</p>
                <h1 className="text-4xl font-semibold">Page not found</h1>
                <p className="text-slate-300">
                    The page you&apos;re looking for doesn&apos;t exist in the client app.
                </p>
                <Link
                    href="/landing-page"
                    className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950"
                >
                    Go to landing page
                </Link>
            </div>
        </main>
    );
}
