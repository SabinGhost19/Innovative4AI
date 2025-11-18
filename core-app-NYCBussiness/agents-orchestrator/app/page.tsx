export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">🤖 Agents Orchestrator</h1>
                <p className="text-xl text-gray-600 mb-8">
                    AI-Powered Business Recommendation Service
                </p>
                <div className="bg-gray-100 p-6 rounded-lg text-left max-w-2xl">
                    <h2 className="text-2xl font-semibold mb-4">API Endpoint:</h2>
                    <code className="block bg-white p-4 rounded mb-4">
                        POST /api/recommend-business
                    </code>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p>✅ 3 AI Agents running in parallel</p>
                        <p>✅ Claude 3.5 Sonnet powered</p>
                        <p>✅ Structured outputs with Zod validation</p>
                        <p>✅ Census data-driven recommendations</p>
                    </div>
                </div>
                <div className="mt-8">
                    <a
                        href="/api/recommend-business"
                        className="text-blue-600 hover:underline"
                    >
                        View API Documentation →
                    </a>
                </div>
            </div>
        </main>
    );
}
