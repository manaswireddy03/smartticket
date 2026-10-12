"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BusFront,
  Clapperboard,
  Plane,
  Star,
  TrainFront,
  X,
} from "lucide-react";
import {
  DEMO_DISCLAIMER,
  getUnavailableSeats,
  type BookingCategory,
  type DemoBooking,
  type DemoOption,
  type DemoSearch,
} from "@/app/booking/demo-bookings";

type DemoResultsProps = {
  query: DemoSearch;
  options: DemoOption[];
  onSelectSeats: (option: DemoOption) => void;
  onConfirm: (option: DemoOption) => void;
};

type DemoSeatDialogProps = {
  option: DemoOption;
  passengers: number;
  onClose: () => void;
  onContinue: (seats: string[]) => void;
};

type DemoConfirmationDialogProps = {
  query: DemoSearch;
  option: DemoOption;
  seats: string[];
  error?: string;
  canConfirm: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type DemoNoticeDialogProps = {
  title: string;
  message: string;
  onClose: () => void;
};

const categoryIcons = {
  Movies: Clapperboard,
  Bus: BusFront,
  Train: TrainFront,
  Flights: Plane,
} satisfies Record<BookingCategory, typeof BusFront>;

const seatNames = Array.from({ length: 8 }, (_, row) =>
  ["A", "B", "C", "D"].map((column) => `${row + 1}${column}`),
).flat();

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function nextDayLabel(departure: string, arrival: string, duration: string) {
  const [departureHour, departureMinute] = departure.split(":").map(Number);
  const [arrivalHour, arrivalMinute] = arrival.split(":").map(Number);
  const departureTime = departureHour * 60 + departureMinute;
  const arrivalTime = arrivalHour * 60 + arrivalMinute;
  const durationHours = Number(duration.match(/^\d+/)?.[0] ?? 0);
  return arrivalTime < departureTime || durationHours >= 24;
}

export function DemoDisclaimer() {
  return <p className="demo-disclaimer" role="note">{DEMO_DISCLAIMER}</p>;
}

export function DemoResults({
  query,
  options,
  onSelectSeats,
  onConfirm,
}: DemoResultsProps) {
  const heading =
    query.category === "Movies"
      ? `Showtimes in ${query.origin}`
      : `${query.category} options from ${query.origin} to ${query.destination}`;
  const countLabel = query.category === "Movies" ? "ticket" : "passenger";

  return (
    <section aria-labelledby="demo-results-heading" className="bus-results" aria-live="polite">
      <div className="bus-results-heading">
        <div>
          <span className="section-kicker">DEMO {query.category.toUpperCase()} OPTIONS · NOT VERIFIED</span>
          <h2 id="demo-results-heading">{heading}</h2>
          <p>
            {formatDate(query.date)} <span aria-hidden="true">·</span>{" "}
            {query.passengers} {query.passengers === 1 ? countLabel : `${countLabel}s`}
            {` · ${options.length} demo ${options.length === 1 ? "option" : "options"}`}
          </p>
          <DemoDisclaimer />
        </div>
      </div>
      {options.length === 0 ? (
        <div className="demo-empty-state" role="status">
          <span className="bus-empty-icon"><Clapperboard aria-hidden="true" size={22} /></span>
          <h3>No sample showtimes match that search</h3>
          <p>Try a sample movie title, genre, or leave the movie/cinema field blank to browse all demo showtimes.</p>
        </div>
      ) : (
        <div className="bus-result-list">
          {options.map((option) => (
            <DemoResultCard
              key={option.id}
              option={option}
              passengers={query.passengers}
              onSelectSeats={onSelectSeats}
              onConfirm={onConfirm}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DemoResultCard({
  option,
  passengers,
  onSelectSeats,
  onConfirm,
}: {
  option: DemoOption;
  passengers: number;
  onSelectSeats: (option: DemoOption) => void;
  onConfirm: (option: DemoOption) => void;
}) {
  const Icon = categoryIcons[option.category];
  const isMovie = option.category === "Movies";
  const usesSeats = option.category === "Bus" || isMovie;

  return (
    <article className="bus-result-card">
      <div className="bus-result-main">
        <div className="bus-operator">
          <span className="bus-operator-icon"><Icon aria-hidden="true" size={18} /></span>
          <div>
            <h3>{option.title} <span className="demo-tag">DEMO</span></h3>
            <span>{option.subtitle}</span>
          </div>
        </div>
        <div aria-label={`Demo rating ${option.rating} out of ${isMovie ? 10 : 5}`} className="bus-rating" role="img">
          <Star aria-hidden="true" size={14} fill="currentColor" /> {option.rating}
        </div>
      </div>
      <div className="bus-itinerary">
        <div className="bus-time-point">
          <strong>{option.departure}</strong>
          <span>{isMovie ? "Showtime" : option.origin}</span>
        </div>
        <div className="bus-duration">
          <span>{option.duration}</span>
          <span className="bus-route-line"><i /></span>
          <span>{option.notes}</span>
        </div>
        <div className="bus-time-point bus-arrival">
          <strong>{option.arrival}</strong>
          <span>
            {isMovie
              ? option.destination
              : `${option.destination}${nextDayLabel(option.departure, option.arrival, option.duration) ? " · next day" : ""}`}
          </span>
        </div>
      </div>
      <div className="bus-result-bottom">
        <div className="bus-availability">
          <span>{option.availableSeats} demo seats available</span>
          <span>For {passengers} {isMovie ? (passengers === 1 ? "ticket" : "tickets") : (passengers === 1 ? "passenger" : "passengers")}</span>
        </div>
        <div className="bus-fare">
          <strong>~{formatRupees(option.fare)}</strong>
          <span>estimated demo fare / {isMovie ? "ticket" : "passenger"}</span>
        </div>
        <button
          className="seat-select-button"
          onClick={() => usesSeats ? onSelectSeats(option) : onConfirm(option)}
          type="button"
        >
          {usesSeats ? "Select demo seats" : "Review demo booking"}
          <ArrowRight aria-hidden="true" size={15} />
        </button>
      </div>
    </article>
  );
}

export function DemoSeatDialog({
  option,
  passengers,
  onClose,
  onContinue,
}: DemoSeatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatMessage, setSeatMessage] = useState("");
  const unavailableSeats = getUnavailableSeats(option);
  const countLabel = option.category === "Movies" ? "ticket" : "passenger";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby="seat-dialog-title"
      className="seat-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <div className="seat-dialog-header">
        <div>
          <span className="section-kicker">CHOOSE YOUR DEMO SEATS</span>
          <h2 id="seat-dialog-title">{option.title}</h2>
          <p>{option.subtitle} <span aria-hidden="true">·</span> {option.origin} to {option.destination}</p>
        </div>
        <button aria-label="Close seat selection" autoFocus className="seat-dialog-close" onClick={onClose} type="button">
          <X aria-hidden="true" size={19} />
        </button>
      </div>
      <div className="seat-legend" aria-label="Seat availability legend">
        <span><i className="legend-seat" /> Available</span>
        <span><i className="legend-seat legend-selected" /> Selected</span>
        <span><i className="legend-seat legend-sold" /> Unavailable (demo)</span>
      </div>
      <div className="seat-layout">
        <div className="seat-driver"><span>FRONT</span><span aria-hidden="true">◉</span></div>
        <div aria-label="Demo seat selection" className="seat-grid">
          {seatNames.map((seat, index) => {
            const unavailable = unavailableSeats.has(seat);
            const selected = selectedSeats.includes(seat);
            const columnIndex = index % 4;
            return (
              <button
                aria-label={`Seat ${seat}, ${unavailable ? "unavailable demo seat" : selected ? "selected" : "available demo seat"}`}
                aria-pressed={selected}
                className={`seat-button seat-column-${columnIndex} ${selected ? "seat-selected" : ""} ${unavailable ? "seat-unavailable" : ""}`}
                disabled={unavailable}
                key={seat}
                onClick={() => {
                  if (selectedSeats.includes(seat)) {
                    setSelectedSeats((current) => current.filter((item) => item !== seat));
                    setSeatMessage("");
                  } else if (selectedSeats.length >= passengers) {
                    setSeatMessage(`Choose no more than ${passengers} ${passengers === 1 ? "seat" : "seats"} for your ${countLabel}s.`);
                  } else {
                    setSelectedSeats((current) => [...current, seat]);
                    setSeatMessage("");
                  }
                }}
                type="button"
              >
                {seat}
              </button>
            );
          })}
        </div>
      </div>
      <div aria-live="polite" className="seat-selection-summary">
        <span>{selectedSeats.length} of {passengers} {passengers === 1 ? "seat" : "seats"} selected{selectedSeats.length ? ` · ${selectedSeats.join(", ")}` : ""}</span>
        <span>Total demo fare <strong>~{formatRupees(option.fare * selectedSeats.length)}</strong></span>
      </div>
      <DemoDisclaimer />
      <p aria-live="polite" className="seat-message" role={seatMessage ? "alert" : undefined}>
        {seatMessage || (selectedSeats.length === passengers
          ? "Seats selected. Continue to review your demo booking."
          : `Choose ${passengers} ${passengers === 1 ? "seat" : "seats"} to continue.`)}
      </p>
      <button
        className="seat-continue-button"
        disabled={selectedSeats.length !== passengers}
        onClick={() => onContinue(selectedSeats)}
        type="button"
      >
        Continue to review <ArrowRight aria-hidden="true" size={16} />
      </button>
    </dialog>
  );
}

export function DemoConfirmationDialog({
  query,
  option,
  seats,
  error,
  canConfirm,
  onClose,
  onConfirm,
}: DemoConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const countLabel = query.category === "Movies" ? "Tickets" : "Passengers";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby="demo-confirmation-title"
      className="seat-dialog confirmation-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <div className="seat-dialog-header">
        <div>
          <span className="section-kicker">DEMO BOOKING</span>
          <h2 id="demo-confirmation-title">Review your selection</h2>
          <p>{option.title} · {option.subtitle}</p>
        </div>
        <button aria-label="Close demo booking review" autoFocus className="seat-dialog-close" onClick={onClose} type="button">
          <X aria-hidden="true" size={19} />
        </button>
      </div>
      <dl className="confirmation-details">
        <div><dt>Category</dt><dd>{query.category} · DEMO</dd></div>
        <div><dt>Journey / venue</dt><dd>{option.origin} → {option.destination}</dd></div>
        <div><dt>Date</dt><dd>{formatDate(query.date)}</dd></div>
        <div><dt>{countLabel}</dt><dd>{query.passengers}</dd></div>
        {seats.length > 0 && <div><dt>Selected seats</dt><dd>{seats.join(", ")}</dd></div>}
        <div><dt>Estimated total</dt><dd>~{formatRupees(option.fare * query.passengers)}</dd></div>
      </dl>
      <DemoDisclaimer />
      <p className="confirmation-warning">This stores a demo record in this browser only. It is not a real reservation.</p>
      {error && <p className="storage-message" role="alert">{error}</p>}
      <button className="seat-continue-button" disabled={!canConfirm} onClick={onConfirm} type="button">
        Confirm demo booking <ArrowRight aria-hidden="true" size={16} />
      </button>
    </dialog>
  );
}

export function DemoBookingsSection({
  bookings,
  message,
  error,
  loading,
}: {
  bookings: DemoBooking[];
  message?: string;
  error?: string;
  loading: boolean;
}) {
  return (
    <section aria-labelledby="my-bookings-heading" className="section-shell content-section my-bookings-section" id="my-bookings">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SAVED IN THIS BROWSER</span>
          <h2 id="my-bookings-heading">My demo bookings</h2>
          <p>Sample confirmations are stored locally on this device.</p>
        </div>
      </div>
      {message && <p aria-live="polite" className="booking-message" role="status">{message}</p>}
      {error && <p aria-live="assertive" className="storage-message" role="alert">{error}</p>}
      {loading ? (
        <div className="demo-empty-state" role="status"><p>Loading saved demo bookings…</p></div>
      ) : bookings.length === 0 ? (
        <div className="demo-empty-state">
          <span className="bus-empty-icon"><ArrowRight aria-hidden="true" size={21} /></span>
          <h3>No demo bookings yet</h3>
          <p>Complete a sample booking and it will appear here. No real tickets are issued.</p>
        </div>
      ) : (
        <div className="booking-history-list">
          {bookings.map((booking) => (
            <article className="booking-history-card" key={booking.id}>
              <div>
                <span className="demo-tag">DEMO · {booking.category.toUpperCase()}</span>
                <h3>{booking.title}</h3>
                <p>{booking.origin} → {booking.destination} · {formatDate(booking.date)}</p>
                {booking.seats.length > 0 && <p>Seats: {booking.seats.join(", ")} · {booking.passengers} {booking.category === "Movies" ? (booking.passengers === 1 ? "ticket" : "tickets") : (booking.passengers === 1 ? "passenger" : "passengers")}</p>}
                <span className="booking-reference">Reference: {booking.reference} · Not a real reservation</span>
              </div>
              <strong>~{formatRupees(booking.totalFare)}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function DemoNoticeDialog({
  title,
  message,
  onClose,
}: DemoNoticeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby="demo-notice-title"
      className="seat-dialog confirmation-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <div className="seat-dialog-header">
        <div>
          <span className="section-kicker">SMARTTICKET DEMO</span>
          <h2 id="demo-notice-title">{title}</h2>
          <p>{message}</p>
        </div>
        <button aria-label="Close message" autoFocus className="seat-dialog-close" onClick={onClose} type="button">
          <X aria-hidden="true" size={19} />
        </button>
      </div>
      <button className="seat-continue-button notice-close-button" onClick={onClose} type="button">Got it</button>
    </dialog>
  );
}
