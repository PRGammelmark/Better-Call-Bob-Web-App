import React, { useState, useMemo } from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import Styles from "./Kalender.module.css";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 - 19:00

const HeaderWeek = ({ weekStart, onPrev, onNext }) => {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className={Styles.headerWeekWrapper}>
      <div className={Styles.headerControls}>
        <button onClick={onPrev} className={Styles.navButton}>◀</button>
        <div className={Styles.weekDays}>
          {days.map((d) => (
            <div key={d.toISOString()} className={Styles.dayCell}>
              <div className={Styles.dayName}>{format(d, "EEE")}</div>
              <div className={Styles.dayNumber}>{format(d, "d")}</div>
            </div>
          ))}
        </div>
        <button onClick={onNext} className={Styles.navButton}>▶</button>
      </div>
    </div>
  );
};

const DayColumn = ({ date, events = [] }) => {
  return (
    <div className={Styles.dayColumn}>
      <div className={Styles.dayHeader}>{format(date, "EEEE d")}</div>
      <div className={Styles.dayBody}>
        {HOURS.map((hour) => (
          <div key={hour} className={Styles.hourRow}>
            <div className={Styles.hourLabel}>{hour}:00</div>
            {events
              .filter((ev) => ev.date && isSameDay(ev.date, date) && ev.hour === hour)
              .map((ev) => (
                <div key={ev.id} className={Styles.event}>
                  {ev.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const TwoDayView = ({ startDate, onPrev, onNext, events }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
    trackMouse: true,
  });

  const day1 = startDate;
  const day2 = addDays(startDate, 1);

  return (
    <div {...handlers} className={Styles.twoDayWrapper}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={day1.toDateString()}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={Styles.twoDayInner}
        >
          <DayColumn date={day1} events={events} />
          <DayColumn date={day2} events={events} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const AdminKalender = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [twoDayStartOffset, setTwoDayStartOffset] = useState(0);

  const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
  const twoDayStart = useMemo(() => addDays(new Date(), twoDayStartOffset), [twoDayStartOffset]);

  const sampleEvents = useMemo(() => [
    { id: 1, title: "Møde med Ida", date: new Date(), hour: 10 },
    { id: 2, title: "Review", date: addDays(new Date(), 1), hour: 14 },
  ], []);

  const headerHandlers = useSwipeable({
    onSwipedLeft: () => setWeekOffset((w) => w + 1),
    onSwipedRight: () => setWeekOffset((w) => w - 1),
    trackMouse: true,
  });

  return (
    <div className={Styles.container}>
      <div {...headerHandlers}>
        <HeaderWeek
          weekStart={weekStart}
          onPrev={() => setWeekOffset((w) => w - 1)}
          onNext={() => setWeekOffset((w) => w + 1)}
        />
      </div>

      <div className={Styles.twoDayControls}>
        <button
          onClick={() => setTwoDayStartOffset((s) => s - 2)}
          className={Styles.navButton}
        >
          ◀
        </button>
        <div className={Styles.dateRange}>{format(twoDayStart, "dd MMM yyyy")} — {format(addDays(twoDayStart,1), "dd MMM yyyy")}</div>
        <button
          onClick={() => setTwoDayStartOffset((s) => s + 2)}
          className={Styles.navButton}
        >
          ▶
        </button>
      </div>

      <div className={Styles.twoDayContainer}>
        <TwoDayView
          startDate={twoDayStart}
          onPrev={() => setTwoDayStartOffset((s) => s - 2)}
          onNext={() => setTwoDayStartOffset((s) => s + 2)}
          events={sampleEvents}
        />
      </div>
    </div>
  );
};

export default AdminKalender;
