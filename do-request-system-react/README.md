# AOT Cargo Community — DO Request & Assign (React + Tailwind + shadcn)

A real React project version of the DO Request/Assign prototype, built with
**Vite + React + Tailwind CSS + shadcn/ui-style components** (Radix primitives
under the hood). This is the "modern UI" rebuild of the single-file prototype
in `../do-request-system/` — same mock data and business logic, no OTP step,
and a shadcn design system (neutral surfaces, one accent color, Radix Dialog/
Select/Tabs, dark mode).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## What changed vs. the static prototype

- **No OTP** — logging in is a single step (username/password, or one click
  on a demo account card to log in instantly).
- **shadcn/ui-style components** — Button, Card, Input, Select, Dialog, Tabs,
  Table, Badge, etc. hand-written in the shadcn pattern (Tailwind + Radix +
  `class-variance-authority`), themed with CSS variables so light/dark mode
  is a single class toggle.
- Same domain logic and mock data as the static prototype: 5 roles (TMO,
  Freight Forwarder, Shipping, Customs, AOT), MAWB/HAWB search with automatic
  entitlement checks, warehouse document scan, TG-style Delivery Order with
  watermark + APPROVED stamp, QR handoff to Customs, and the AOT audit
  log / shipment timeline.

## Demo accounts (click a card on the login screen to log in instantly)

| Role | Username | Password |
|---|---|---|
| TMO (warehouse/approver) | `tmo.somchai` | `aot2026` |
| Freight Forwarder — Kerry | `kerry.agent` | `kerry2026` |
| Freight Forwarder — DHL | `dhl.agent` | `dhl2026` |
| Freight Forwarder — ABC | `abc.agent` | `abc2026` |
| Shipping — สมศรี | `shipping.somsri` | `ship2026` |
| Customs — พิชัย | `customs.pichai` | `cus2026` |
| AOT (oversight) | `aot.admin` | `aot2026` |

## Try these MAWB/HAWB combos (as a Forwarder, on "+ ขอ DO ใหม่")

| MAWB | HAWB | Try with | Expected result |
|---|---|---|---|
| 217-12345678 | – | Kerry | PASS_MASTER, straight to document scan |
| 217-88990011 | THB-556677 | DHL | PASS_HOUSE |
| 217-45671234 | – | Kerry | PASS_DELEGATED |
| 217-99887766 | – | ABC | PASS_DELEGATED, but Customs HELD → Pending Status |
| 217-77778888 | – | any | Ambiguous (2 shipments share this MAWB) → Manual Review |
| 217-77778888 | THB-100200 | Kerry | PASS_HOUSE |
| 217-12345678 | – | ABC/DHL | FAIL (no entitlement) → auto-rejected |
| 217-00000000 | – | any | Not found → auto-rejected |

All data lives in `localStorage` (key `aot_do_demo_react_v1`) — use "รีเซ็ต
ข้อมูลตัวอย่าง" in the TMO sidebar to reset it back to the seeded state.

## Project layout

```
src/
  lib/            mock DB (seed data) + pure domain logic (entitlement,
                   document status, decisions, QR, formatting)
  context/        AppContext.jsx — all app state + actions (React version
                   of the old vanilla-JS mutation functions)
  components/ui/  shadcn-style primitives (button, card, input, select,
                   dialog, tabs, table, badge, ...)
  components/     Login, layout (Topbar/Sidebar), dashboards for each role,
                   RequestDetail (timeline), AuditLog, DO document + QR
                   dialogs
```

This is a UI/UX design prototype only — it is not connected to any real
airline, customs, or AOT system, and the Delivery Order it renders is a
mockup (clearly watermarked as such).
