-- Restrict non-admins from toggling profiles.is_demo
CREATE OR REPLACE FUNCTION public.prevent_non_admin_is_demo_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_demo IS DISTINCT FROM OLD.is_demo AND NOT public.is_admin_user() THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar o modo demo.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prevent_non_admin_is_demo_change'
  ) THEN
    CREATE TRIGGER trg_prevent_non_admin_is_demo_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_non_admin_is_demo_change();
  END IF;
END $$;