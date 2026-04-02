import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state;

  if (!result?.metrics) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
        <section className="w-full rounded-2xl bg-white p-6 text-center shadow-lg sm:p-8">
          <p className="text-gray-700">No result found. Run a test first.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </section>
      </main>
    );
  }

  const { metrics, insights } = result;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
      <section className="w-full rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h2 className="text-2xl font-bold">Analysis Result</h2>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <MetricItem label="URL" value={metrics.url} />
          <MetricItem label="Method" value={metrics.method} />
          <MetricItem label="Total Requests" value={metrics.totalRequests} />
          <MetricItem label="Success Count" value={metrics.successCount} />
          <MetricItem label="Failure Count" value={metrics.failureCount} />
          <MetricItem
            label="Average Response Time"
            value={`${metrics.averageResponseTimeMs} ms`}
          />
          <MetricItem label="Success Rate" value={`${metrics.successRate}%`} />
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-base font-semibold text-blue-900">AI Insights</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-900">
            {Array.isArray(insights) && insights.length > 0 ? (
              insights.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
            ) : (
              <li>No insights available.</li>
            )}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-black"
        >
          Run Another Test
        </button>
      </section>
    </main>
  );
}

function MetricItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
