const buckets = new Map();

function createRateLimit(options = {}) {
  const windowMs = Number(options.windowMs) || 60 * 1000;
  const max = Number(options.max) || 30;

  return async (ctx, next) => {
    const key = ctx.from ? String(ctx.from.id) : ctx.ip || "unknown";

    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 0,
        resetAt: now + windowMs,
      };

      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      if (ctx.reply) {
        await ctx.reply(
          "⏳ درخواست‌های زیادی ارسال شده است. چند لحظه بعد دوباره تلاش کن.",
        );
      }

      return;
    }

    return next();
  };
}

setInterval(
  () => {
    const now = Date.now();

    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  },
  5 * 60 * 1000,
).unref();

module.exports = createRateLimit;
