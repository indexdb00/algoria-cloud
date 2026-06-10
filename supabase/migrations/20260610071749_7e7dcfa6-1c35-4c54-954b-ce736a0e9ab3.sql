CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  INSERT INTO public.credits (user_id, balance) VALUES (NEW.id, 100);
  INSERT INTO public.credit_transactions (user_id, amount, reason) VALUES (NEW.id, 100, 'welcome_bonus');
  RETURN NEW;
END;
$function$;