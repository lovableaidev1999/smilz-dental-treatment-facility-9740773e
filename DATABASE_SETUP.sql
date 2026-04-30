-- ============================================================
-- SMILZ CMS - Database Setup Script
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('general', '{"clinic_name": "Smilz Dental Treatment Facility", "tagline": "Bridging Gaps... Spreading Smiles!", "doctor_name": "Dr. Dibyendu Dutta", "year_established": 1999, "google_rating": 4.8, "review_count": 44}'),
  ('contact', '{"address": "21, Garia Park, Kolkata 700084", "address_full": "21, Garia Park, Garia Park Buddha Temple, Garia, South Kolkata 700084", "phone": "8961775554", "phone_formatted": "8961 77 5554", "emergency": "9831070248", "email": "dr.d.dutta@gmail.com", "whatsapp": "918961775554"}'),
  ('hours', '{"morning": "9:00 AM – 1:00 PM", "evening": "5:00 PM – 9:00 PM", "days": "Monday – Saturday", "closed": "Sunday"}'),
  ('links', '{"website": "https://www.smilz.net", "google_maps_url": "https://maps.google.com/?cid=5056757662094737709", "facebook": "", "instagram": "", "youtube": ""}'),
  ('seo', '{"default_title": "Best Dental Clinic in Garia, South Kolkata", "default_description": "Smilz Dental Treatment Facility - Trusted dental clinic in Garia Park, Kolkata since 1999.", "default_keywords": "dental clinic Garia Kolkata, dentist South Kolkata"}'),
  ('appearance', '{"font_family": "Poppins", "logo_url": "", "default_banner_image": "", "footer_text": ""}'),
  ('coordinates', '{"lat": 22.4625, "lng": 88.3942}')
ON CONFLICT (key) DO NOTHING;


-- 2. PAGE CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_id text NOT NULL,
  section_title text,
  heading text,
  subheading text,
  body_text text,
  image_url text,
  button_text text,
  button_link text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_name, section_id)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page_content"
  ON public.page_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Auth can manage page_content"
  ON public.page_content FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);


-- 2B. VISUAL PAGE LAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.page_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL UNIQUE,
  page_title text NOT NULL,
  layout_json jsonb NOT NULL DEFAULT '[]',
  is_published boolean DEFAULT false,
  is_template boolean DEFAULT false,
  template_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_layouts' AND policyname='Anyone can read published page_layouts') THEN
    CREATE POLICY "Anyone can read published page_layouts"
      ON public.page_layouts FOR SELECT
      TO anon, authenticated
      USING (is_published = true OR auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_layouts' AND policyname='Auth can manage page_layouts') THEN
    CREATE POLICY "Auth can manage page_layouts"
      ON public.page_layouts FOR ALL
      TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed home page sections
INSERT INTO public.page_content (page_name, section_id, section_title, heading, subheading, body_text, button_text, button_link, sort_order) VALUES
  ('home', 'hero', 'Hero Section', 'Your Trusted Dental Partner in South Kolkata', 'Comprehensive, affordable dental care since 1999. From routine check-ups to advanced treatments, we deliver exceptional results with a gentle touch.', NULL, 'Book Appointment', '/contact', 1),
  ('home', 'services', 'Services Section', 'Comprehensive Dental Services', 'From preventive care to advanced procedures, we provide complete dental solutions for your entire family.', 'What We Offer', NULL, '/services', 2),
  ('home', 'about', 'About Preview', 'Your Trusted Dental Partner Since 1999', NULL, 'Located at 21, Garia Park, South Kolkata, Smilz Dental Treatment Facility has been a trusted name in dental care for over 25 years.', 'Learn More About Us', '/about', 3),
  ('home', 'reviews', 'Reviews Section', 'What Our Patients Say', 'Patient Testimonials', NULL, NULL, NULL, 4),
  ('home', 'cta', 'CTA Section', 'Ready for a Healthier Smile?', 'Book your appointment today and experience the Smilz difference. Walk-ins welcome, appointments preferred.', NULL, 'Book on WhatsApp', NULL, 5),
  ('about', 'hero', 'Hero', 'About Us', 'Over 25 years of dedicated dental care in the heart of Garia, South Kolkata.', NULL, NULL, NULL, 1),
  ('about', 'doctor', 'Doctor Section', 'Meet Dr. Dibyendu Dutta', NULL, 'With over 25 years of experience in dentistry, Dr. Dibyendu Dutta founded Smilz Dental Treatment Facility in 1999 with a vision to provide accessible, honest, and high-quality dental care to the community of South Kolkata.', NULL, NULL, 2),
  ('about', 'cta', 'Call to Action', 'Ready for a Healthier Smile?', 'Book your appointment today and experience the Smilz difference. Walk-ins welcome, appointments preferred.', NULL, 'Book Appointment', '/contact', 3),
  ('contact', 'hero', 'Hero', 'Contact Us', 'We''d love to hear from you. Book an appointment or reach out with any questions.', NULL, NULL, NULL, 1),
  ('services', 'hero', 'Hero', 'Our Dental Services', 'Complete dental solutions for all your needs — from routine care to advanced procedures, delivered with precision and care.', NULL, NULL, NULL, 1),
  ('gallery', 'hero', 'Hero', 'Treatment Gallery', 'Real results from real patients. See the transformations we deliver every day.', NULL, NULL, NULL, 1),
  ('blog', 'hero', 'Hero', 'Dental Insights', 'Expert articles on oral health, dental procedures, and wellness tips from our team.', NULL, NULL, NULL, 1)
ON CONFLICT (page_name, section_id) DO NOTHING;


-- 3. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'image',
  alt_text text DEFAULT '',
  folder text DEFAULT 'general',
  file_size integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media_library"
  ON public.media_library FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Auth can manage media_library"
  ON public.media_library FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);


-- 4. ADD MISSING COLUMNS TO SERVICES (if not present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='featured_image') THEN
    ALTER TABLE public.services ADD COLUMN featured_image text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='seo_title') THEN
    ALTER TABLE public.services ADD COLUMN seo_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='seo_description') THEN
    ALTER TABLE public.services ADD COLUMN seo_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='is_featured') THEN
    ALTER TABLE public.services ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Ensure services has proper RLS for admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Auth can manage services') THEN
    CREATE POLICY "Auth can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Ensure blog_posts has proper RLS for admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='visual_layout_json') THEN
    ALTER TABLE public.blog_posts ADD COLUMN visual_layout_json jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Auth can manage blog_posts') THEN
    CREATE POLICY "Auth can manage blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Ensure gallery has proper RLS for admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery' AND policyname='Auth can manage gallery') THEN
    CREATE POLICY "Auth can manage gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;


-- 5. STORAGE BUCKET FOR MEDIA
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

-- Allow authenticated upload
CREATE POLICY "Auth upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow authenticated delete
CREATE POLICY "Auth delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');


-- 6. REVIEWS TABLE (to make reviews dynamic)
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

CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth can manage reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed existing reviews
INSERT INTO public.reviews (name, date, text, rating, sort_order) VALUES
  ('Nazmul Islam', 'Dec 2025', 'Amazing feeling, everything was good, especially sir''s sincerity impressed me, I am most happy that my tooth gap is completely gone now, it looks completely natural, thank you sir', 5, 1),
  ('Suraj Sharma', 'Jun 2025', 'I was experiencing pain in my incisor tooth and was quite worried about it. He handled the procedure very gently, and to my surprise, it was almost painless. His clinic is well-equipped with the latest technology.', 5, 2),
  ('Sujoy Chakraborty', 'May 2025', 'Very good treatment done by the doctor. The doctor and the other staff member is very attentive, caring and professional. Great clinic. Highly recommend.', 5, 3),
  ('Partha Pratim Chanda', 'Mar 2025', 'One gem of a person... With experience of more than 25 years, he has been a saviour for me. I am beyond impressed with Dr. Dibyendu Dutta. The extraction was quick and painless!', 5, 4),
  ('Jayeeta Sarkar', 'Apr 2025', 'My whole family has been taking service from here for more than a decade now. Excellent service. Doctor''s behaviour is so friendly. All the equipments are of new age technology.', 5, 5),
  ('Mousumi Bhaumick', 'Mar 2025', 'An amazing experience all the time we visit him for an appointment. He takes very good care of my 85 year old mother. I can not think of visiting anyone else for any dental issue.', 5, 6)
ON CONFLICT DO NOTHING;


-- ============================================================
-- DONE! Now create an admin user:
-- Go to Authentication > Users > Add User
-- Email: your-admin@email.com / Password: your-secure-password
-- ============================================================

-- Seed referral page hero content
INSERT INTO public.page_content
  (page_name, section_id, section_title, heading, subheading, sort_order, is_active)
VALUES
  ('referral', 'hero', 'Hero',
   'Smilz Referral',
   'Refer a friend or family member to Smilz Dental Treatment Facility.',
   1, true)
ON CONFLICT (page_name, section_id) DO NOTHING;
