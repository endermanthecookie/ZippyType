-- 1. Create zippyprocount table
CREATE TABLE IF NOT EXISTS public.zippyprocount (
  id INT PRIMARY KEY DEFAULT 1,
  count INT8 DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 2. Initialize with 0 if not exists
INSERT INTO public.zippyprocount (id, count)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Trigger function to update count based on zippypro activity
CREATE OR REPLACE FUNCTION update_zippy_pro_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.is_active = TRUE) THEN
      UPDATE public.zippyprocount SET count = count + 1 WHERE id = 1;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.is_active = FALSE AND NEW.is_active = TRUE) THEN
      UPDATE public.zippyprocount SET count = count + 1 WHERE id = 1;
    ELSIF (OLD.is_active = TRUE AND NEW.is_active = FALSE) THEN
      UPDATE public.zippyprocount SET count = count - 1 WHERE id = 1;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.is_active = TRUE) THEN
      UPDATE public.zippyprocount SET count = count - 1 WHERE id = 1;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger
DROP TRIGGER IF EXISTS tr_update_zippy_pro_count ON public.zippypro;
CREATE TRIGGER tr_update_zippy_pro_count
AFTER INSERT OR UPDATE OR DELETE ON public.zippypro
FOR EACH ROW EXECUTE FUNCTION update_zippy_pro_count();

-- 5. Enable RLS on zippyprocount (allow public read)
ALTER TABLE public.zippyprocount ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view member count" ON public.zippyprocount;
CREATE POLICY "Public can view member count" ON public.zippyprocount FOR SELECT USING (true);
