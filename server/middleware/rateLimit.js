import rateLimit from 'express-rate-limit'

// Begrænsning: max 5 i minuttet
export const shortTermLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 5,
  message: "Du sender for mange forespørgsler. Prøv igen om lidt.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Begrænsning: max 100 om dagen
export const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 timer
  max: 100,
  message: "Du har nået den daglige grænse for oprettelser.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Begrænsning: max 3 i minuttet (for booking-formular)
export const bookingShortTermLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 3,
  message: "Du sender for mange booking-forespørgsler. Prøv igen om lidt.",
  standardHeaders: true,
  legacyHeaders: false,
})

// Begrænsning: max 10 i timen (for booking-formular)
export const hourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 time
  max: 10,
  message: "Du har nået timegrænsen for booking-oprettelser. Prøv igen senere.",
  standardHeaders: true,
  legacyHeaders: false,
})
