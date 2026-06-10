REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_ticket_protocol() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_ticket_on_message() FROM PUBLIC, anon, authenticated;