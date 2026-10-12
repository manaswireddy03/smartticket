"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Check,
  ChevronDown,
  Clapperboard,
  Clock3,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrainFront,
  UsersRound,
} from "lucide-react";

import {
  DEMO_BOOKINGS_STORAGE_KEY,
  createDemoBooking,
  displayLocation,
  generateDemoOptions,
  isDemoBooking,
  locationKey,
  type DemoBooking,
  type DemoOption,
  type DemoSearch,
} from "@/app/booking/demo-bookings";
import {
  DemoBookingsSection,
  DemoConfirmationDialog,
  DemoNoticeDialog,
  DemoResults,
  DemoSeatDialog,
} from "@/app/components/demo-booking-ui";

type Category = DemoSearch["category"];

const categories = [
  {
    name: "Movies" as const,
    description: "Your next favorite, one tap away.",
    icon: Clapperboard,
    color: "from-fuchsia-500/20 to-purple-500/5",
    iconColor: "text-fuchsia-300",
  },
  {
    name: "Bus" as const,
    description: "The scenic route starts here.",
    icon: BusFront,
    color: "from-cyan-400/20 to-blue-500/5",
    iconColor: "text-cyan-300",
  },
  {
    name: "Train" as const,
    description: "Make every mile memorable.",
    icon: TrainFront,
    color: "from-violet-400/20 to-indigo-500/5",
    iconColor: "text-violet-300",
  },
  {
    name: "Flights" as const,
    description: "A little closer to somewhere new.",
    icon: Plane,
    color: "from-blue-400/20 to-sky-500/5",
    iconColor: "text-blue-300",
  },
];

const destinations = [
  {
    city: "Jaipur",
    region: "Rajasthan, India",
    price: "from ₹899",
    image:
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=85",
  },
  {
    city: "Goa",
    region: "Goa, India",
    price: "from ₹1,299",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  },
  {
    city: "Manali",
    region: "Himachal Pradesh, India",
    price: "from ₹1,099",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=85",
  },
  {
    city: "Mumbai",
    region: "Maharashtra, India",
    price: "from ₹749",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=85",
  },
];

const movies = [
  {
    title: "The Last Horizon",
    genre: "Adventure · Sci-fi",
    rating: "8.9",
    image:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Midnight in Bloom",
    genre: "Drama · Romance",
    rating: "8.4",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "City of Echoes",
    genre: "Thriller · Mystery",
    rating: "9.1",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Beyond the Blue",
    genre: "Documentary · Nature",
    rating: "8.7",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  },
];

function DateField({
  label,
  name,
  required = true,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="search-field">
      <span className="field-label">
        <CalendarDays aria-hidden="true" size={15} />
        {label}
      </span>
      <input aria-label={label} name={name} type="date" required={required} />
    </label>
  );
}

function LocationField({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="search-field">
      <span className="field-label">
        <MapPin aria-hidden="true" size={15} />
        {label}
      </span>
      <input
        aria-label={label}
        autoComplete="off"
        name={name}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

function GuestField({ label = "Passengers" }: { label?: string }) {
  return (
    <label className="search-field">
      <span className="field-label">
        <UsersRound aria-hidden="true" size={15} />
        {label}
      </span>
      <select
        aria-label={label}
        defaultValue="1"
        name="passengers"
      >
        <option value="1">1 {label === "Tickets" ? "ticket" : "traveler"}</option>
        <option value="2">2 {label === "Tickets" ? "tickets" : "travelers"}</option>
        <option value="3">3 {label === "Tickets" ? "tickets" : "travelers"}</option>
        <option value="4">4 {label === "Tickets" ? "tickets" : "travelers"}</option>
      </select>
      <ChevronDown aria-hidden="true" className="select-chevron" size={15} />
    </label>
  );
}

function SearchFields({
  category,
  selectedMovie,
}: {
  category: Category;
  selectedMovie: string;
}) {
  if (category === "Movies") {
    return (
      <>
        <LocationField label="Your city" name="city" placeholder="Where are you?" />
        <label className="search-field">
          <span className="field-label">
            <Clapperboard aria-hidden="true" size={15} />
            Movie or cinema
          </span>
          <input
            aria-label="Movie or cinema"
            defaultValue={selectedMovie}
            name="movie"
            placeholder="Search movies, cinemas..."
          />
        </label>
        <DateField label="Show date" name="show-date" />
        <GuestField label="Tickets" />
      </>
    );
  }

  return (
    <>
      <LocationField
        label="From"
        name="origin"
        placeholder={
          category === "Flights"
            ? "Departure city"
            : category === "Bus"
              ? "City, village or bus stop"
              : "Leaving from"
        }
      />
      <LocationField
        label="To"
        name="destination"
        placeholder={
          category === "Flights"
            ? "Arrival city"
            : category === "Bus"
              ? "City, village or bus stop"
              : "Going to"
        }
      />
      <DateField label="Departure" name="departure" />
      <GuestField label="Passengers" />
    </>
  );
}

export default function Home() {
  const [category, setCategory] = useState<Category>("Bus");
  const [searchMessage, setSearchMessage] = useState("");
  const [demoResults, setDemoResults] = useState<{
    query: DemoSearch;
    options: DemoOption[];
  } | null>(null);
  const [activeOption, setActiveOption] = useState<DemoOption | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    query: DemoSearch;
    option: DemoOption;
    seats: string[];
  } | null>(null);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [storageMessage, setStorageMessage] = useState("");
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedBookings = window.localStorage.getItem(DEMO_BOOKINGS_STORAGE_KEY);
        if (storedBookings) {
          const parsed: unknown = JSON.parse(storedBookings);
          if (!Array.isArray(parsed)) {
            throw new Error("Stored demo bookings must be a list.");
          }
          setBookings(parsed.filter(isDemoBooking));
        }
      } catch {
        setStorageMessage("Saved demo bookings could not be read from this browser.");
      } finally {
        setBookingsLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function changeCategory(nextCategory: Category, movieTitle = "") {
    setCategory(nextCategory);
    setSelectedMovie(nextCategory === "Movies" ? movieTitle : "");
    setSearchMessage("");
    setDemoResults(null);
    setBookingMessage("");
    setPendingConfirmation(null);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const movieSearch = category === "Movies";
    const searchTerm = String(formData.get("movie") ?? "").trim();
    const origin = displayLocation(
      String(formData.get(movieSearch ? "city" : "origin") ?? ""),
    );
    const destination = movieSearch
      ? searchTerm || "All demo cinemas"
      : displayLocation(String(formData.get("destination") ?? ""));
    const date = String(formData.get(movieSearch ? "show-date" : "departure") ?? "");
    const query: DemoSearch = {
      category,
      origin,
      destination,
      date,
      passengers: Number(formData.get("passengers") ?? 1),
      searchTerm,
    };

    setBookingMessage("");
    setDemoResults(null);
    if (!query.origin) {
      setSearchMessage(movieSearch ? "Please enter a city for the showtime search." : "Please enter a starting point.");
      return;
    }
    if (!movieSearch && !query.destination) {
      setSearchMessage("Please enter both your starting point and destination.");
      return;
    }
    if (!movieSearch && locationKey(query.origin) === locationKey(query.destination)) {
      setSearchMessage("Your starting point and destination must be different.");
      return;
    }
    if (!query.date) {
      setSearchMessage(movieSearch ? "Please choose a show date." : "Please choose a departure date.");
      return;
    }
    if (!Number.isInteger(query.passengers) || query.passengers < 1 || query.passengers > 4) {
      setSearchMessage("Choose between 1 and 4 passengers.");
      return;
    }

    setDemoResults({ query, options: generateDemoOptions(query) });
    setSearchMessage("");
    setActiveOption(null);
    setPendingConfirmation(null);
  }

  function reviewOption(option: DemoOption, seats: string[] = []) {
    if (!demoResults) return;
    setPendingConfirmation({ query: demoResults.query, option, seats });
    setActiveOption(null);
  }

  function confirmDemoBooking() {
    if (!pendingConfirmation || !bookingsLoaded) return;
    const booking = createDemoBooking(
      pendingConfirmation.query,
      pendingConfirmation.option,
      pendingConfirmation.seats,
    );
    const nextBookings = [booking, ...bookings];
    try {
      window.localStorage.setItem(
        DEMO_BOOKINGS_STORAGE_KEY,
        JSON.stringify(nextBookings),
      );
      setBookings(nextBookings);
      setBookingMessage(`Demo booking ${booking.reference} saved in My Bookings.`);
      setStorageMessage("");
      setPendingConfirmation(null);
    } catch {
      setStorageMessage("Browser storage is unavailable. This demo booking could not be saved.");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071426] text-white">
      <header className="site-header">
        <div className="header-inner">
          <a aria-label="SmartTicket home" className="brand" href="#home">
            <span className="brand-mark">
              <Ticket aria-hidden="true" size={20} strokeWidth={2.3} />
            </span>
            <span>
              Smart<span className="brand-light">Ticket</span>
            </span>
          </a>
          <nav aria-label="Main navigation" className="desktop-nav">
            <a className="nav-active" href="#home">Home</a>
            <a href="#movies" onClick={() => changeCategory("Movies")}>Movies</a>
            <a href="#booking" onClick={() => changeCategory("Bus")}>Bus</a>
            <a href="#booking" onClick={() => changeCategory("Train")}>Train</a>
            <a href="#booking" onClick={() => changeCategory("Flights")}>Flights</a>
            <a href="#my-bookings">My Bookings</a>
          </nav>
          <button
            className="login-button"
            onClick={() => setNotice({
              title: "Sign-in isn’t enabled yet",
              message: "This frontend demo uses local browser storage for sample bookings. No account or real reservation is created.",
            })}
            type="button"
          >
            Log in <ArrowRight aria-hidden="true" size={15} />
          </button>
        </div>
      </header>

      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles aria-hidden="true" size={14} /> YOUR JOURNEY, REIMAGINED</div>
          <h1>One Platform.<br /><span>Every Journey.</span></h1>
          <p>
            From the opening credits to the open road — discover, book, and go
            with one beautifully simple ticketing experience.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#booking" onClick={() => changeCategory("Bus")}>Find your next ticket <ArrowRight aria-hidden="true" size={17} /></a>
            <a className="text-link" href="#destinations">Explore destinations <span aria-hidden="true">↓</span></a>
          </div>
          <div className="social-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>R</span><span>A</span><span>M</span><span>S</span>
            </div>
            <div><strong>4.9/5</strong><span>Loved by 2M+ travelers</span></div>
          </div>
        </div>
        <div aria-label="A train winding through a mountain landscape" className="hero-visual" role="img">
          <div className="hero-image" />
          <div className="hero-glow" />
          <div className="floating-note note-top">
            <span className="note-icon"><Check aria-hidden="true" size={15} /></span>
            <span><strong>Good choice.</strong><small>Your next adventure awaits</small></span>
          </div>
          <div className="floating-note note-bottom">
            <span className="mini-sparkle"><Sparkles aria-hidden="true" size={16} /></span>
            <span><strong>Made for the journey</strong><small>Travel a little more, worry a little less</small></span>
          </div>
          <div className="visual-caption"><span /> EVERYWHERE IS CLOSER</div>
        </div>
      </section>

      <section aria-label="Ticket categories" className="section-shell category-grid">
        {categories.map(({ name, description, icon: Icon, color, iconColor }) => (
          <button
            aria-pressed={category === name}
            className={`category-card bg-gradient-to-br ${color} ${category === name ? "category-selected" : ""}`}
            key={name}
            onClick={() => {
              changeCategory(name);
            }}
            type="button"
          >
            <span className={`category-icon ${iconColor}`}><Icon aria-hidden="true" size={21} /></span>
            <span className="category-info"><strong>{name}</strong><small>{description}</small></span>
            <ArrowRight aria-hidden="true" className="category-arrow" size={17} />
          </button>
        ))}
      </section>

      <section aria-labelledby="search-heading" className="section-shell search-section" id="booking">
        <div className="section-heading search-heading">
          <div>
            <span className="section-kicker">LET’S GET YOU THERE</span>
            <h2 id="search-heading">Where to next?</h2>
          </div>
          <span className="secure-note"><ShieldCheck aria-hidden="true" size={15} /> Secure, simple, sorted</span>
        </div>
        <form className="search-panel" onSubmit={handleSearch}>
          <div className="search-tabs" role="group" aria-label="Choose ticket type">
            {categories.map(({ name, icon: Icon }) => (
              <button
                aria-pressed={category === name}
                className={`search-tab ${category === name ? "search-tab-active" : ""}`}
                key={name}
                onClick={() => changeCategory(name)}
                type="button"
              >
                <Icon aria-hidden="true" size={16} /> {name}
              </button>
            ))}
          </div>
          <div className="search-fields" key={`${category}-${selectedMovie}`}>
            <SearchFields category={category} selectedMovie={selectedMovie} />
          </div>
          <button className="search-button" type="submit"><Search aria-hidden="true" size={17} /> Search {category}</button>
          <div aria-live={searchMessage ? "assertive" : "polite"} className={`search-feedback ${searchMessage ? "search-feedback-error" : ""}`} role={searchMessage ? "alert" : undefined}>{searchMessage}</div>
        </form>
        {demoResults && (
          <>
            <DemoResults
              onConfirm={(option) => reviewOption(option)}
              onSelectSeats={setActiveOption}
              options={demoResults.options}
              query={demoResults.query}
            />
            {bookingMessage && <p aria-live="polite" className="booking-message" role="status">{bookingMessage}</p>}
          </>
        )}
        {activeOption && demoResults && (
          <DemoSeatDialog
            onClose={() => setActiveOption(null)}
            onContinue={(seats) => reviewOption(activeOption, seats)}
            option={activeOption}
            passengers={demoResults.query.passengers}
          />
        )}
        {pendingConfirmation && (
          <DemoConfirmationDialog
            canConfirm={bookingsLoaded}
            error={storageMessage}
            onClose={() => setPendingConfirmation(null)}
            onConfirm={confirmDemoBooking}
            option={pendingConfirmation.option}
            query={pendingConfirmation.query}
            seats={pendingConfirmation.seats}
          />
        )}
      </section>

      <section aria-labelledby="destinations-heading" className="section-shell content-section" id="destinations">
        <div className="section-heading">
          <div>
            <span className="section-kicker">A LITTLE INSPIRATION</span>
            <h2 id="destinations-heading">Popular destinations</h2>
            <p>Somewhere wonderful is closer than you think.</p>
          </div>
          <a className="view-all" href="#booking">Explore all destinations <ArrowRight aria-hidden="true" size={16} /></a>
        </div>
        <div className="destination-grid">
          {destinations.map((destination, index) => (
            <a className="destination-card" href="#booking" key={destination.city} onClick={() => changeCategory(index === 0 ? "Train" : "Bus")}>
              <div
                aria-hidden="true"
                className="destination-image"
                style={{ backgroundImage: `linear-gradient(180deg, transparent 28%, rgba(5, 16, 31, .94) 100%), url("${destination.image}")` }}
              />
              <span className="destination-price">{destination.price}</span>
              <div className="destination-copy">
                <strong>{destination.city}</strong>
                <span><MapPin aria-hidden="true" size={13} /> {destination.region}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="movies-heading" className="section-shell content-section movies-section" id="movies">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE SHOW MUST GO ON</span>
            <h2 id="movies-heading">Stories worth seeing</h2>
            <p>Big-screen moments, picked just for you.</p>
          </div>
          <a className="view-all" href="#booking" onClick={() => changeCategory("Movies")}>Browse all movies <ArrowRight aria-hidden="true" size={16} /></a>
        </div>
        <div className="movie-grid">
          {movies.map((movie) => (
            <a
              className="movie-card"
              href="#booking"
              key={movie.title}
              onClick={() => {
                changeCategory("Movies", movie.title);
              }}
              style={{ backgroundImage: `linear-gradient(180deg, rgba(5, 16, 31, .03) 15%, rgba(5, 16, 31, .92) 100%), url("${movie.image}")` }}
            >
              <span className="movie-rating">★ {movie.rating}</span>
              <span className="movie-details">
                <span className="movie-genre">{movie.genre}</span>
                <strong>{movie.title}</strong>
                <span className="movie-book">Book tickets <ArrowRight aria-hidden="true" size={14} /></span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="benefits-heading" className="section-shell benefits-section" id="benefits">
        <div className="benefits-intro">
          <span className="section-kicker">THE SMARTTICKET DIFFERENCE</span>
          <h2 id="benefits-heading">More going.<br /><span>Less figuring out.</span></h2>
          <p>We take the friction out of getting there, so you can focus on the good stuff.</p>
        </div>
        <div className="benefit-list">
          <article className="benefit-item">
            <span className="benefit-icon"><Sparkles aria-hidden="true" size={19} /></span>
            <div><h3>One place for it all</h3><p>Movies, buses, trains, and flights — plan every part of your journey in one place.</p></div>
          </article>
          <article className="benefit-item">
            <span className="benefit-icon"><Clock3 aria-hidden="true" size={19} /></span>
            <div><h3>Less time searching</h3><p>Clear options and a thoughtful booking flow get you from maybe to booked, faster.</p></div>
          </article>
          <article className="benefit-item">
            <span className="benefit-icon"><ShieldCheck aria-hidden="true" size={19} /></span>
            <div><h3>Plans you can trust</h3><p>Transparent details and helpful support make every booking feel straightforward.</p></div>
          </article>
        </div>
      </section>

      <DemoBookingsSection
        bookings={bookings}
        error={storageMessage}
        loading={!bookingsLoaded}
        message={bookingMessage}
      />

      <section className="section-shell closing-banner" id="login">
        <div className="closing-orb" />
        <div><span className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</span><h2>Ready when you are.</h2><p>Pick a place. Find your seat. Let’s go.</p></div>
        <a className="primary-button" href="#booking" onClick={() => changeCategory("Bus")}>Start exploring <ArrowRight aria-hidden="true" size={17} /></a>
      </section>

      <footer className="site-footer">
        <div className="section-shell footer-inner">
          <div className="footer-brand">
            <a aria-label="SmartTicket home" className="brand" href="#home">
              <span className="brand-mark"><Ticket aria-hidden="true" size={19} strokeWidth={2.3} /></span>
              <span>Smart<span className="brand-light">Ticket</span></span>
            </a>
            <p>Good journeys begin with a<br />better way to book.</p>
          </div>
          <div className="footer-links">
            <div><span>EXPLORE</span><a href="#movies" onClick={() => changeCategory("Movies")}>Movies</a><a href="#booking" onClick={() => changeCategory("Bus")}>Bus</a><a href="#booking" onClick={() => changeCategory("Train")}>Train</a><a href="#booking" onClick={() => changeCategory("Flights")}>Flights</a></div>
            <div><span>SMARTTICKET</span><a href="#benefits">About us</a><a href="#my-bookings">My bookings</a><a href="#benefits">Help &amp; support</a></div>
          </div>
          <div className="footer-newsletter">
            <strong>A little inspiration, occasionally.</strong>
            <p>New places, great stories, good reasons to go.</p>
            <a href="#home">Back to top <ArrowRight aria-hidden="true" size={14} /></a>
          </div>
        </div>
        <div className="section-shell footer-bottom"><span>© 2026 SmartTicket. All journeys welcome.</span><span>Made for the way you move <span aria-hidden="true">✦</span></span></div>
      </footer>
      {notice && (
        <DemoNoticeDialog
          message={notice.message}
          onClose={() => setNotice(null)}
          title={notice.title}
        />
      )}
    </main>
  );
}
