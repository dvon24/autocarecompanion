-- Reviewed release gate: run on production only with explicit operator approval.
-- Transactional DDL: collisions abort, leaving all legacy rows and uniqueness intact.
BEGIN;
LOCK TABLE "Reservation" IN SHARE ROW EXCLUSIVE MODE;
-- Exact ECMAScript trim/\\s set (not locale-dependent PostgreSQL \\s).
CREATE FUNCTION public.reservation_whitespace() RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
$$;
CREATE FUNCTION public.reservation_normalize_text(value text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT lower(btrim(regexp_replace(coalesce(value, ''), '[' || public.reservation_whitespace() || ']+', ' ', 'g')));
$$;
-- Structured fields follow normalizeTwinIdentityField; free text stays separate.
CREATE FUNCTION public.reservation_normalize_fitment(value text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT regexp_replace(lower(btrim(coalesce(value, ''), public.reservation_whitespace())), '[' || public.reservation_whitespace() || '_-]+', ' ', 'g');
$$;
CREATE FUNCTION public.reservation_request_key(verified boolean, yr integer, mk text, mdl text, trm text, gearbox text, display text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT CASE WHEN verified AND yr IS NOT NULL AND yr <> 0
    AND public.reservation_normalize_fitment(mk) <> '' AND public.reservation_normalize_fitment(mdl) <> ''
    THEN jsonb_build_array('structured', yr, public.reservation_normalize_fitment(mk), public.reservation_normalize_fitment(mdl),
      public.reservation_normalize_fitment(trm), public.reservation_normalize_fitment(gearbox))::text
    ELSE jsonb_build_array('free', public.reservation_normalize_text(display), public.reservation_normalize_text(gearbox))::text END;
$$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Reservation"
    GROUP BY lower(btrim(email, public.reservation_whitespace())), public.reservation_request_key("vehicleVerified", year, make, model, trim, transmission, vehicle)
    HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Normalized exact reservation collisions require operator review; no rows were merged or deleted';
  END IF;
END $$;
CREATE UNIQUE INDEX "Reservation_email_exact_request_key"
  ON "Reservation" (lower(btrim(email, public.reservation_whitespace())), public.reservation_request_key("vehicleVerified", year, make, model, trim, transmission, vehicle));
CREATE INDEX "Reservation_email_idx" ON "Reservation" (email);
DROP INDEX "Reservation_email_key";
COMMIT;
