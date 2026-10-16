# Sarkari Update Hub — Android फोन से सेटअप

यह शुरुआती Next.js + Supabase प्रोजेक्ट है। इसमें मोबाइल-फ्रेंडली 3D-style homepage, published notice cards, admin login, database role-check और सुरक्षित draft notice submission शामिल हैं। AI source research अभी integration-ready workflow की अगली अवस्था है; API key जोड़ने के बिना AI research को चालू न मानें।

## 1. ZIP खोलें और GitHub पर अपलोड करें
1. ZIP डाउनलोड करके Android के Files app से Extract करें।
2. Chrome में `https://github.com` खोलें और लॉगिन करें।
3. `New repository` दबाएँ। नाम `sarkari-update-hub` रखें। Public या Private चुनें।
4. `Add file` → `Upload files` से इस फ़ोल्डर के सारे files/folders अपलोड करें। `package.json`, `app`, `lib`, `supabase` और `middleware.ts` root पर होने चाहिए।
5. Commit changes दबाएँ।

## 2. Supabase database
1. `https://supabase.com` पर project बनाएँ।
2. Project → SQL Editor → New query खोलें।
3. `supabase/migrations/001_initial.sql` की पूरी सामग्री paste करें और Run दबाएँ।
4. Authentication → Users में अपना admin user email/password से बनाएँ।
5. SQL Editor में नीचे की query चलाएँ (email अपने वास्तविक login email से बदलें):
   ```sql
   insert into public.profiles (id, display_name, role)
   select id, 'Site Admin', 'admin'
   from auth.users
   where email = 'YOUR_ADMIN_EMAIL'
   on conflict (id) do update set role = 'admin';
   ```
6. Project Settings → API में Project URL और anon/public key लें। Service role key कभी भी वेबसाइट के public env में न डालें।

## 3. Vercel deploy
1. `https://vercel.com` खोलें और GitHub से sign in करें।
2. Add New → Project → `sarkari-update-hub` repository Import करें।
3. Framework Next.js auto-detect होना चाहिए।
4. Environment Variables में जोड़ें:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon/public key
5. Deploy दबाएँ। Build fail हो तो Deployments → Build Logs में error देखें।

## 4. Admin login और भर्ती जोड़ना
1. वेबसाइट के `/login` route पर जाएँ और Supabase में बनाया admin email/password डालें।
2. Admin Dashboard में नई भर्ती का नाम, विभाग, श्रेणी, तारीखें, official URL, notification URL और source verification note डालें।
3. रिकॉर्ड अभी draft रहेगा। यह जानबूझकर है: public पर दिखाने से पहले source और fields review करना होगा।
4. किसी record को publish करने के लिए सुरक्षित admin-only publish workflow अगली implementation step में जोड़ें; database में status `published` करने से पहले official notification सत्यापित करें।

## 5. अभी क्या तैयार है / क्या बाकी है
तैयार: responsive homepage, 3D-style category cards, published notices from Supabase, secure role-gated admin route, login form, draft submission, SQL/RLS policies.
बाकी: AI web/PDF research provider integration, admin review/publish controls, full state directory, filters, tutorial metadata lookup, automated broken-link checks, unit tests and production hardening.

## सुरक्षा
- Admin URL छिपा होना सुरक्षा नहीं है; role checks और RLS वास्तविक सुरक्षा हैं।
- API keys, passwords या service-role key GitHub में commit न करें।
- AI द्वारा निकाली गई तारीखों को official PDF से verify किए बिना प्रकाशित न करें।
- यह स्वतंत्र सूचना पोर्टल है; किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।
