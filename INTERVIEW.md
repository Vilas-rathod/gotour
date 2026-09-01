# GoTour — Interview & Résumé Guide

A cheat-sheet for talking about this project: résumé bullets, a 30-second pitch,
a demo script, and a Q&A bank with strong answers.

Repo: https://github.com/Vilas-rathod/gotour

---

## Résumé bullets (copy, trim to taste)

- Architected and built **GoTour**, a full-stack travel-booking platform — a **Java 21 / Spring Boot microservices** backend (**7 Dockerized services**: Eureka discovery, centralized config, API gateway, and 4 domain services) with a **React 19 + TypeScript** SPA.
- Implemented **stateless JWT security** validated independently by every service via a shared filter, **OpenFeign** inter-service calls with token propagation, and **schema-per-service** data ownership with **Flyway** migrations.
- Designed a **provider-agnostic payment module** (Razorpay **UPI/BHIM** + cash-on-arrival) with **server-side signature verification**, and shipped the entire stack with a single **Docker Compose** (MySQL + 7 services + storefront).
- Built the storefront with **Redux Toolkit / RTK Query** (typed, cache-invalidated data layer), route-level code-splitting, and a responsive **Tailwind** design system with light/dark themes.

## 30-second pitch

> "GoTour is a full-stack travel-booking platform I built to practice microservices
> end to end. The backend is seven Spring Boot services behind an API gateway —
> they find each other through Eureka and read config from a central config server.
> Auth is a stateless JWT the identity service issues and every service validates
> on its own. Each service owns its own database schema, and services talk over
> OpenFeign. The frontend is a React 19 + TypeScript SPA with Redux Toolkit. The
> whole thing runs with one `docker compose up`."

## Demo script (what to click, in order)

1. **Home / browse** — search + filter destinations, packages, hotels (shows catalog service).
2. **Detail page** — open a hotel, show rooms, gallery, reviews.
3. **Sign in** — `customer@gotour.com` / `Customer@123` (shows identity service + JWT).
4. **Book** — pick dates/room → checkout → traveller details → **Pay at hotel (cash)** → confirmed (shows booking + payment services, no keys needed).
5. **My bookings** — view the booking, its status, cancel flow.
6. **Admin** — sign in as `admin@gotour.com` / `Admin@123`, show the dashboard analytics, moderation, refunds (shows role-gated admin + cross-service data).

> Tip: record this as a **2–3 min screen video** and link it next to the repo — it
> always works in an interview, unlike a live demo that might cold-start.

---

## Q&A bank

**Why microservices instead of a monolith?**
To practice the patterns and get true bounded contexts — identity, catalog, booking
and engagement can evolve and scale independently. I'm honest about the tradeoff:
microservices add real complexity (discovery, config, network calls, eventual
consistency) that a monolith avoids; for a project this size a modular monolith
would also be defensible. I chose it deliberately to demonstrate the architecture.

**How do services find each other?**
**Eureka** (service-registry). Each service registers on startup; the API gateway
routes with `lb://service-id`, so it load-balances across instances by logical name
rather than hardcoded hosts.

**How is configuration managed?**
A **Spring Cloud Config Server**. Every service's real config (datasource, JPA,
Flyway, JWT, gateway routes, CORS, payments) lives centrally; each service only
carries its name and a pointer to the config server. One place to change, no
config drift.

**How does authentication work across services?**
The **identity service** is the token issuer — BCrypt passwords, a
`DaoAuthenticationProvider`, and it mints an **HS512 JWT** (access + rotating
refresh). Every other service is a **resource server**: a shared filter in
`common-lib` validates the same signed token, so there's **no shared session or
central auth lookup** on each request. Admin routes require `ROLE_ADMIN`.

**How do booking and catalog communicate?**
Synchronously over **OpenFeign** (through discovery). Booking calls catalog to read
the authoritative price and to reserve seats/rooms, and it **propagates the caller's
JWT** so the downstream call is authenticated. Payment ↔ booking is in-process
(same service) behind a client interface, so the boundary stays explicit.

**Why a schema per service?**
Data ownership and loose coupling — a service can only reach its own data, there are
**no cross-service joins**, and each service migrates its own schema with Flyway. It
keeps services independently deployable.

**How do you keep the charge amount trustworthy?**
The payment `initiate` call reads the amount **from the booking on the server**, never
from the request body — a tampered client can't change what's charged.

**How is a payment verified?**
`initiate` creates a provider order; the provider returns a signed payment id; on
`verify` the server **recomputes the HMAC-SHA256 signature** (`order_id|payment_id`)
and only marks the booking paid if it matches. Adding a provider is one
`PaymentGateway` implementation + a config switch — the API and flow don't change.

**How do you prevent overselling inventory?**
Seats/rooms are **reserved in catalog before** the booking row is written, inside a
transaction — if reservation fails the whole thing rolls back and nothing is held.
Cancellation releases inventory back.

**How would you deploy / scale this in production?**
Containers behind an orchestrator (Kubernetes) — the stateless services scale
horizontally; config via the config server + a secrets manager; a managed MySQL;
add observability (metrics, centralized logs, distributed tracing). For this repo I
ship a single Docker Compose that runs the whole stack on one host.

**What would you improve next?**
Event-driven messaging (e.g. Kafka) for cross-service events instead of synchronous
Feign; Resilience4j circuit breakers + retries; distributed tracing
(Micrometer/OpenTelemetry); move the refresh token to an HttpOnly cookie; and
contract tests between services.

**How is the frontend organized?**
Feature-based folders; **RTK Query** owns all server state with **tag-based cache
invalidation** (a mutation invalidates exactly the queries it affects); forms use
React Hook Form + **Zod**; routes are code-split; Tailwind for a consistent,
responsive, theme-aware UI.

---

## One-line tech list (for the résumé skills section)

Java 21 · Spring Boot 3.5 · Spring Cloud (Eureka, Config, Gateway, OpenFeign) ·
Spring Security · JWT · Spring Data JPA · MySQL · Flyway · MapStruct · JUnit/Mockito ·
React 19 · TypeScript · Redux Toolkit / RTK Query · React Router · React Hook Form ·
Zod · Tailwind CSS · Vite · Vitest · Docker / Docker Compose · Razorpay
