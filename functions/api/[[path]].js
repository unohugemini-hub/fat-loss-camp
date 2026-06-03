// Cloudflare Pages Function - 减肥夏令营 API
// 路由: /api/records, /api/coach

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== RECORDS =====
    if (path === 'records') {
      if (method === 'GET') {
        const date = url.searchParams.get('date');
        if (date) {
          const rec = await env.DB.prepare('SELECT * FROM records WHERE date = ?').bind(date).first();
          return Response.json({ success: true, data: rec || null }, { headers: corsHeaders });
        }
        const { results } = await env.DB.prepare('SELECT * FROM records ORDER BY date ASC').all();
        return Response.json({ success: true, data: results }, { headers: corsHeaders });
      }

      if (method === 'POST') {
        const body = await request.json();
        const { date, weight, meals, workouts, note, totalCalories, cardioCount, strengthCount, hasJunkSnack, prevWeight, coachReview, coachReviewType } = body;

        await env.DB.prepare(`
          INSERT INTO records (date, weight, meals, workouts, note, total_calories, cardio_count, strength_count, has_junk_snack, prev_weight, coach_review, coach_review_type, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
          ON CONFLICT(date) DO UPDATE SET
            weight = excluded.weight,
            meals = excluded.meals,
            workouts = excluded.workouts,
            note = excluded.note,
            total_calories = excluded.total_calories,
            cardio_count = excluded.cardio_count,
            strength_count = excluded.strength_count,
            has_junk_snack = excluded.has_junk_snack,
            prev_weight = excluded.prev_weight,
            coach_review = excluded.coach_review,
            coach_review_type = excluded.coach_review_type,
            updated_at = datetime('now','localtime')
        `).bind(
          date, weight ?? null,
          JSON.stringify(meals || {}),
          JSON.stringify(workouts || []),
          note || null,
          totalCalories || 0,
          cardioCount || 0,
          strengthCount || 0,
          hasJunkSnack ? 1 : 0,
          prevWeight ?? null,
          coachReview || null,
          coachReviewType || 'neutral'
        ).run();

        return Response.json({ success: true }, { headers: corsHeaders });
      }
    }

    // ===== COACH HISTORY =====
    if (path === 'coach') {
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM coach_history ORDER BY created_at DESC LIMIT 30').all();
        return Response.json({ success: true, data: results }, { headers: corsHeaders });
      }

      if (method === 'POST') {
        const body = await request.json();
        const { date, msg, type } = body;
        await env.DB.prepare('INSERT INTO coach_history (date, msg, type) VALUES (?, ?, ?)')
          .bind(date, msg, type || 'neutral').run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}
