
-- Update handle_new_user to grant 50 welcome credits instead of 100
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  INSERT INTO public.credits (user_id, balance) VALUES (NEW.id, 50);
  INSERT INTO public.credit_transactions (user_id, amount, reason) VALUES (NEW.id, 50, 'welcome_bonus');
  RETURN NEW;
END;
$$;

-- Daily credits function (5/day)
CREATE OR REPLACE FUNCTION public.grant_daily_credits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  last_grant timestamptz;
  new_balance integer;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;
  SELECT MAX(created_at) INTO last_grant
    FROM public.credit_transactions
    WHERE user_id = uid AND reason = 'daily_grant';
  IF last_grant IS NOT NULL AND last_grant > now() - interval '24 hours' THEN
    SELECT balance INTO new_balance FROM public.credits WHERE user_id = uid;
    RETURN COALESCE(new_balance, 0);
  END IF;
  UPDATE public.credits SET balance = balance + 5, updated_at = now() WHERE user_id = uid
    RETURNING balance INTO new_balance;
  IF new_balance IS NULL THEN
    INSERT INTO public.credits (user_id, balance) VALUES (uid, 5) RETURNING balance INTO new_balance;
  END IF;
  INSERT INTO public.credit_transactions (user_id, amount, reason) VALUES (uid, 5, 'daily_grant');
  RETURN new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_daily_credits() TO authenticated;

-- Support tickets sequence (for protocol numbering)
CREATE SEQUENCE IF NOT EXISTS public.support_ticket_seq START 1;

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  protocol text NOT NULL UNIQUE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY st_user_select ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY st_user_insert ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY st_user_update ON public.support_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_ticket_protocol()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'AUR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.support_ticket_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_protocol BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_ticket_protocol();

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','admin')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY sm_select ON public.support_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id
              AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY sm_insert ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id
              AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE OR REPLACE FUNCTION public.bump_ticket_on_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_tickets
    SET last_message_at = now(), updated_at = now(),
        status = CASE WHEN NEW.role = 'admin' THEN 'pending' ELSE 'open' END
    WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_ticket AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_ticket_on_message();

-- Grant admin role to index.db00@gmail.com if user exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'index.db00@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
