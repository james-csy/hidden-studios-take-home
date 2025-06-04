# **Take‑Home Assignment**

**Full‑Stack User‑Profile Management with Supabase \+ Fortnite.gg Insights**

_Feel free to use your own creative solution or alternative stack if you think it yields a better result. The tech below is a suggested baseline, show us the best outcome you can deliver._

## **Overview**

You will build a small, self‑contained full‑stack application that demonstrates web fundamentals **plus** the ability to wrangle an external, unofficial data source. Your app must:

1. **Authenticate users** with Supabase.

2. **Persist profile data** in Supabase Postgres (no other DB).

3. Expose protected **REST endpoints** for reading/updating the profile (Next.js 14 API routes).

4. Deliver a minimal **dashboard UI** where users sign in, view, and edit their profile.

5. **Fetch & display live Fortnite.gg map statistics** for _any_ creative map code the user enters.

6. **Predict the next 30 days** of that map’s player metric and show the forecast.

When we clone the repo, set env vars, and run `npm run dev`, we should be able to:

- Register or sign in (magic link or OAuth is fine).

- Go to `/dashboard`, update our profile, and save.

- Enter a Fortnite map code, see recent stats \+ your forecast rendered in any format you choose.

## **Goals & Learning Outcomes**

- Bootstrap a **Next.js 14 / TypeScript** project.

- Integrate **Supabase auth** on client & server.

- Design a Supabase **Postgres table** with **row‑level security (RLS)**.

- Implement secure REST API routes.

- Build a reactive dashboard UI.

- **Acquire unstructured external data** (Fortnite.gg) & handle lack of official API.

- **Model and forecast time‑series data** with justified technique.

## **Starter Guidelines**

### **Project setup**

```
npx create-next-app@latest user-profile-app --typescript --app --src-dir --tailwind
cd user-profile-app
npm install @supabase/supabase-js
```

### **Environment variables (`.env.local`)**

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### **Utilities**

- `_lib/supabaseServer.ts` – returns a Supabase **server** client via `createServerClient`.

- `_lib/supabaseBrowser.ts` – exports a singleton Supabase **browser** client.

## **Back‑End Tasks**

### **1\. Supabase Schema**

```
create table public.profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  bio text check (char_length(bio) <= 200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can select their own profile" on public.profiles
  for select using ( auth.uid() = id );
create policy "Users can insert/update their own profile" on public.profiles
  for all using ( auth.uid() = id );
```

### **2\. API Routes (`src/app/api/profile/route.ts`)**

- **GET** – fetch caller’s profile; respond **404** if absent.

- **PUT** – upsert `{ displayName?, bio? }`; validate bio ≤ 200 chars.

Return codes:

| Scenario         | Code |
| :--------------- | :--- |
| Validation error | 400  |
| Unauthenticated  | 401  |
| Not found        | 404  |
| Server error     | 500  |

### **3\. Dashboard (`/dashboard`)**

- Redirect unauthenticated users to `/login`.

- CRUD profile as described.

- Simple Tailwind styling.

### **4\. Fortnite.gg Insights Module**

- **Data source:** Creative map stats live at [https://fortnite.gg/creative](https://fortnite.gg/creative). An individual map’s page looks like [https://fortnite.gg/island?code=6155-1398-4059](https://fortnite.gg/island?code=6155-1398-4059) — focus on the **Players right now** figure.

- Provide an input for **any Fortnite map code**.

- Fetch the **current player count** plus the **last 30 days** of daily counts, if available. Fetching this may involve using different scraping techniques or finding Fortnite.gg's Hidden APIs, document how you obtained the data.

- Display the historical data in any visual or tabular form of your choosing.

- **Forecast** the next **30 days** of that metric with an algorithm of your choice and show the prediction alongside history.

- If Fortnite.gg does not expose full history, explain why and simulate a plausible series from whatever datapoints you can capture, clearly labeling it as synthetic.

### **5\. Public Pages**

- `/login` – sign‑in / sign‑up or magic‑link.

- Optional landing page `/` linking to dashboard.

## **Deliverables**

- **GitHub repo** with:

  - Source code (API, dashboard, Fortnite module).

  - **README.md** containing:

    - Setup & run steps (env vars included)

    - Your approach & assumptions (≤ 2 paragraphs)

    - A short note on data‑collection and forecasting technique

## **Submission & Timing**

Push your repo and share the link with the Discord group chat.

If your submission is great, you will move on to the next round which is a paid trial period with our team.

Happy building\!
