"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedCategories = ["Latest Jobs","Admit Card","Results","Answer Key","Exam Date","Scheme","Notice"];
function safeUrl(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try { const u = new URL(raw); return u.protocol === "https:" ? u.toString() : null; } catch { return null; }
}
export async function createNotice(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/admin?error=supabase_not_configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin?error=forbidden");

  const title = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const official_url = safeUrl(formData.get("official_url"));
  const notification_url = safeUrl(formData.get("notification_url"));
  const youtube_url = safeUrl(formData.get("youtube_url"));
  const source_notes = String(formData.get("source_notes") ?? "").trim();
  if (!title || !department || !official_url || !source_notes || !allowedCategories.includes(category)) redirect("/admin?error=invalid_input");
  const start_date = String(formData.get("start_date") ?? "") || null;
  const last_date = String(formData.get("last_date") ?? "") || null;
  if (start_date && last_date && start_date > last_date) redirect("/admin?error=invalid_dates");
  const rawVacancies = String(formData.get("vacancies") ?? "");
  const vacancies = rawVacancies ? Number(rawVacancies) : null;
  if (vacancies !== null && (!Number.isInteger(vacancies) || vacancies < 0)) redirect("/admin?error=invalid_vacancies");

  const verified = formData.get("verified") === "yes";
  const { error } = await supabase.from("notices").insert({
    title, department, category, state_name: String(formData.get("state_name") ?? "").trim() || null,
    qualification: String(formData.get("qualification") ?? "").trim() || null, vacancies,
    start_date, last_date, official_url, notification_url, youtube_url,
    source_notes, status: "draft", created_by: user.id,
    verified_at: verified ? new Date().toISOString() : null
  });
  if (error) redirect("/admin?error=save_failed");
  redirect("/admin?saved=1");
}