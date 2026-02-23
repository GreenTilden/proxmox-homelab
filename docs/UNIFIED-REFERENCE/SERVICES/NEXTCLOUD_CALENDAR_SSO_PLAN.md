# Nextcloud, Calendar Sync & SSO Integration Plan

## Current Infrastructure Status

### What's Already Running

| Service | Location | Status | Auth |
|---------|----------|--------|------|
| **Authelia** | 192.168.0.99:9091 | Healthy | - |
| **Authelia Portal** | https://auth.darrenarney.com | Working | TOTP 2FA |
| **Nextcloud** | 192.168.0.99:8090 | Running | Local only |
| **Tandoor** | 192.168.0.99:8080 | Running | Local only |

### Authelia Configuration (Already Working)
- **User**: `darney` (Darren Arney)
- **Email**: darren.arney@gmail.com
- **2FA**: TOTP enabled (30 second period)
- **Config**: `/opt/authelia/config/configuration.yml`
- **Users DB**: `/opt/authelia/config/users_database.yml`

### Protected Domains (via external reverse proxy)
- `*.darrenarney.com` → requires 2FA
- `vault.darrenarney.com` → bypass (uses own auth)
- `sync.darrenarney.com` → one factor only

### Reverse Proxy (192.168.0.250 - Frontend Server)
- **DNS Target**: 47.227.64.28 (home public IP, port forwarded)
- **Software**: Nginx 1.18.0 (Ubuntu) on CT 100
- **Config**: `/etc/nginx/sites-available/all-sites`
- **Authelia Snippets**: `/etc/nginx/snippets/authelia-*.conf`
- **Domains handled**: auth, home, weather, ha, vault, sync, podcast
- **Let's Encrypt**: Certs in `/etc/letsencrypt/live/`

---

## Goals

1. **Centralized SSO for Nextcloud & Tandoor**
   - Login once with 2FA at auth.darrenarney.com
   - Access nextcloud.darrenarney.com and tandoor.darrenarney.com without re-entering passwords
   - No more hunting for credentials in 1Password

2. **Calendar Aggregation in Nextcloud**
   - Import Darren's work Outlook calendar (read-only)
   - Import Darren's personal Google calendar
   - Import wife's calendar (when ready)
   - Single source of truth for family scheduling

3. **Dashboard Calendar Integration**
   - Display aggregated calendars on 192.168.0.250 frontend
   - Show in CalendarWidget and UpcomingEventsCard
   - Replace localStorage-only calendar with live data

---

## Phase 1: Add Nextcloud & Tandoor to SSO

### 1.1 DNS Configuration
Add DNS records pointing to 47.227.64.28 (your home public IP):
- `nextcloud.darrenarney.com` → 47.227.64.28
- `tandoor.darrenarney.com` → 47.227.64.28
- `recipes.darrenarney.com` → 47.227.64.28 (alias for Tandoor)

### 1.2 SSL Certificates
On 192.168.0.250, get Let's Encrypt certs:
```bash
certbot certonly --nginx -d nextcloud.darrenarney.com
certbot certonly --nginx -d tandoor.darrenarney.com
# Or add to existing cert:
certbot --expand -d home.darrenarney.com -d nextcloud.darrenarney.com -d tandoor.darrenarney.com
```

### 1.3 Nginx Configuration (192.168.0.250)
Add to `/etc/nginx/sites-available/all-sites`:

```nginx
# ------ Nextcloud (nextcloud.darrenarney.com) - Protected ------
server {
    listen 443 ssl;
    server_name nextcloud.darrenarney.com;

    ssl_certificate /etc/letsencrypt/live/nextcloud.darrenarney.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nextcloud.darrenarney.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Authelia
    include /etc/nginx/snippets/authelia-location.conf;

    location / {
        include /etc/nginx/snippets/authelia-authrequest.conf;

        proxy_pass http://192.168.0.99:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Nextcloud-specific
        client_max_body_size 10G;
        proxy_request_buffering off;
        proxy_read_timeout 3600s;
    }

    # CalDAV/CardDAV well-known redirects
    location /.well-known/carddav {
        return 301 $scheme://$host/remote.php/dav;
    }
    location /.well-known/caldav {
        return 301 $scheme://$host/remote.php/dav;
    }
}

# ------ Tandoor Recipes (tandoor.darrenarney.com) - Protected ------
server {
    listen 443 ssl;
    server_name tandoor.darrenarney.com recipes.darrenarney.com;

    ssl_certificate /etc/letsencrypt/live/tandoor.darrenarney.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tandoor.darrenarney.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Authelia
    include /etc/nginx/snippets/authelia-location.conf;

    location / {
        include /etc/nginx/snippets/authelia-authrequest.conf;

        proxy_pass http://192.168.0.99:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Also add to the HTTP redirect block:
```nginx
server {
    listen 80;
    server_name nextcloud.darrenarney.com tandoor.darrenarney.com recipes.darrenarney.com;
    return 301 https://$host$request_uri;
}
```

### 1.3 Authelia ACL Update
Already configured - `*.darrenarney.com` requires 2FA.

### 1.4 Nextcloud Trusted Domains
```bash
docker exec nextcloud-app-1 php occ config:system:set trusted_domains 1 --value=nextcloud.darrenarney.com
docker exec nextcloud-app-1 php occ config:system:set overwriteprotocol --value=https
```

---

## Phase 2: Calendar Aggregation in Nextcloud

### 2.1 Install Nextcloud Calendar App
```bash
docker exec nextcloud-app-1 php occ app:install calendar
docker exec nextcloud-app-1 php occ app:enable calendar
```

### 2.2 Import Google Calendar (Personal)

**Option A: CalDAV Subscription (Read-Only, Recommended)**
1. In Google Calendar → Settings → calendar → Integrate calendar
2. Copy "Secret address in iCal format"
3. In Nextcloud Calendar → Settings → Add subscription (URL)
4. Paste iCal URL → Auto-refreshes every few hours

**Option B: Google Calendar Sync (Read/Write)**
1. Nextcloud → Apps → Google Integration
2. OAuth connect to Google account
3. Enable calendar sync

### 2.3 Import Outlook/Work Calendar (Read-Only)

**For Microsoft 365/Outlook.com:**
1. Outlook.com → Calendar → Settings → Shared calendars
2. Publish calendar → Create ICS link
3. Nextcloud Calendar → Add subscription → Paste URL

**For Corporate Outlook (Exchange):**
- May need IT to enable external calendar sharing
- Or use Outlook app → File → Account Settings → Internet Calendars → New

**Timezone Handling:**
- Nextcloud respects iCal VTIMEZONE data
- Unlike Notion Calendar, it properly handles events from different timezones
- Events display in YOUR timezone, not the organizer's

### 2.4 Wife's Calendar
Same process - she subscribes her calendar (Google/Outlook) to Nextcloud, or:
- Create shared family calendar in Nextcloud
- Both sync to it via CalDAV on phones

---

## Phase 3: Dashboard Calendar Integration

### 3.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (192.168.0.250)              │
│  ┌──────────────────┐    ┌────────────────────────┐    │
│  │  CalendarWidget  │    │  UpcomingEventsCard    │    │
│  └────────┬─────────┘    └───────────┬────────────┘    │
│           │                          │                  │
│           └──────────┬───────────────┘                  │
│                      ▼                                  │
│           ┌─────────────────────┐                       │
│           │ useCalendarData.ts  │                       │
│           │ (CalDAV client)     │                       │
│           └──────────┬──────────┘                       │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Nextcloud (192.168.0.99:8090)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │               CalDAV Server                       │  │
│  │  /remote.php/dav/calendars/admin/                │  │
│  │  ├── personal/      (local events)               │  │
│  │  ├── google-cal/    (subscribed)                 │  │
│  │  └── outlook-work/  (subscribed)                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Backend: Nextcloud CalDAV Endpoint

CalDAV URLs:
- **Calendar list**: `https://nextcloud.darrenarney.com/remote.php/dav/calendars/{user}/`
- **Events (VEVENT)**: `https://nextcloud.darrenarney.com/remote.php/dav/calendars/{user}/{calendar}/`

Authentication options:
1. **App Password**: Generate in Nextcloud → Settings → Security → App passwords
2. **Basic Auth**: Username + app password (base64 encoded)

### 3.3 Frontend Changes

**New composable**: `useNextcloudCalendar.ts`
```typescript
// Fetch events from Nextcloud CalDAV
// Parse iCalendar (.ics) format
// Convert to CalendarEvent type
// Cache locally with TTL
// Fallback to localStorage if Nextcloud unreachable
```

**Update `useCalendarData.ts`**:
- Keep localStorage as local cache/fallback
- Add Nextcloud sync on mount and interval
- Merge local events with remote calendar events
- Mark events with source: 'local' | 'google' | 'outlook' | 'nextcloud'

**Display in components**:
- Show calendar source as colored dot/badge
- Read-only indicator for subscribed calendars
- "Last synced" timestamp

### 3.4 Required Libraries
```bash
npm install ical.js       # iCalendar parsing
npm install tsdav         # CalDAV client (optional, can use fetch)
```

---

## Phase 4: Mobile Sync (Optional)

### iOS/Android Native Calendar Apps
- Add account → CalDAV
- Server: `nextcloud.darrenarney.com`
- Path: `/remote.php/dav`
- Username: nextcloud username
- Password: app password

### Nextcloud Mobile App
- Install Nextcloud app
- Server: `https://nextcloud.darrenarney.com`
- Login options:
  1. Use "Log in with Authelia" button for SSO
  2. Or use local admin account with app password (more secure)
- **Important**: `allow_multiple_user_backends` must be enabled for mobile apps to work
  ```bash
  docker exec nextcloud-app-1 php occ config:app:set user_oidc allow_multiple_user_backends --value=1
  ```
- Create app passwords in Settings → Security → Devices & sessions

---

## Implementation Order

### Session 1: Planning & Prep ✅
- [x] Document current infrastructure
- [x] Create this plan
- [x] Verify VPS access for reverse proxy changes
- [x] Test Nextcloud container health

### Session 2: SSO Integration ✅ (Completed 2026-01-18)
- [x] Add DNS records for nextcloud/tandoor subdomains
- [x] Configure nginx for new subdomains (SSL via certbot)
- [x] Configure Nextcloud trusted domains
- [x] Configure Authelia as OIDC provider
- [x] Install user_oidc app in Nextcloud
- [x] Configure OIDC client with Authelia
- [x] Test SSO flow end-to-end (web works)
- [x] Enable multiple_user_backends for mobile app support

### Session 3: Apps & Recipe Integration ✅ (Completed 2026-01-18)
- [x] Install Nextcloud Calendar app
- [x] Install Nextcloud Tasks app
- [x] Install Nextcloud Cookbook app
- [x] Install Nextcloud Deck app
- [x] Fix mobile app nginx bypass for Login Flow v2
- [x] Configure Tandoor behind Authelia
- [ ] Add Google calendar subscription (user to configure)
- [ ] Add Outlook calendar subscription (user to configure)
- [ ] Create family shared calendar

### Session 4: Dashboard Integration (Future)
- [ ] Create useNextcloudCalendar composable
- [ ] Update useCalendarData to fetch from CalDAV
- [ ] Add calendar source indicators to UI
- [ ] Test and deploy

---

## Recipe & Meal Planning

### Installed Apps
- **Nextcloud Cookbook**: Basic recipe storage, integrated with Nextcloud files
- **Tandoor**: Full meal planning with macro tracking, shopping lists

### Recommendation
- **Use Tandoor** for macro-focused meal planning (better nutrition tracking)
- **Use Cookbook** for quick recipe saves from URLs

---

## Quick Reference

### Nextcloud CLI Commands
```bash
# Install calendar
docker exec nextcloud-app-1 php occ app:install calendar

# Add trusted domain
docker exec nextcloud-app-1 php occ config:system:set trusted_domains 1 --value=nextcloud.darrenarney.com

# Create user
docker exec nextcloud-app-1 php occ user:add --display-name="Wife" wife

# List calendars (requires DAV app)
docker exec nextcloud-app-1 php occ dav:list-calendars admin
```

### CalDAV Test Requests
```bash
# List calendars
curl -u admin:APP_PASSWORD \
  https://nextcloud.darrenarney.com/remote.php/dav/calendars/admin/

# Get calendar events (PROPFIND)
curl -X PROPFIND -u admin:APP_PASSWORD \
  -H "Depth: 1" \
  https://nextcloud.darrenarney.com/remote.php/dav/calendars/admin/personal/
```

### Authelia User Management
```bash
# Add new user (edit users_database.yml)
# Generate password hash:
docker exec authelia authelia hash-password 'your-password'
```

---

## Notes

### Why Not Just Use Google/Outlook Directly?
1. **Single pane of glass**: See all calendars in one place
2. **Local control**: Data stays on your infrastructure
3. **No vendor lock-in**: Standard CalDAV protocol
4. **Privacy**: Work calendar doesn't need to touch Google

### Timezone Considerations
- Nextcloud properly handles VTIMEZONE in iCal
- All events converted to user's configured timezone
- No manual offset adjustment needed (unlike Notion Calendar)

### Security
- All external access via HTTPS
- 2FA required via Authelia
- App passwords for CalDAV (not main password)
- Internal services remain on local network

---

## Action Checklist

### Immediate (This Session or Next)

**SSO for Nextcloud & Tandoor:**
- [ ] Add DNS A records: `nextcloud.darrenarney.com` → 47.227.64.28
- [ ] Add DNS A records: `tandoor.darrenarney.com` → 47.227.64.28
- [ ] SSH to 192.168.0.250, run: `certbot certonly --nginx -d nextcloud.darrenarney.com -d tandoor.darrenarney.com`
- [ ] Add nginx server blocks to `/etc/nginx/sites-available/all-sites`
- [ ] Add HTTP redirect for new domains
- [ ] Run: `nginx -t && systemctl reload nginx`
- [ ] Configure Nextcloud trusted domain:
  ```bash
  ssh root@192.168.0.99
  docker exec nextcloud-app-1 php occ config:system:set trusted_domains 1 --value=nextcloud.darrenarney.com
  docker exec nextcloud-app-1 php occ config:system:set overwriteprotocol --value=https
  docker exec nextcloud-app-1 php occ config:system:set overwrite.cli.url --value=https://nextcloud.darrenarney.com
  ```
- [ ] Test: Visit https://nextcloud.darrenarney.com → should redirect to Authelia → 2FA → Nextcloud

**Calendar Setup in Nextcloud:**
- [ ] Install calendar app: `docker exec nextcloud-app-1 php occ app:install calendar`
- [ ] Login to Nextcloud, go to Calendar app
- [ ] Add Google calendar subscription (iCal URL)
- [ ] Add Outlook calendar subscription (ICS URL)
- [ ] Create "Family" shared calendar

### Later (Dashboard Integration)
- [ ] Create `useNextcloudCalendar.ts` composable
- [ ] Update calendar components to fetch from CalDAV
- [ ] Add source badges to calendar events
- [ ] Test and deploy

### Optional (Mobile)
- [ ] iOS: Add CalDAV account for Nextcloud
- [ ] Android: Install DAVx5 or Nextcloud app
- [ ] Wife's phone: Repeat calendar sync setup
