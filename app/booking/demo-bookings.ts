export type BookingCategory = "Movies" | "Bus" | "Train" | "Flights";

export type DemoSearch = {
  category: BookingCategory;
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  searchTerm?: string;
};

export type DemoOption = {
  id: string;
  category: BookingCategory;
  title: string;
  subtitle: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  fare: number;
  availableSeats: number;
  rating: string;
  notes: string;
};

export type DemoBooking = {
  id: string;
  reference: string;
  bookedAt: string;
  category: BookingCategory;
  title: string;
  subtitle: string;
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  seats: string[];
  totalFare: number;
};

export const DEMO_BOOKINGS_STORAGE_KEY = "smartticket.demoBookings.v1";
export const DEMO_DISCLAIMER =
  "Demo results only. Actual routes, fares, and seat availability are not verified.";

const demoOperators = [
  "Demo Intercity",
  "Sample Roadways",
  "Demo Express",
];
const demoBusTypes = ["AC Sleeper", "AC Seater", "Non-AC Seater"];
const demoTrainNames = ["Demo Intercity Express", "Sample Rail Connect", "Demo Passenger"];
const demoFlightNames = ["Demo Airways", "Sample Skies", "Demo Connect"];
const cinemaNames = [
  "Starlight Multiplex",
  "Silver Screen Cinemas",
  "Grandview Pictures",
  "Moonlight Cinema",
];

const movieShows = [
  { title: "The Last Horizon", genre: "Adventure · Sci-fi", rating: 8.9, length: 142 },
  { title: "Midnight in Bloom", genre: "Drama · Romance", rating: 8.4, length: 128 },
  { title: "City of Echoes", genre: "Thriller · Mystery", rating: 9.1, length: 136 },
  { title: "Beyond the Blue", genre: "Documentary · Nature", rating: 8.7, length: 115 },
];

const seatNames = Array.from({ length: 8 }, (_, row) =>
  ["A", "B", "C", "D"].map((column) => `${row + 1}${column}`),
).flat();

export function normalizeLocation(location: string) {
  return location.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function locationKey(location: string) {
  return normalizeLocation(location).toLowerCase();
}

export function displayLocation(location: string) {
  return normalizeLocation(location)
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function querySeed(query: DemoSearch) {
  return [
    query.category,
    locationKey(query.origin),
    locationKey(query.destination),
    query.date,
    query.passengers,
    locationKey(query.searchTerm ?? ""),
  ].join("|");
}

function formatTime(totalMinutes: number) {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function createTravelOptions(
  query: DemoSearch,
  operators: string[],
  types: string[],
  mode: "bus" | "train" | "flight",
): DemoOption[] {
  const seed = querySeed(query);

  return operators.map((title, index) => {
    const optionSeed = `${seed}|${index}`;
    const hash = stableHash(optionSeed);
    const durationMinutes =
      mode === "bus"
        ? 150 + (hash % 1150)
        : mode === "train"
          ? 120 + (hash % 1380)
          : 55 + (hash % 840);
    const departureMinutes =
      mode === "flight"
        ? 300 + (stableHash(`${optionSeed}|departure`) % 900)
        : (stableHash(`${optionSeed}|departure`) % 144) * 10;
    const distanceKm = 80 + (stableHash(`${optionSeed}|distance`) % 1120);
    const ratePerKm =
      mode === "flight"
        ? 3.2 + (stableHash(`${optionSeed}|rate`) % 350) / 100
        : 0.9 + (stableHash(`${optionSeed}|rate`) % 61) / 100;
    const fare = Math.round((distanceKm * ratePerKm + 120) / 10) * 10;

    return {
      id: `demo-${mode}-${stableHash(optionSeed).toString(36)}-${index}`,
      category: query.category,
      title,
      subtitle: types[index],
      origin: query.origin,
      destination: query.destination,
      departure: formatTime(departureMinutes),
      arrival: formatTime(departureMinutes + durationMinutes),
      duration: formatDuration(durationMinutes),
      fare,
      availableSeats: 8 + (stableHash(`${optionSeed}|seats`) % 17),
      rating: (4 + (stableHash(`${optionSeed}|rating`) % 10) / 10).toFixed(1),
      notes:
        mode === "bus"
          ? "Sample operator · estimated timing"
          : mode === "train"
            ? "Sample service · estimated timing"
            : "Sample flight · estimated timing",
    };
  });
}

function createMovieOptions(query: DemoSearch): DemoOption[] {
  const seed = querySeed(query);
  const term = locationKey(query.searchTerm ?? "");

  return movieShows
    .filter((show) => {
      if (!term) return true;
      return [show.title, show.genre, ...cinemaNames].some((value) =>
        locationKey(value).includes(term),
      );
    })
    .map((show) => {
      const optionSeed = `${seed}|${show.title}`;
      const startMinutes = 11 * 60 + (stableHash(optionSeed) % 13) * 45;
      const cinema = cinemaNames[stableHash(`${optionSeed}|cinema`) % cinemaNames.length];
      const availableSeats = 8 + (stableHash(`${optionSeed}|seats`) % 17);

      return {
        id: `demo-movie-${stableHash(optionSeed).toString(36)}`,
        category: "Movies",
        title: show.title,
        subtitle: `${cinema} · ${show.genre}`,
        origin: query.origin,
        destination: cinema,
        departure: formatTime(startMinutes),
        arrival: formatTime(startMinutes + show.length),
        duration: formatDuration(show.length),
        fare: 180 + (stableHash(`${optionSeed}|fare`) % 9) * 30,
        availableSeats,
        rating: show.rating.toFixed(1),
        notes: `Showtime · ${cinema}, ${query.origin}`,
      };
    });
}

export function generateDemoOptions(query: DemoSearch): DemoOption[] {
  switch (query.category) {
    case "Movies":
      return createMovieOptions(query);
    case "Bus":
      return createTravelOptions(query, demoOperators, demoBusTypes, "bus");
    case "Train":
      return createTravelOptions(query, demoTrainNames, ["AC Chair Car", "Sleeper", "AC 3 Tier"], "train");
    case "Flights":
      return createTravelOptions(query, demoFlightNames, ["Economy · Non-stop demo", "Economy · 1 stop demo", "Flex · Non-stop demo"], "flight");
  }
}

export function createDemoBooking(
  query: DemoSearch,
  option: DemoOption,
  seats: string[],
): DemoBooking {
  const now = new Date();
  const bookingId = `${now.getTime().toString(36)}-${stableHash(`${option.id}|${seats.join(",")}|${now.getTime()}`).toString(36)}`;
  return {
    id: bookingId,
    reference: `ST-${stableHash(bookingId).toString(36).toUpperCase()}`,
    bookedAt: now.toISOString(),
    category: query.category,
    title: option.title,
    subtitle: option.subtitle,
    origin: query.origin,
    destination: option.destination || query.destination,
    date: query.date,
    passengers: query.passengers,
    seats,
    totalFare: option.fare * query.passengers,
  };
}

export function getUnavailableSeats(option: DemoOption) {
  const unavailableCount = seatNames.length - option.availableSeats;
  return new Set(
    [...seatNames]
      .sort(
        (first, second) =>
          stableHash(`${option.id}|${first}`) - stableHash(`${option.id}|${second}`),
      )
      .slice(0, unavailableCount),
  );
}

export function isDemoBooking(value: unknown): value is DemoBooking {
  if (typeof value !== "object" || value === null) return false;
  const booking = value as Partial<DemoBooking>;
  return (
    typeof booking.id === "string" &&
    typeof booking.reference === "string" &&
    typeof booking.bookedAt === "string" &&
    ["Movies", "Bus", "Train", "Flights"].includes(booking.category ?? "") &&
    typeof booking.title === "string" &&
    typeof booking.subtitle === "string" &&
    typeof booking.origin === "string" &&
    typeof booking.destination === "string" &&
    typeof booking.date === "string" &&
    typeof booking.passengers === "number" &&
    Array.isArray(booking.seats) &&
    booking.seats.every((seat) => typeof seat === "string") &&
    typeof booking.totalFare === "number"
  );
}
