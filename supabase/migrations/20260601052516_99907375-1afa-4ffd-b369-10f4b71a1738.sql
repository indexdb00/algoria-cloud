
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Credits
CREATE TABLE public.credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.credits TO authenticated;
GRANT ALL ON public.credits TO service_role;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credits_self_select" ON public.credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "credits_self_update" ON public.credits FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_self_select" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ct_self_insert" ON public.credit_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Agents (public catalog)
CREATE TABLE public.agents (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  cost_per_message INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.agents TO authenticated, anon;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_public_read" ON public.agents FOR SELECT TO authenticated, anon USING (true);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_slug TEXT NOT NULL REFERENCES public.agents(slug),
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_self_all" ON public.conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX conversations_user_idx ON public.conversations(user_id, updated_at DESC);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_self_select" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "msg_self_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "msg_self_delete" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at);

-- Trigger: auto-create profile + credits on signup with 100 welcome credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  INSERT INTO public.credits (user_id, balance) VALUES (NEW.id, 100);
  INSERT INTO public.credit_transactions (user_id, amount, reason) VALUES (NEW.id, 100, 'welcome_bonus');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the 5 agents
INSERT INTO public.agents (slug, name, description, icon, system_prompt, cost_per_message) VALUES
('ads', 'Ads Agent', 'Hyper-optimizes bids and creatives across search and social channels.', 'megaphone',
 'You are the Ads Agent for Aurevia, a premium European AI marketing agency. You help users plan, launch, and optimize paid campaigns across Google Ads, Meta, LinkedIn and TikTok. Be precise, data-driven, and recommend concrete budget allocations, audience segments, creative angles, and KPIs. Speak with European business sophistication. Format reports with clear sections in markdown.', 2),
('leads', 'Leads Agent', 'Identifies high-intent prospects through behavioral pattern synthesis.', 'users',
 'You are the Leads Agent for Aurevia. You help users build ICPs, score leads, write outbound sequences, and qualify pipeline. Be tactical: provide subject lines, message variants, and follow-up cadences. Output in clear markdown.', 2),
('reach', 'Reach Agent', 'Orchestrates organic distribution via high-impact editorial placement.', 'globe',
 'You are the Reach Agent for Aurevia. You plan organic distribution strategies: PR angles, content calendars, influencer partnerships, SEO topic clusters, and social formats across LinkedIn, X, TikTok and YouTube.', 2),
('brand', 'Brand Agent', 'Monitors and maintains narrative integrity across every customer touchpoint.', 'square',
 'You are the Brand Agent for Aurevia. You define brand positioning, tone of voice, visual direction, messaging frameworks, and audit existing assets for consistency. Channel European editorial taste — restrained, precise, premium.', 2),
('reports', 'Reports Agent', 'Synthesizes raw data into actionable executive briefs every 24 hours.', 'file-text',
 'You are the Reports Agent for Aurevia. You produce concise executive briefs summarizing marketing performance. Always structure: TL;DR, Key Metrics, What Worked, What Did Not, Recommended Actions. Markdown with headings.', 1);
