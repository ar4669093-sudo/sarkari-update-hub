import { BriefcaseBusiness, CalendarCheck, ClipboardCheck, GraduationCap, Landmark, Search, Bell, FileText, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Job = {
  id: string; title: string; department: string; state_name: string | null;
  category: string; qualification: string | null; vacancies: number | null;
  start_date: string | null; last_date: string | null; official_url: string | null;
  notification_url: string | null; status: string; verified_at: string | null;
};

const categories = [
  { label: "Latest Jobs", hi: "नई भर्ती", icon: BriefcaseBusiness, color: "blue" },
  { label: "Admit Card", hi: "एडमिट कार्ड", icon: CalendarCheck, color: "green" },
  { label: "Results", hi: "रिजल्ट", icon: ClipboardCheck, color: "purple" },
  { label: "Exam Calendar", hi: "परीक्षा कैलेंडर", icon: GraduationCap, color: "orange" },
];

function dateText(value: string | null) {
  if (!value) return "अभी घोषित नहीं";
  return new Date(value + "T00:00:00").toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function Home() {
  let jobs: Job[] = [];
  let connected = false;
  try {
    const supabase = await createClient();
    if (supabase) {
      connected = true;
      const { data } = await supabase.from("notices").select("id,title,department,state_name,category,qualification,vacancies,start_date,last_date,official_url,notification_url,status,verified_at")
        .eq("status", "published").order("created_at", { ascending: false }).limit(12);
      jobs = (data ?? []) as Job[];
    }
  } catch { /* Show friendly setup state until Supabase is configured. */ }

  return <main>
    <header className="topbar">
      <a className="brand" href="/" aria-label="Sarkari Update Hub home"><span className="brand-icon"><Landmark size={23}/></span><span><strong>Sarkari Update Hub</strong><small>सरकारी नौकरी • परीक्षा • रिजल्ट</small></span></a>
      <nav><a href="#jobs">Latest Jobs</a><a href="#categories">Admit Card</a><a href="#states">State Wise</a><a className="admin-link" href="/admin">Admin Login <ArrowUpRight size={15}/></a></nav>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="live-dot"/> भारत की भर्ती जानकारी एक जगह</span>
        <h1>आपकी सरकारी नौकरी की <em>नई शुरुआत।</em></h1>
        <p>सरकारी भर्ती, एडमिट कार्ड, परीक्षा तिथि और रिजल्ट की जानकारी — स्पष्ट तारीखों और आधिकारिक स्रोतों के साथ।</p>
        <form action="#jobs" className="searchbox"><Search size={20}/><input name="q" placeholder="नौकरी, विभाग या राज्य खोजें..." aria-label="नौकरी खोजें"/><button>खोजें</button></form>
        <div className="hero-note"><ShieldCheck size={16}/> आवेदन करने से पहले आधिकारिक नोटिफिकेशन जाँचें</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="floating-card card-back"><FileText size={24}/><span>Official Notice</span><b>PDF</b></div>
        <div className="floating-card card-front"><div className="mini-emblem"><Landmark size={36}/></div><span>CAREER UPDATE</span><strong>आपका अगला कदम</strong><small>तैयारी आज से शुरू करें</small><div className="progress"><i/></div></div>
        <div className="float-chip"><CalendarCheck size={17}/> Last Date Reminder</div>
      </div>
    </section>
    <section className="stats-strip"><div><strong>All India</strong><span>केंद्र + सभी राज्य</span></div><div><strong>Verified Sources</strong><span>आधिकारिक लिंक प्राथमिकता</span></div><div><strong>Free Access</strong><span>उम्मीदवारों के लिए</span></div></section>
    <section className="section" id="categories">
      <div className="section-heading"><div><span className="eyebrow">EXPLORE UPDATES</span><h2>आपको क्या देखना है?</h2><p>एक टैप में जरूरी जानकारी तक पहुँचें।</p></div><a href="#jobs" className="text-link">सभी अपडेट <ArrowUpRight size={16}/></a></div>
      <div className="category-grid">{categories.map((c, i) => { const Icon = c.icon; return <a href="#jobs" className={`category-card ${c.color}`} key={c.label} style={{animationDelay:`${i*80}ms`}}><span className="cat-icon"><Icon size={25}/></span><span className="cat-en">{c.label}</span><strong>{c.hi}</strong><span className="cat-arrow"><ArrowUpRight size={17}/></span></a>})}</div>
    </section>
    <section className="section jobs-section" id="jobs">
      <div className="section-heading"><div><span className="eyebrow">FRESH OPPORTUNITIES</span><h2>नवीनतम अपडेट</h2><p>आवेदन करने से पहले तारीख और नोटिफिकेशन जरूर जाँचें।</p></div><span className="count-pill">{jobs.length} अपडेट</span></div>
      {!connected && <div className="setup-alert"><ShieldCheck size={21}/><div><strong>वेबसाइट का शुरुआती डिज़ाइन तैयार है</strong><p>लाइव भर्ती डेटा दिखाने के लिए Supabase project बनाकर SQL चलाएँ और environment variables सेट करें। अभी कोई नकली भर्ती नहीं दिखाई जा रही।</p></div></div>}
      {connected && jobs.length === 0 && <div className="empty-state"><FileText size={32}/><strong>अभी कोई प्रकाशित अपडेट नहीं है</strong><p>Admin Panel में सत्यापित भर्ती जोड़कर प्रकाशित करें।</p></div>}
      <div className="job-grid">{jobs.map(job => <article className="job-card" key={job.id}><div className="job-card-top"><span className={`status ${job.last_date && job.last_date < new Date().toISOString().slice(0,10) ? "closed" : "open"}`}>{job.last_date && job.last_date < new Date().toISOString().slice(0,10) ? "समय सीमा समाप्त" : "जानकारी देखें"}</span><span className="job-category">{job.category}</span></div><h3>{job.title}</h3><p className="department">{job.department}{job.state_name ? ` • ${job.state_name}` : ""}</p><div className="job-meta"><div><small>योग्यता</small><b>{job.qualification || "नोटिफिकेशन देखें"}</b></div><div><small>कुल पद</small><b>{job.vacancies ?? "घोषित नहीं"}</b></div></div><div className="date-row"><div><small>आवेदन शुरू</small><b>{dateText(job.start_date)}</b></div><div><small>अंतिम तारीख</small><b>{dateText(job.last_date)}</b></div></div><div className="card-actions">{job.notification_url && <a href={job.notification_url} target="_blank" rel="noreferrer">नोटिफिकेशन <ArrowUpRight size={15}/></a>}{job.official_url && <a className="apply-btn" href={job.official_url} target="_blank" rel="noreferrer">आधिकारिक लिंक <ArrowUpRight size={15}/></a>}</div><div className="verified"><ShieldCheck size={14}/> {job.verified_at ? `स्रोत जाँचा: ${dateText(job.verified_at.slice(0,10))}` : "स्रोत सत्यापन स्थिति देखें"}</div></article>)}</div>
    </section>
    <section className="section state-section" id="states"><div className="section-heading"><div><span className="eyebrow">STATE-WISE DISCOVERY</span><h2>राज्यवार सरकारी भर्ती</h2><p>अपने राज्य की नौकरियाँ और परीक्षाएँ खोजें।</p></div></div><div className="state-chips">{["बिहार","उत्तर प्रदेश","राजस्थान","मध्य प्रदेश","झारखंड","दिल्ली","महाराष्ट्र","पश्चिम बंगाल","हरियाणा","पंजाब","गुजरात","सभी राज्य"].map(s=><a href="#jobs" key={s}><MapPin size={14}/>{s}</a>)}</div></section>
    <footer><div className="footer-brand"><Landmark size={22}/><strong>Sarkari Update Hub</strong></div><p>यह एक स्वतंत्र सूचना पोर्टल है, किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं। अंतिम निर्णय से पहले संबंधित विभाग का आधिकारिक विज्ञापन देखें।</p><div className="footer-links"><a href="/privacy">Privacy</a><a href="/disclaimer">Disclaimer</a><a href="/contact">Contact</a><a href="/admin">Admin</a></div><small>© {new Date().getFullYear()} Sarkari Update Hub</small></footer>
    <div className="mobile-nav"><a href="/">⌂<span>Home</span></a><a href="#jobs">▤<span>Jobs</span></a><a href="#categories">◷<span>Exam</span></a><a href="#states">⌖<span>States</span></a></div>
  </main>;
}