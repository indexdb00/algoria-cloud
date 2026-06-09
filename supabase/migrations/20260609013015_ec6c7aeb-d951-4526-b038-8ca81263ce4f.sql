INSERT INTO public.agents
SELECT 'algoria' AS slug, name, description, icon, system_prompt, cost_per_message, created_at FROM public.agents WHERE slug = 'aurevia'
ON CONFLICT (slug) DO NOTHING;
UPDATE public.agents SET name = replace(name, 'Aurevia', 'Algoria'), system_prompt = replace(replace(system_prompt, 'Aurevia', 'Algoria'), 'European founders', 'audiences worldwide') WHERE slug = 'algoria';
UPDATE public.conversations SET agent_slug = 'algoria' WHERE agent_slug = 'aurevia';
DELETE FROM public.agents WHERE slug = 'aurevia';