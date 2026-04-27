-- Ensure reviews table exists (idempotent) and add fields needed for Google sync
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date text,
  text text NOT NULL,
  rating integer DEFAULT 5,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS google_review_id text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS profile_photo_url text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_time timestamptz;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS reviews_google_review_id_key
  ON public.reviews (google_review_id)
  WHERE google_review_id IS NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Anyone can read reviews') THEN
    CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Auth can manage reviews') THEN
    CREATE POLICY "Auth can manage reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
