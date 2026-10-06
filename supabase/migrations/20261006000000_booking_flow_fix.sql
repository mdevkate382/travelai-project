ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_id text,
  ADD COLUMN IF NOT EXISTS destination text DEFAULT '',
  ADD COLUMN IF NOT EXISTS travel_date date,
  ADD COLUMN IF NOT EXISTS number_of_travelers integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_amount integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS booking_reference text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_reference text DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_booking_id
  ON public.bookings (booking_id)
  WHERE booking_id IS NOT NULL;

UPDATE public.bookings
SET booking_id = COALESCE(booking_id, CONCAT('BK-', TO_CHAR(COALESCE(created_at, NOW()), 'YYYYMMDDHH24MISS'), '-', REPLACE(CAST(id AS text), '-', '')))
WHERE booking_id IS NULL;

UPDATE public.bookings
SET destination = COALESCE(destination, trip_route, ''),
    travel_date = COALESCE(travel_date, start_date),
    number_of_travelers = COALESCE(number_of_travelers, travellers, 1),
    total_amount = COALESCE(total_amount, total_payable, 0),
    booking_status = COALESCE(booking_status, CASE WHEN status = 'confirmed' THEN 'Confirmed' ELSE 'Pending' END),
    payment_status = COALESCE(payment_status, CASE WHEN status = 'confirmed' THEN 'Paid' ELSE 'Pending' END)
WHERE booking_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.ensure_booking_identity()
RETURNS trigger AS $$
BEGIN
  IF NEW.booking_id IS NULL OR NEW.booking_id = '' THEN
    NEW.booking_id := CONCAT('BK-', TO_CHAR(COALESCE(NEW.created_at, NOW()), 'YYYYMMDDHH24MISS'), '-', REPLACE(CAST(gen_random_uuid() AS text), '-', ''));
  END IF;

  IF NEW.destination IS NULL OR NEW.destination = '' THEN
    NEW.destination := COALESCE(NEW.trip_route, '');
  END IF;

  IF NEW.travel_date IS NULL THEN
    NEW.travel_date := NEW.start_date;
  END IF;

  IF NEW.number_of_travelers IS NULL OR NEW.number_of_travelers < 1 THEN
    NEW.number_of_travelers := COALESCE(NEW.travellers, 1);
  END IF;

  IF NEW.total_amount IS NULL OR NEW.total_amount = 0 THEN
    NEW.total_amount := COALESCE(NEW.total_payable, 0);
  END IF;

  IF NEW.booking_status IS NULL OR NEW.booking_status = '' THEN
    NEW.booking_status := CASE WHEN NEW.status = 'confirmed' THEN 'Confirmed' ELSE 'Pending' END;
  END IF;

  IF NEW.payment_status IS NULL OR NEW.payment_status = '' THEN
    NEW.payment_status := CASE WHEN NEW.status = 'confirmed' THEN 'Paid' ELSE 'Pending' END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_booking_identity ON public.bookings;
CREATE TRIGGER trg_ensure_booking_identity
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.ensure_booking_identity();
