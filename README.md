# GoTour — Travel Booking Platform

A production-shaped, full-stack travel booking platform: browse destinations,
book curated tour packages and hotels, pay securely, and manage trips end to end.

Spring Boot microservices backend (Java 21) with a React 19 + TypeScript
storefront, consolidated into **7 deployables** and shipped with Docker Compose.

**Repository:** https://github.com/Vilas-rathod/gotour
&nbsp;·&nbsp; **Live demo:** _add your URL once deployed_
&nbsp;·&nbsp; **Deploy guide:** [DEPLOY_PLAYBOOK.md](DEPLOY_PLAYBOOK.md)

> **Tech at a glance:** Java 21 · Spring Boot 3.5 · Spring Cloud (Eureka, Config,
> Gateway, OpenFeign) · Spring Security + JWT · MySQL 8 + Flyway · React 19 ·
> TypeScript · Redux Toolkit / RTK Query · Tailwind CSS · Docker Compose.

```
React 19 SPA (nginx :8090)
        │  /api  →  API Gateway (:8080)
        │              │  discovery + routing (Eureka :8761)
        │              │  config from Config Server (:8888)
        ▼              ▼
  identity   catalog   booking   engagement          ← 4 core services
  (:8081)    (:8082)   (:8083)   (:8084)
     └──────────┴──────────┴──────────┘
                    MySQL 8   (one schema per service)
```

---

## Features

**Storefront (customer)**
- Browse **destinations, tour packages and hotels** with search, multi-facet filters, sorting and pagination
- Rich detail pages — image galleries, itineraries, room selection, ratings & reviews
- **Wishlist**, **notifications**, editable **profile**, and per-trip **itineraries**
- Multi-step **checkout** (travellers → review → payment) with **two payment methods**: Razorpay **UPI / BHIM** and **cash-on-arrival** at the hotel
- **Bookings**: view, cancel (policy-based refunds), download invoices
- **Auth**: register / login with JWT access + rotating refresh tokens, forgot / reset password
- **Responsive** across mobile, tablet and desktop, with light / dark themes

**Admin console**
- **Dashboard** with revenue and booking analytics (charts + KPIs)
- Manage **destinations, packages, hotels**; moderate **reviews**; oversee **bookings** and **payments** (issue refunds); view **customers**
- Role-gated: `/admin/**` and `/api/v1/admin/**` require `ROLE_ADMIN`

## Engineering highlights

- **Spring Cloud microservices** — Eureka service discovery, a central Config Server as the single source of truth, and an API Gateway as the one public entry point.
- **Data ownership per service** — each core service owns its own MySQL schema with its own Flyway migrations; **no cross-service joins**.
- **Stateless security** — the identity service issues HS512 JWTs; **every** service validates them independently through a shared `common-lib` filter, and the caller's token is propagated on inter-service (OpenFeign) calls.
- **Pluggable payment gateway** — adding a provider is one interface implementation + a config switch; the REST API, persistence and checkout flow are provider-agnostic.
- **Typed, cached data layer** — RTK Query with tag-based cache invalidation, route-level code-splitting, and a Tailwind design system.
- **Containerized end-to-end** — one `docker compose up` builds and starts MySQL + 7 services + the storefront, with health-gated startup ordering.
- **Tested** — backend unit tests (JUnit + Mockito), frontend component/unit tests (Vitest + Testing Library).

---

## Architecture

**3 infrastructure services + 4 core microservices** (plus `common-lib`, a shared
jar — not a running process). Each core service owns one MySQL schema; there are
no cross-service joins.

| Service | Port | Schema | Responsibility | Consolidates |
|---|---|---|---|---|
| config-server | 8888 | — | Central configuration (single source of truth) | — |
| service-registry | 8761 | — | Eureka service discovery | — |
| api-gateway | 8080 | — | Routing, CORS, security headers | — |
| **identity-service** | 8081 | `gotour_identity` | Auth (JWT), roles, user profiles | auth + user |
| **catalog-service** | 8082 | `gotour_catalog` | Destinations, packages, hotels, reviews | destination + package + hotel + review |
| **booking-service** | 8083 | `gotour_booking` | Bookings, payments (Razorpay), itineraries | booking + payment + itinerary |
| **engagement-service** | 8084 | `gotour_engagement` | Wishlist, notifications | wishlist + notification |

### Configuration is fully centralized
Every service's real configuration (port, datasource, JPA, Flyway, JWT, gateway
routes, CORS, payment settings) lives in the config server under
`infra/config-server/src/main/resources/configs/`. Each service's local
`application.yml` only carries its name and a pointer to the config server.

### Security — JWT resource servers
- **identity-service** is the token issuer. It uses a real Spring Security stack:
  a `BCryptPasswordEncoder`, a custom `UserDetailsService`
  (`GoTourUserDetailsService`) behind a `DaoAuthenticationProvider`, and an
  `AuthenticationManager` that `AuthService.login` authenticates against.
- **Every service** validates the HS512 access token via a shared filter in
  `common-lib` (`JwtAuthenticationFilter` + `JwtService`) and enforces
  authorization: public catalogue reads, authenticated writes, and
  `/api/v1/admin/**` restricted to `ROLE_ADMIN`.
- Service-to-service calls (booking → catalog) propagate the caller's token.

### Payments — two methods
Checkout offers exactly two ways to pay:

- **Razorpay (UPI / BHIM)** — an online payment. `booking-service` creates the
  order, the Razorpay Checkout widget opens (UPI / BHIM first, plus cards and
  netbanking), and the signed callback is verified server-side before the
  booking is confirmed. **Add your Razorpay key id/secret** (`RAZORPAY_KEY_ID` /
  `RAZORPAY_KEY_SECRET`) to accept online payments — they are intentionally left
  empty.
- **Cash on arrival (pay at hotel)** — **hotel bookings only**. The room is
  reserved immediately (booking `CONFIRMED`, payment `UNPAID`) and the balance
  is collected in cash at the property; nothing is captured online.

---

## Quick start (Docker — recommended)

**Prerequisites:** JDK 21, Maven 3.9+, Node 20+, Docker.

```bash
mvn -DskipTests package        # build the service jars
docker compose up -d --build   # build images and start the whole stack
```

Then open **http://localhost:8090**.

| What | URL |
|---|---|
| Storefront | http://localhost:8090 |
| API gateway | http://localhost:8080 |
| Eureka dashboard | http://localhost:8761 |
| Swagger (per service) | `http://localhost:<8081-8084>/swagger-ui.html` |

Stop it with `docker compose down` (add `-v` to also drop the database volume).

> First boot builds Flyway schemas and seeds the catalogue (destinations,
> packages, hotels, reviews) automatically. Services wait for the config server,
> Eureka and MySQL to be healthy before starting.

### Configuration & secrets
Copy `.env.example` to `.env` and adjust. Key variables:

| Variable | Default | Purpose |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `1234` | MySQL root password |
| `GOTOUR_JWT_SECRET` | dev value | HS512 signing secret (≥ 64 chars) — **change in production** |
| `GOTOUR_PAYMENT_PROVIDER` | `RAZORPAY` | Default checkout method when none is named |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | empty | Your Razorpay credentials (required for online payments) |

---

## Seeded accounts

Flyway seeds an initial admin (and a sample customer) on first start so you can
sign in and administer the platform. **Change these passwords — or delete the
sample customer — before any real deployment.**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gotour.com` | `Admin@123` |
| Customer | `customer@gotour.com` | `Customer@123` |

Admins land on `/admin`; customers land on the storefront.

---

## Tech stack

**Backend:** Java 21, Spring Boot 3.5.4, Spring Cloud 2025.0.0 (Gateway, Eureka,
Config, OpenFeign), Spring Security + JWT (JJWT 0.12), Spring Data JPA / MySQL 8,
Flyway, MapStruct, Lombok, springdoc-openapi.

**Frontend:** React 19, TypeScript, Vite, React Router 7, Redux Toolkit + RTK
Query over Axios, React Hook Form + Zod, Tailwind CSS 4, Framer Motion, served by
nginx which proxies `/api` to the gateway (same-origin, no CORS needed).

---

## Running without Docker

The backend can also run directly with Maven, but **note:** on some Windows hosts
the JDK cannot open the loopback socket-pair NIO selectors need
(`java.io.IOException: Unable to establish loopback connection`), which prevents
any Spring Boot server from starting. This is a host-level networking issue, not
a GoTour one — Docker (Linux containers) sidesteps it, which is why Compose is
the recommended path. If your host is unaffected:

```bash
# start config-server (8888) and service-registry (8761) first, then:
mvn -pl services/identity-service  spring-boot:run
mvn -pl services/catalog-service   spring-boot:run
mvn -pl services/booking-service   spring-boot:run
mvn -pl services/engagement-service spring-boot:run
mvn -pl infra/api-gateway          spring-boot:run
cd frontend && npm install && npm run dev
```

Point services at MySQL with `MYSQL_HOST/PORT/USER/PASSWORD` env vars
(defaults: `localhost:3306`, `root`/`1234`).

---

## Testing

```bash
mvn -pl services/identity-service test    # backend unit tests (Mockito)
cd frontend && npm test                    # frontend — Vitest + Testing Library
```

---

## Project structure

```
GoTour/
├── docker-compose.yml         Full stack (MySQL + 7 services + storefront)
├── docker/mysql/init.sql      Creates the 4 schemas
├── frontend/                  React 19 storefront (+ Dockerfile, nginx.conf)
├── infra/
│   ├── config-server/         Central config (serves configs/*.yml)
│   ├── service-registry/      Eureka
│   └── api-gateway/           Gateway (routes/CORS come from config server)
└── services/
    ├── common-lib/            Shared security (JWT filter), API envelope, exceptions
    ├── identity-service/      auth + user
    ├── catalog-service/       destination + package + hotel + review
    ├── booking-service/       booking + payment + itinerary
    └── engagement-service/    wishlist + notification
```
