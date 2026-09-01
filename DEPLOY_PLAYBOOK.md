# GoTour — Deploy Playbook (VM backend + Vercel frontend)

Take the full **7-service Spring Cloud stack + MySQL** live on a single **cloud VM**
(via the existing `docker-compose.yml`), with the **React frontend on Vercel**.

Unlike a monolith, GoTour's services discover each other through **Eureka** and read
config from the **config-server**, so they must share one private network — a single
VM running Docker Compose gives them exactly that with **zero refactor**. Render's
free tier (one sleeping process per service) does *not*, which is why we use a VM.

```
Browser ──HTTPS──▶ Vercel (React SPA, static/CDN)
                      │  calls  VITE_API_BASE_URL
                      ▼
             HTTPS ▶ Caddy / Cloudflare Tunnel  ──▶  API Gateway :8080
                                                        │ (Eureka lb://)
                      ┌─────────────────────────────────┼───────────────┐
                   identity   catalog   booking   engagement   (+ config-server, eureka)
                      └─────────────────────────────────┴───────────────┘
                                         MySQL 8   (docker volume)
                         ── all of the above run in Docker Compose on ONE VM ──
```

**Order:** VM → backend stack up → HTTPS in front of the gateway → Vercel frontend → wire CORS.

---

## What's already prepared in this repo

- **All secrets are env-driven** — `GOTOUR_JWT_SECRET`, `RAZORPAY_KEY_ID/SECRET`,
  `GOTOUR_CORS_ORIGINS`, MySQL password — nothing hardcoded (see `.env.example`).
- **`GOTOUR_CORS_ORIGINS`** is wired into the gateway container in `docker-compose.yml`.
- **`frontend/vercel.json`** — Vite build + SPA routing for Vercel.
- Gateway health check: **`/actuator/health`** (already exposed).
- Payments: add `RAZORPAY_KEY_ID/SECRET` to go live; Cash-on-arrival needs no keys.

---

## Phase 1 — Provision the VM

You need Docker + ~4 GB RAM free (7 JVMs + MySQL). Good **free** option:
**Oracle Cloud Always-Free Ampere A1** (ARM, up to 4 vCPU / 24 GB RAM — plenty).
All base images used here (`eclipse-temurin:21-jre`, `mysql:8.0`, `nginx`, `node`)
are multi-arch, so they build/run natively on ARM.

On the VM (Ubuntu example):

```bash
# Install Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-login after this
# Install JDK 21 + Maven + Node 20 (to build the jars/frontend on the VM)
sudo apt-get update && sudo apt-get install -y openjdk-21-jdk maven nodejs npm git
# Open the ports you'll expose (or use a cloud firewall / security list):
#   80, 443 (Caddy),  and 8090 only if you also want the VM to serve the SPA
```

> Oracle Cloud: also open the ports in the instance's **VCN Security List / NSG**,
> not just the OS firewall — this trips everyone up.

## Phase 2 — Bring up the backend stack

```bash
git clone <your-repo-url> gotour && cd gotour     # or scp the folder up

cp .env.example .env
# Edit .env and set REAL values:
#   MYSQL_ROOT_PASSWORD=<strong-password>
#   GOTOUR_JWT_SECRET=<64+ random chars>
#   RAZORPAY_KEY_ID=<your key>      RAZORPAY_KEY_SECRET=<your secret>
#   GOTOUR_CORS_ORIGINS=https://<your-app>.vercel.app   (set/confirm in Phase 5)

mvn -DskipTests package          # build the 7 service jars
docker compose up -d --build     # build images + start the whole stack
```

Wait ~2 min, then confirm the API is live (services register with Eureka after ~90 s):

```bash
curl -s http://localhost:8080/actuator/health
curl -s "http://localhost:8080/api/v1/destinations?page=0&size=1"
```

## Phase 3 — Put HTTPS in front of the gateway

Vercel serves the frontend over **HTTPS**, so a browser there **cannot** call an
`http://` backend (mixed content is blocked). Give the gateway a real HTTPS URL.
Easiest is **Caddy** (automatic Let's Encrypt) — point a DNS `A` record
`api.yourdomain.com` at the VM's IP first, then:

```
# /etc/caddy/Caddyfile
api.yourdomain.com {
    reverse_proxy 127.0.0.1:8080
}
```

```bash
sudo apt-get install -y caddy && sudo systemctl restart caddy
```

Now `https://api.yourdomain.com/api/v1/destinations` works over TLS.

> **No domain?** Use a **Cloudflare Tunnel** (`cloudflared`) — it gives a free
> `https://<name>.trycloudflare.com` (or a named tunnel on your CF domain) with no
> open inbound ports and no certificates to manage. Point it at `localhost:8080`.

## Phase 4 — Frontend on Vercel

1. Push the repo to **GitHub** (Vercel deploys from a repo).
2. vercel.com → **Add New → Project** → import the repo → pick **Hobby (free)**.
3. **Root Directory = `frontend`** (framework auto-detects **Vite**; `vercel.json`
   handles the build + SPA routing).
4. Add a Project **Environment Variable**:
   `VITE_API_BASE_URL = https://api.yourdomain.com/api`   *(note: ends in `/api`, no trailing slash)*
5. **Deploy**, then copy the production URL, e.g. `https://your-app.vercel.app`.

> **Alternative that avoids CORS entirely:** instead of `VITE_API_BASE_URL`, leave
> the frontend on its default `/api` and add a rewrite to `vercel.json`:
> `{ "source": "/api/:path*", "destination": "https://api.yourdomain.com/api/:path*" }`.
> Vercel then proxies `/api` to your backend server-side, so the browser only ever
> talks to Vercel and no CORS/mixed-content applies. (Backend must still be HTTPS.)

## Phase 5 — Wire CORS and finish

On the VM, set the gateway's allowed origin to the **exact** Vercel production URL:

```bash
# in .env
GOTOUR_CORS_ORIGINS=https://your-app.vercel.app
# apply it (only the gateway needs a restart):
docker compose up -d api-gateway
```

Open the Vercel URL — data should load, sign-in should work, and checkout should
show **UPI / BHIM** (+ **Pay at hotel** on hotel bookings).

---

## Reference — environment variables (VM `.env`)

| Variable | Example | Notes |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | strong password | MySQL root; data persists in a docker volume |
| `GOTOUR_JWT_SECRET` | 64+ random chars | HS512 signing secret — **must change** |
| `GOTOUR_CORS_ORIGINS` | `https://your-app.vercel.app` | Exact frontend origin, no trailing slash |
| `GOTOUR_PAYMENT_PROVIDER` | `RAZORPAY` | Default checkout method |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | your keys | Needed for online (UPI/BHIM) payments |

**Vercel project env:** `VITE_API_BASE_URL = https://api.yourdomain.com/api`

---

## Gotchas (check these first)

| # | Trap | Fix |
|---|---|---|
| A | Frontend loads but no data, console shows mixed-content/`blocked:mixed-content` | Backend must be **HTTPS** (Phase 3), not `http://<ip>` |
| B | 403 "Invalid CORS request" | `GOTOUR_CORS_ORIGINS` must be the **exact** Vercel prod origin; preview/`-git-` URLs won't match |
| C | 503s for ~90 s after `up` | Services are still registering with Eureka — wait, then retry |
| D | Out-of-memory / services restart | VM needs ~4 GB free; give each JVM room (compose already sets `MaxRAMPercentage`) |
| E | Oracle Cloud port unreachable | Open the port in the **VCN Security List/NSG**, not just `ufw` |
| F | Cloud firewall blocks 80/443 | Allow 80+443 for Caddy's TLS challenge and traffic |
| G | Razorpay "not configured" at checkout | Set `RAZORPAY_KEY_ID/SECRET` in `.env`, then `docker compose up -d booking-service` |

---

## Notes

- **Database:** MySQL runs inside compose on the VM (data in the `mysql-data`
  volume). Prefer managed? Point the services at **Aiven** MySQL instead
  (create the 4 schemas `gotour_identity/catalog/booking/engagement`) and set
  `MYSQL_HOST/PORT/USER/PASSWORD` — but on-VM MySQL is simpler and free.
- **Keep-alive:** a VM doesn't idle-sleep like Render's free tier, so no ping is
  needed — just make sure the VM instance stays running.
- **Seed data / test bookings:** to reset to a clean seeded DB,
  `docker compose down -v && docker compose up -d --build`.
