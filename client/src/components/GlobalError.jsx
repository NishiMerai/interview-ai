import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

export default function GlobalError() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-black mb-4">Oops! Something went wrong.</h1>
      <p className="text-slate-500 mb-8">
        {error?.status === 404
          ? "The page you are looking for doesn't exist."
          : error?.statusText || error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => navigate('/app/dashboard')}
        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
