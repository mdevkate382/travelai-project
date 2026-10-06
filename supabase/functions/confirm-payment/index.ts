import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, paymentMethod, amount, currency = 'INR', paymentMode = 'demo' } = body ?? {};

    if (!bookingId || !Number(amount)) {
      return new Response(JSON.stringify({ error: 'Missing payment details. Please try again.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Payment backend is not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking was not found. Please check the booking ID and try again.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: paymentRow, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', booking.id)
      .maybeSingle();

    const paymentRecord = {
      user_id: booking.user_id,
      booking_id: booking.id,
      booking_reference: booking.booking_id,
      payment_reference: `PAY-${Date.now()}`,
      razorpay_order_id: `demo_order_${booking.booking_code?.toLowerCase() || 'booking'}`,
      razorpay_payment_id: `demo_payment_${Date.now()}`,
      razorpay_signature: '',
      amount: Number(amount),
      currency,
      payment_method: paymentMethod || 'UPI',
      payment_status: 'Paid',
      payment_mode: paymentMode,
    };

    let savedPayment;
    if (paymentRow) {
      const { data, error } = await supabase.from('payments').update(paymentRecord).eq('id', paymentRow.id).select('*').single();
      if (error) throw error;
      savedPayment = data;
    } else {
      const { data, error } = await supabase.from('payments').insert(paymentRecord).select('*').single();
      if (error) throw error;
      savedPayment = data;
    }

    const { data: updatedBooking, error: updateBookingError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        booking_status: 'Confirmed',
        payment_status: 'Paid',
        total_amount: Number(amount),
        total_payable: Number(amount),
      })
      .eq('id', booking.id)
      .select('*')
      .single();

    if (updateBookingError || !updatedBooking) {
      throw updateBookingError || new Error('Booking confirmation failed.');
    }

    return new Response(JSON.stringify({ booking: updatedBooking, payment: savedPayment }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Payment confirmation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
