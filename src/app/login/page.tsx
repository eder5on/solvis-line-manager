"use client";
import React, { useState } from "react";
import { supabase } from "~/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function handleLogin() {
    if (!email) return alert("Informe um email");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      alert("Verifique seu email para login");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded border">
        <h2 className="text-2xl font-semibold mb-4">Entrar</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@exemplo.com"
          className="w-full border rounded px-3 py-2 mb-3"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          Enviar link de login
        </button>
      </div>
    </main>
  );
}
