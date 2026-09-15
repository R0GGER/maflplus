# Admin Panel

MAFL+ includes a built-in admin panel at `/admin` that lets you edit `config.yml` through a visual config builder — directly on your running instance.

## Setup

The admin panel requires two environment variables in your `docker-compose.yml`:

| Variable | Purpose |
|---|---|
| `NUXT_ADMIN_PASSWORD_HASH` | Scrypt hash of your admin password |
| `NUXT_SESSION_PASSWORD` | Random key (min 32 chars) to encrypt session cookies |

Both secrets are generated with [**maflpass**](https://github.com/R0GGER/maflpass), a lightweight Docker utility — no local Node.js or OpenSSL required.

### 1. Generate the password hash

The admin password is stored as a scrypt hash in the format `salt:derivedKey` (hex-encoded).

```bash
docker run --rm -e generate=password_hash --pull=always ghcr.io/r0gger/maflpass your-password
```

Output:

```
3bcc3fbe08603c0a9d37926070eb9819:94be2359db8900382bf5441881...
```

### 2. Generate the session password

`NUXT_SESSION_PASSWORD` encrypts the session cookie. It must be a random string of at least 32 characters.

```bash
docker run --rm -e generate=session_password --pull=always ghcr.io/r0gger/maflpass
```

Output:

```
2952f1dad4058fa80e24fb92fb99523289d081ba7012c3929007706bbaa77f08
```

### 3. Configure environment variables

Add both values to `docker-compose.yml`:

```yaml
environment:
  - NUXT_ADMIN_PASSWORD_HASH=<output from step 1>
  - NUXT_SESSION_PASSWORD=<output from step 2>
```

### 4. Start / restart the container

```bash
docker compose up -d
```

## Usage

1. Navigate to `http://your-mafl-instance/admin`
2. Enter your admin password
3. The config builder loads your current `config.yml` automatically
4. Edit settings, tabs, groups, and services using the form
5. Click **Save & Apply** — changes are validated and written to `config.yml`
6. The dashboard reloads automatically via WebSocket hot-reload

## Features

The admin panel provides a full visual config builder with the following capabilities:

| Feature | Description |
|---------|-------------|
| **Global Settings** | Title, language, theme, logo (image or text), background, overlay, search provider, optional Webradio search, Favicon API (defaults to [faviconapi.com](https://faviconapi.com)) |
| **Layout & Styles** | Grid/list columns, grid icon size & item padding, spacing, category/title/description typography |
| **Tabs** | Add, rename, reorder and delete tabs with custom icons |
| **Tab visibility** | Toggle the eye icon to hide/show a tab on the frontpage — hidden tabs remain editable in admin |
| **Tab lock** | Lock a tab to prevent accidental deletion — also protects its groups and items |
| **Collapsible tabs** | Click ▸/▾ to expand or collapse a tab's content for easier navigation |
| **Groups (categories)** | Add, rename, reorder (▲/▼) and delete groups within each tab |
| **Service items** | Full editing of title, description, link, icon, status, tags and module options |
| **Icon types** | Name (Iconify/emoji), URL, local file, or favicon — with browse links |
| **Auto-fill favicon** | When icon type is "favicon", the domain is automatically extracted from the link URL |
| **Modules** | Configure Time, DateTime Weather, Greeting, Custom HTML, IP API and OpenWeatherMap |
| **Tags** | Add and manage global tags |
| **Footer** | Configure footer text and/or HTML content |
| **SEO & Meta** | Meta tags (description, Open Graph) and robots.txt toggle |
| **Live preview** | Text logo preview updates in real-time as you type |

## Security

- Password is verified server-side using scrypt with constant-time comparison
- Session uses an encrypted httpOnly cookie (secure in production behind HTTPS)
- Login is rate-limited: max 5 failed attempts per 15 minutes per IP
- The `/api/admin/config` endpoint (which serves raw YAML including secrets) is only accessible with a valid session
- If `NUXT_ADMIN_PASSWORD_HASH` is not set, the admin panel shows a "not configured" message and login is disabled
