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
    const {
      userId,
      tripId,
      planId,
      destination,
      travelDate,
      numberOfTravelers,
      totalAmount,
      selectedPlan,
      planName,
      paymentMethod,
    } = body ?? {};

    if (!userId || !tripId || !planId || !destination || !travelDate || !Number(numberOfTravelers) || !Number(totalAmount)) {
      return new Response(JSON.stringify({ error: 'Invalid booking data. Please complete all required trip details.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Booking backend is not configured. Please contact support.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (token) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData.user || authData.user.id !== userId) {
        return new Response(JSON.stringify({ error: 'User session is invalid. Please log in again.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const bookingCode = `YAT-${Date.now().toString().slice(-6)}`;

    const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
      booking_id: bookingId,
      user_id: userId,
      trip_id: tripId,
      plan_id: planId,
      booking_code: bookingCode,
      trip_route: destination,
      destination,
      travel_date: travelDate,
      start_date: travelDate,
      travellers: Number(numberOfTravelers),
      number_of_travelers: Number(numberOfTravelers),
      hotel: selectedPlan || planName || 'Selected trip plan',
      transport: 'Trip plan selected',
      activities: [],
      subtotal: Number(totalAmount),
      taxes: 0,
      total_payable: Number(totalAmount),
      total_amount: Number(totalAmount),
      status: 'pending',
      booking_status: 'Pending',
      payment_status: 'Pending',
    }).select('*').single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: bookingError?.message || 'Booking could not be created in the database.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentInsert = {
      user_id: userId,
      booking_id: booking.id,
      booking_reference: bookingId,
      payment_reference: `PAY-${Date.now()}`,
      razorpay_order_id: `demo_order_${bookingCode.toLowerCase()}`,
      razorpay_payment_id: `demo_payment_${bookingCode.toLowerCase()}`,
      razorpay_signature: '',
      amount: Number(totalAmount),
      currency: 'INR',
      payment_method: paymentMethod || 'UPI',
      payment_status: 'Pending',
      payment_mode: 'demo',
    };

    const { data: payment, error: paymentError } = await supabase.from('payments').insert(paymentInsert).select('*').single();
    if (paymentError || !payment) {
      await supabase.from('bookings').delete().eq('id', booking.id);
      return new Response(JSON.stringify({ error: paymentError?.message || 'Payment record could not be created.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ booking, payment }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Booking API failure' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
