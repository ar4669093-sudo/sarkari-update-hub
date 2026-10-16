 "use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
export default function LoginForm({ next }: { next: string }) {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const supabase = createClient();
    if (!supabase) { setError("Supabase environment variables सेट नहीं हैं।"); setBusy(false); return; }
    const { error } = await supabase.auth.signInWithPassword({email,password});
    if (error) { setError("लॉगिन नहीं हुआ। ईमेल/पासवर्ड जाँचें।"); setBusy(false); return; }
    window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
  }
  return <form className="admin-form" onSubmit={submit}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="form-error">{error}</p>}<button disabled={busy}>{busy?"लॉगिन हो रहा है…":"Login"}</button></form>;
}