"use client";

import { useEffect, useState } from "react";

interface Comment {
  id: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
}

export default function Reviews({
  asin,
  initialComments,
}: {
  asin: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });

  // İlk render'da en güncel yorumları çek
  useEffect(() => {
    fetch(`/api/comments/${asin}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.comments)) setComments(d.comments);
      })
      .catch(() => {});
  }, [asin]);

  const avg =
    comments.length > 0
      ? comments.reduce((s, r) => s + r.rating, 0) / comments.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.text.trim().length < 5) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch(`/api/comments/${asin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: form.name,
          rating: form.rating,
          text: form.text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg(data.message || "Yorumun moderasyona gönderildi.");
        setForm({ name: "", rating: 5, text: "" });
      } else {
        setSubmitMsg(data.error || "Yorum gönderilemedi.");
      }
    } catch {
      setSubmitMsg("Bağlantı hatası, lütfen tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-stone-200">
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900">
              Yorumlar
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {comments.length} kullanıcı yorumu
              {comments.length > 0 && (
                <>
                  {" "}
                  • Ortalama{" "}
                  <span className="font-semibold text-amber-600">
                    ⭐ {avg.toFixed(1)}/5
                  </span>
                </>
              )}
            </p>
          </div>
          {comments.length > 0 && (
            <div className="text-right">
              <div className="font-display text-4xl font-bold text-stone-900">
                {avg.toFixed(1)}
              </div>
              <div className="text-amber-500 text-sm">
                {"★".repeat(Math.round(avg))}
                <span className="text-stone-300">
                  {"★".repeat(5 - Math.round(avg))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Yorum listesi veya boş state */}
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
            <div className="text-5xl mb-3">💭</div>
            <p className="text-stone-700 font-semibold mb-1">
              Henüz yorum yok
            </p>
            <p className="text-sm text-stone-500">
              Bu ürünün ilk yorumunu sen yaz, başkalarına yardımcı ol!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((r) => (
              <article
                key={r.id}
                className="pb-6 border-b border-stone-100 last:border-0"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-amber-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <span className="font-semibold text-stone-900">
                        {r.author}
                      </span>
                      <span className="text-xs text-stone-500">
                        {fmtDate(r.createdAt)}
                      </span>
                    </div>
                    <div className="text-amber-500 text-sm mb-2">
                      {"★".repeat(r.rating)}
                      <span className="text-stone-300">
                        {"★".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-sm">
                      {r.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Yorum yazma formu */}
        <div className="mt-10 pt-8 border-t border-stone-200">
          <h3 className="font-display text-xl font-bold text-stone-900 mb-4">
            Yorum bırak
          </h3>

          {submitMsg ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800 mb-4">
              <p className="font-semibold">✓ {submitMsg}</p>
              <p className="text-sm mt-1 text-emerald-700">
                Moderasyondan sonra burada görünür olacak.
              </p>
              <button
                type="button"
                onClick={() => setSubmitMsg(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 mt-3 underline"
              >
                Yeni yorum yaz
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  İsim
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                  placeholder="Adın..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  Puan
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className={`text-2xl transition ${
                        n <= form.rating
                          ? "text-amber-500"
                          : "text-stone-300 hover:text-amber-300"
                      }`}
                      aria-label={`${n} yıldız`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                  Yorumun
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={5}
                  maxLength={2000}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition resize-none"
                  placeholder="Bu ürünü nasıl buldun? Deneyimini paylaş..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Gönderiliyor..." : "Yorumu gönder"}
              </button>
              <p className="text-xs text-stone-500">
                Yorumlar moderasyondan geçtikten sonra yayınlanır.
                E-posta adresi paylaşılmaz.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
