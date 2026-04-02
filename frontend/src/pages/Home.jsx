import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [requestCount, setRequestCount] = useState(5);
  const [postBody, setPostBody] = useState("{\n  \"title\": \"test\"\n}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let parsedPostBody;

      if (method === "POST") {
        const trimmedBody = postBody.trim();

        if (trimmedBody) {
          try {
            parsedPostBody = JSON.parse(trimmedBody);
          } catch {
            throw new Error("POST body must be valid JSON");
          }

          if (
            typeof parsedPostBody !== "object" ||
            parsedPostBody === null ||
            Array.isArray(parsedPostBody)
          ) {
            throw new Error("POST body must be a JSON object");
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          method,
          requestCount: Number(requestCount),
          ...(method === "POST" ? { postBody: parsedPostBody || {} } : {})
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      navigate("/result", { state: data });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
      <section className="w-full rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Smart API Performance Analyzer</h1>
        <p className="mt-2 text-sm text-gray-600">
          Test an API quickly and get simple AI insights.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="url">
              API URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://jsonplaceholder.typicode.com/posts"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-200 focus:ring"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="method">
                Request Type
              </label>
              <select
                id="method"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-200 focus:ring"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="count">
                Number of Requests
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="100"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-blue-200 focus:ring"
                value={requestCount}
                onChange={(event) => setRequestCount(event.target.value)}
                required
              />
            </div>
          </div>

          {method === "POST" ? (
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="postBody">
                POST JSON Body (optional)
              </label>
              <textarea
                id="postBody"
                rows="6"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none ring-blue-200 focus:ring"
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
                placeholder='{"title":"test"}'
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </form>
      </section>
    </main>
  );
}
