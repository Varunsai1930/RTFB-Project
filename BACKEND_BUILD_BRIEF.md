═══════════════════════════════════════════════════════════════════════════════
INVISIWORK — COMPLETE BACKEND BUILD BRIEF
PHASED IMPLEMENTATION PLAN — READ EVERY SECTION BEFORE WRITING CODE
═══════════════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 0 — GUIDING PRINCIPLES (READ FIRST, APPLY ALWAYS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These four principles govern every decision in this brief. When in doubt, refer
back here.

PRINCIPLE 1 — PHASE IT.
Build in three clearly separated phases. Each phase ships something functional.
Never block Phase 1 on Phase 2 design decisions. Never break Phase 1 while
building Phase 2.

PRINCIPLE 2 — KEEP THE MOCK DATA ALIVE.
The frontend's mock-data.js is a working system. Do not remove it. The frontend
must try the real API first, and silently fall back to mock data if the server
is unreachable or returns an error. This means every fetch() call in the
frontend wraps its API call in a try/catch and falls back gracefully. This
fallback stays in place through all three phases.

PRINCIPLE 3 — JWT EVERYWHERE, localStorage NOWHERE (for auth).
The current auth-guard.js checks localStorage.getItem('invisiwork-auth') === 'true'.
This is bypassable by any user. Replace it entirely with server-issued JWT
tokens. Every protected API route requires a valid JWT in the Authorization
header. The frontend stores the token in memory (a module-scoped variable), not
localStorage.

PRINCIPLE 4 — PIPELINE BEFORE DASHBOARD.
The most valuable part of InvisiWork is the data pipeline: ingest a Google Form
submission → classify it as visible or invisible work → compute IWR, BCS, and
PII. Build and test this pipeline completely before building any manager-facing
analytics views.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 STACK (must be running before Phase 2 begins):
  - Language:    Python 3.11+
  - Framework:   Flask 3.x
  - Database:    MongoDB (via PyMongo or MongoEngine)
  - Auth:        PyJWT for token signing/verification
  - Password:    bcrypt for hashing
  - CORS:        flask-cors
  - Env vars:    python-dotenv (.env file, never committed)
  - Dev server:  Flask built-in dev server (port 5000)

PHASE 2 STACK (adds to Phase 1, never replaces):
  - Google Sheets API: google-auth, google-api-python-client
  - Form Webhook:      Google Apps Script → HTTP POST to Flask endpoint
  - Scheduler:         APScheduler (in-process) for periodic Sheets polling

PHASE 3 STACK (adds to Phase 1+2, never replaces):
  - Relational DB: MySQL 8.x via SQLAlchemy
  - Analytics UI:  Plotly Dash (separate Flask app or Blueprint)
  - ORM:           SQLAlchemy 2.x

DIRECTORY STRUCTURE:
  invisiwork-backend/
  ├── app/
  │   ├── __init__.py          ← Flask app factory
  │   ├── config.py            ← config classes (Dev, Prod, Test)
  │   ├── extensions.py        ← PyMongo, bcrypt, CORS instances
  │   ├── auth/
  │   │   ├── __init__.py
  │   │   ├── routes.py        ← /api/auth/register, /login, /refresh, /logout
  │   │   ├── models.py        ← User document schema
  │   │   └── utils.py         ← generate_token(), decode_token(), require_auth()
  │   ├── activities/
  │   │   ├── __init__.py
  │   │   ├── routes.py        ← /api/activities/* endpoints
  │   │   ├── models.py        ← Activity document schema
  │   │   └── classifier.py    ← classify_activity() function
  │   ├── metrics/
  │   │   ├── __init__.py
  │   │   ├── routes.py        ← /api/metrics/* endpoints
  │   │   └── calculator.py    ← compute_iwr(), compute_bcs(), compute_pii()
  │   ├── pipeline/            ← Phase 2
  │   │   ├── __init__.py
  │   │   ├── sheets.py        ← Google Sheets reader
  │   │   ├── webhook.py       ← POST /api/pipeline/ingest
  │   │   └── scheduler.py     ← APScheduler setup
  │   └── manager/             ← Phase 3
  │       ├── __init__.py
  │       └── routes.py        ← /api/manager/* team endpoints
  ├── tests/
  │   ├── test_auth.py
  │   ├── test_classifier.py
  │   ├── test_metrics.py
  │   └── test_pipeline.py
  ├── .env.example
  ├── .env                     ← never commit this
  ├── requirements.txt
  └── run.py                   ← entry point

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — ENVIRONMENT VARIABLES (.env)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a .env.example file (committed) and a .env file (gitignored).

  FLASK_ENV=development
  FLASK_SECRET_KEY=<random 64-char hex string>
  JWT_SECRET_KEY=<different random 64-char hex string>
  JWT_ACCESS_EXPIRY_MINUTES=60
  JWT_REFRESH_EXPIRY_DAYS=7

  # MongoDB
  MONGO_URI=mongodb://localhost:27017/invisiwork

  # Google Sheets (Phase 2)
  GOOGLE_SERVICE_ACCOUNT_JSON=./credentials/service_account.json
  SHEETS_SPREADSHEET_ID=<your spreadsheet id>
  SHEETS_POLL_INTERVAL_SECONDS=300

  # MySQL (Phase 3)
  MYSQL_URI=mysql+pymysql://user:password@localhost:3306/invisiwork_analytics

NEVER hardcode any of these values in source files. Every config value is read
via os.environ or the python-dotenv loaded .env file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — PHASE 1: FLASK + MONGODB + JWT AUTH + CORE API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1 goal: A running Flask server that the existing frontend can talk to.
By the end of Phase 1, every frontend page that currently reads from mock-data.js
can instead receive real data from the API — with mock data as automatic fallback.

─────────────────────────────────────────────────────────────────────────────
3.1 MONGODB DOCUMENT SCHEMAS
─────────────────────────────────────────────────────────────────────────────

Collection: users
{
  "_id":           ObjectId,
  "email":         String (unique, indexed),
  "password_hash": String (bcrypt),
  "name":          String,
  "role":          "developer" | "manager",
  "team_id":       String (optional, links developers to a manager's team),
  "created_at":    ISODate,
  "last_login":    ISODate
}

Collection: activities
{
  "_id":           ObjectId,
  "user_id":       ObjectId (ref: users._id, indexed),
  "date":          ISODate (indexed),
  "category":      String  ← one of the 14 categories from the frontend spec
  "work_type":     "visible" | "invisible"  ← computed by classifier.py
  "duration_min":  Number (minutes logged)
  "description":   String (optional free text)
  "source":        "manual" | "google_form"
  "created_at":    ISODate
}

Collection: metrics_cache
{
  "_id":           ObjectId,
  "user_id":       ObjectId (ref: users._id, indexed),
  "week_start":    ISODate (Monday of that ISO week, indexed)
  "iwr":           Number (0–100, two decimal places)
  "bcs":           Number (0–100, two decimal places)
  "pii":           Number (0–100, two decimal places)
  "total_hours":   Number
  "invisible_hours": Number
  "visible_hours": Number
  "computed_at":   ISODate
}

Index compound: { user_id: 1, week_start: -1 } on metrics_cache for fast
weekly lookups per user.

─────────────────────────────────────────────────────────────────────────────
3.2 AUTH ROUTES  (/api/auth/*)
─────────────────────────────────────────────────────────────────────────────

POST /api/auth/register
  Request:  { name, email, password, role }
  Behavior:
    - Validate email format and password length (min 8 chars).
    - Check email uniqueness. Return 409 if taken.
    - Hash password with bcrypt (cost factor 12).
    - Insert user document.
    - Return 201 with { message: "Account created" }. Do NOT return a token here.
      Force the user to log in explicitly so there's no auto-login footgun.

POST /api/auth/login
  Request:  { email, password }
  Behavior:
    - Find user by email. Return 401 if not found (use a generic message —
      never reveal whether it's the email or password that's wrong).
    - Verify bcrypt hash. Return 401 with the same generic message on mismatch.
    - Generate two tokens:
        access_token: JWT, payload { sub: user_id, role, name }, expires in
                      JWT_ACCESS_EXPIRY_MINUTES.
        refresh_token: JWT, payload { sub: user_id, type: "refresh" }, expires
                       in JWT_REFRESH_EXPIRY_DAYS days.
    - Update user.last_login.
    - Return 200: { access_token, refresh_token, user: { name, email, role } }

POST /api/auth/refresh
  Request:  Authorization: Bearer <refresh_token>
  Behavior:
    - Decode and verify the refresh token.
    - Confirm token type is "refresh". Return 401 if not.
    - Issue a new access_token. Return 200: { access_token }.
    - Do not reissue the refresh token (sliding expiry is Phase 3 scope).

POST /api/auth/logout
  Request:  Authorization: Bearer <access_token>
  Behavior:
    - In Phase 1, return 200 { message: "Logged out" }. Token invalidation via
      a blocklist (Redis or MongoDB set) is a Phase 3 hardening task.
    - The frontend is responsible for discarding both tokens from memory.

GET /api/auth/me
  Request:  Authorization: Bearer <access_token>
  Behavior:
    - Decode access_token. Return 401 if expired or invalid.
    - Return 200: { user_id, name, email, role }

─────────────────────────────────────────────────────────────────────────────
3.3 JWT MIDDLEWARE (require_auth decorator)
─────────────────────────────────────────────────────────────────────────────

Implement require_auth as a Python decorator in app/auth/utils.py.

Usage on any protected route:
  @app.route('/api/activities', methods=['GET'])
  @require_auth
  def get_activities():
      user_id = g.current_user['sub']
      ...

Decorator behavior:
  1. Extract the Authorization header. Return 401 if missing.
  2. Strip "Bearer " prefix. Return 401 if malformed.
  3. Call PyJWT decode with JWT_SECRET_KEY and algorithms=["HS256"].
  4. On ExpiredSignatureError: return 401 { error: "token_expired" }.
  5. On InvalidTokenError: return 401 { error: "token_invalid" }.
  6. On success: set flask.g.current_user = decoded payload. Call the route.

Also implement require_manager role check:
  @require_auth
  @require_manager
  def manager_only_route():
      ...
  require_manager checks g.current_user['role'] == 'manager'.
  Returns 403 if not.

─────────────────────────────────────────────────────────────────────────────
3.4 ACTIVITY ROUTES (/api/activities/*)
─────────────────────────────────────────────────────────────────────────────

All routes require @require_auth.

POST /api/activities
  Request:  { category, duration_min, date, description? }
  Behavior:
    - Validate category against the 14 allowed categories (see Work Classification
      in the frontend brief). Return 422 if invalid.
    - Validate duration_min: integer, 1–480. Return 422 if out of range.
    - Call classifier.classify_activity(category) → "visible" | "invisible".
    - Insert activity document with user_id = g.current_user['sub'].
    - Invalidate (delete) any cached metrics_cache entry for this user's
      current week so the next GET /metrics recomputes fresh.
    - Return 201: { activity_id, work_type, message: "Activity logged" }

GET /api/activities
  Query params: ?week=YYYY-WNN (ISO week, e.g. 2025-W14), ?limit=50, ?offset=0
  Behavior:
    - If week param present, filter activities for that user in that ISO week.
    - Otherwise return the most recent `limit` activities for this user.
    - Return 200: { activities: [...], total: N }

GET /api/activities/<activity_id>
  Behavior: Return single activity. Return 404 if not found or if user_id mismatch
  (a developer can only see their own activities).

DELETE /api/activities/<activity_id>
  Behavior:
    - Find activity. Return 404 if not found.
    - Return 403 if activity.user_id != g.current_user['sub']
      AND g.current_user['role'] != 'manager'.
    - Delete it. Invalidate metrics cache for that user/week.
    - Return 200: { message: "Activity deleted" }

─────────────────────────────────────────────────────────────────────────────
3.5 WORK CLASSIFIER (app/activities/classifier.py)
─────────────────────────────────────────────────────────────────────────────

This is the core domain logic. Implement as a pure function with no side effects.

VISIBLE_CATEGORIES = {
    "Feature Development",
    "Bug Fix",
    "Formal Testing / QA"
}

INVISIBLE_CATEGORIES = {
    "Code Review",
    "Debugging (non-ticket)",
    "Peer Help",
    "Mentoring",
    "Knowledge Sharing",
    "Documentation",
    "Production Incident Response",
    "Learning / Research",
    "Refactoring",
    "Infrastructure",
    "Meetings",
    "Planning"
}

def classify_activity(category: str) -> str:
    """
    Returns 'visible' or 'invisible'.
    Raises ValueError if category is not in either set.
    Case-insensitive match (strip and lower before lookup).
    """

ALL_CATEGORIES = VISIBLE_CATEGORIES | INVISIBLE_CATEGORIES
Export this set for use in route validation.

─────────────────────────────────────────────────────────────────────────────
3.6 METRICS ROUTES (/api/metrics/*)
─────────────────────────────────────────────────────────────────────────────

All routes require @require_auth.

GET /api/metrics/current
  Behavior:
    - Determine current ISO week (Monday–Sunday).
    - Check metrics_cache for this user + week. If found and computed_at is
      less than 1 hour ago: return cached values.
    - Otherwise: fetch all activities for this user in the current week.
      Call compute_all_metrics() → { iwr, bcs, pii, total_hours,
      invisible_hours, visible_hours }.
    - Upsert into metrics_cache.
    - Return 200: { iwr, bcs, pii, total_hours, invisible_hours, visible_hours,
      week_start, computed_at }

GET /api/metrics/history
  Query params: ?weeks=8 (default 8, max 52)
  Behavior:
    - Return one metrics_cache entry per week for this user, going back `weeks`
      weeks from today. For weeks with no data: return zeroes (not nulls).
    - Return 200: { history: [ { week_start, iwr, bcs, pii, total_hours }, ... ] }
      Ordered oldest → newest.

─────────────────────────────────────────────────────────────────────────────
3.7 METRICS CALCULATOR (app/metrics/calculator.py)
─────────────────────────────────────────────────────────────────────────────

Implement three pure functions. These are the mathematical heart of InvisiWork.

def compute_iwr(activities: list[dict]) -> float:
    """
    IWR = (Invisible Work Hours / Total Work Hours) × 100
    If total hours is zero: return 0.0
    Round to 2 decimal places.
    Thresholds (not enforced here — apply in routes/frontend):
      > 60 = elevated, > 75 = critical
    """

def compute_bcs(activities: list[dict], iwr: float) -> float:
    """
    BCS (Burnout Correlation Score): 0–100 composite.
    Computation logic (implement all three components):

    Component A — IWR Weight (40% of BCS):
      Maps IWR linearly. IWR 0 → 0 points, IWR 100 → 40 points.

    Component B — Overwork Penalty (35% of BCS):
      Total hours in the week vs a 40-hour reference.
      If total_hours <= 40: 0 points.
      If total_hours 41–50: scale linearly from 0 to 20 points.
      If total_hours > 50: scale from 20 to 35 points (capped at 35).

    Component C — Activity Concentration (25% of BCS):
      Measures whether the developer is spending >80% of time in a single
      invisible category (a sign of being a single point of failure / overloaded).
      Count hours per invisible category. If any category > 80% of invisible hours:
      add 25 points. If any category 60–80%: add 12 points. Else: 0.

    BCS = Component A + Component B + Component C, clamped to [0, 100].
    Round to 2 decimal places.

    Thresholds (not enforced here):
      < 40 = Low Risk (green), 40–70 = Moderate (yellow), > 70 = High Risk (red)
    """

def compute_pii(activities: list[dict], iwr: float, bcs: float) -> float:
    """
    PII (Personal Impact Index): 0–100 composite contribution score.
    Rewards balanced contribution across both visible and invisible work,
    penalizes extreme imbalance or high burnout risk.

    Component A — Volume Score (40%):
      total_hours / 40 × 40, capped at 40.

    Component B — Balance Score (40%):
      Ideal IWR is 30–55 (developer is contributing meaningfully to invisible
      work without being entirely consumed by it).
      If IWR in [30, 55]: 40 points (full marks).
      If IWR < 30: scale from 0 (IWR=0) to 40 (IWR=30) linearly.
      If IWR > 55: scale from 40 (IWR=55) down to 0 (IWR=100) linearly.

    Component C — Sustainability Score (20%):
      20 - (BCS / 100 × 20). Developer is penalized proportionally to
      their burnout risk — high burnout score reduces PII.

    PII = Component A + Component B + Component C, clamped to [0, 100].
    Round to 2 decimal places.
    """

def compute_all_metrics(activities: list[dict]) -> dict:
    """
    Orchestrator. Calls the above three in order.
    Returns: { iwr, bcs, pii, total_hours, invisible_hours, visible_hours }
    activities is a list of activity dicts with at least:
      { work_type: 'visible'|'invisible', duration_min: int }
    """

─────────────────────────────────────────────────────────────────────────────
3.8 ERROR RESPONSE FORMAT
─────────────────────────────────────────────────────────────────────────────

All error responses must be JSON with a consistent shape:
  { "error": "<machine-readable code>", "message": "<human-readable string>" }

HTTP status codes to use:
  200 — OK
  201 — Created
  400 — Bad Request (malformed JSON, missing required fields)
  401 — Unauthorized (missing/expired/invalid token)
  403 — Forbidden (valid token but wrong role or resource ownership)
  404 — Not Found
  409 — Conflict (email already exists)
  422 — Unprocessable Entity (valid JSON but invalid field values)
  500 — Internal Server Error (unexpected exceptions — log, never expose stack trace)

Register a global error handler for 500:
  @app.errorhandler(Exception)
  def handle_unexpected(e):
      app.logger.error(str(e))
      return { "error": "server_error", "message": "An unexpected error occurred" }, 500

─────────────────────────────────────────────────────────────────────────────
3.9 CORS CONFIGURATION
─────────────────────────────────────────────────────────────────────────────

In development, allow: origins=["http://localhost:5500", "http://127.0.0.1:5500"]
(VS Code Live Server default port). Adjust if using a different dev server.

In production, restrict to the actual frontend domain.

Always allow: methods=["GET", "POST", "DELETE", "OPTIONS"],
              headers=["Content-Type", "Authorization"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — FRONTEND AUTH INTEGRATION (UPDATES TO EXISTING JS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are the changes to make in the frontend after Phase 1 backend is running.
Do NOT make these changes before the backend is ready.

─────────────────────────────────────────────────────────────────────────────
4.1 NEW FILE: js/api-client.js
─────────────────────────────────────────────────────────────────────────────

Create a new ES6 module that centralizes all backend communication.

  const BASE_URL = 'http://localhost:5000/api';

  // In-memory token store. NOT localStorage. Clears on page refresh (intentional
  // for security — user must log in again after a browser restart).
  let accessToken = null;
  let refreshToken = null;

  export function setTokens(access, refresh) { ... }
  export function clearTokens() { accessToken = null; refreshToken = null; }
  export function hasToken() { return accessToken !== null; }

  export async function apiFetch(path, options = {}) {
    /**
     * Wraps fetch() with:
     * 1. Automatic Authorization header injection.
     * 2. Automatic token refresh if 401 { error: 'token_expired' } received.
     * 3. Throws ApiError on non-2xx responses.
     */
  }

  export class ApiError extends Error {
    constructor(status, code, message) { ... }
  }

─────────────────────────────────────────────────────────────────────────────
4.2 REPLACE: js/auth-guard.js
─────────────────────────────────────────────────────────────────────────────

Current (insecure):
  if (localStorage.getItem('invisiwork-auth') !== 'true') { redirect to login }

Replace with:
  import { hasToken, apiFetch } from './api-client.js';

  async function guardRoute() {
    if (!hasToken()) {
      // Try GET /api/auth/me with whatever token exists.
      // If it fails (no token in memory), redirect to login.
      window.location.href = '/index.html';
      return;
    }
    try {
      const user = await apiFetch('/auth/me');
      // Optionally store name/role in a module-scoped variable for this page.
    } catch (e) {
      clearTokens();
      window.location.href = '/index.html';
    }
  }

  guardRoute();

─────────────────────────────────────────────────────────────────────────────
4.3 MOCK DATA FALLBACK PATTERN (apply to every existing JS page file)
─────────────────────────────────────────────────────────────────────────────

Every page that currently reads from MOCK_DATA should be updated to this pattern:

  import { apiFetch, ApiError } from './api-client.js';
  import { MOCK_DATA } from './mock-data.js';

  async function loadDashboardData() {
    try {
      const data = await apiFetch('/metrics/current');
      renderDashboard(data);           // uses real API data
    } catch (e) {
      console.warn('[InvisiWork] API unavailable, using mock data:', e.message);
      renderDashboard(MOCK_DATA.currentMetrics);  // silent fallback
    }
  }

Rules for the fallback:
  - Never show an error toast when falling back. Silently use mock data.
  - The renderDashboard() function must accept the same shape from both
    the API response and the mock data object. Normalize the shape in
    api-client.js if needed.
  - Log a console.warn (not console.error) so a developer knows the API
    is down, but the end user sees nothing broken.

─────────────────────────────────────────────────────────────────────────────
4.4 UPDATE: js/onboarding.js (get-started.html form)
─────────────────────────────────────────────────────────────────────────────

The onboarding form currently simulates login. Update to:
  1. On submit, POST to /api/auth/login (or /register for new users).
  2. On 200: call setTokens(access_token, refresh_token), store user name/role
     in a module-scoped variable, then redirect to dashboard.html or
     manager-dashboard.html based on role.
  3. On 401: show "Invalid email or password" inline error (not a toast).
  4. On 409: show "An account with this email already exists" inline error.
  5. On network failure: show "Could not connect to server. Please try again."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — PHASE 2: GOOGLE SHEETS PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 2 goal: Google Form responses flow automatically into MongoDB as activity
documents, fully classified, with metrics recomputed per user.

─────────────────────────────────────────────────────────────────────────────
5.1 GOOGLE FORM SETUP
─────────────────────────────────────────────────────────────────────────────

The Google Form for developer daily activity logging must contain these fields
(map to activity document fields as shown):

  Form Field                    → Document Field
  ─────────────────────────────────────────────
  Email address (built-in)      → used to look up user_id in users collection
  Date of activity              → date
  Activity category             → category (dropdown matching all 14 categories)
  Duration (minutes)            → duration_min
  Description (optional)        → description

The form must use the category names exactly as defined in classifier.py.
A mismatch will cause ingestion to fail — enforce this via form validation in
Google Apps Script before it hits the Flask endpoint.

─────────────────────────────────────────────────────────────────────────────
5.2 GOOGLE APPS SCRIPT WEBHOOK TRIGGER
─────────────────────────────────────────────────────────────────────────────

In Google Apps Script, attached to the Form:

  function onFormSubmit(e) {
    const response = e.response;
    const answers = response.getItemResponses();

    const payload = {
      email:        response.getRespondentEmail(),
      date:         answers[0].getResponse(),  // adjust indices to match form
      category:     answers[1].getResponse(),
      duration_min: parseInt(answers[2].getResponse(), 10),
      description:  answers[3]?.getResponse() || ""
    };

    UrlFetchApp.fetch("https://your-backend.com/api/pipeline/ingest", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      headers: { "X-Pipeline-Secret": "<PIPELINE_SECRET>" }
    });
  }

The X-Pipeline-Secret header prevents arbitrary POST requests to the ingest
endpoint. Store the secret in both .env and Google Apps Script properties.

─────────────────────────────────────────────────────────────────────────────
5.3 INGEST ENDPOINT (app/pipeline/webhook.py)
─────────────────────────────────────────────────────────────────────────────

POST /api/pipeline/ingest
  Authentication: X-Pipeline-Secret header (NOT JWT — this is a server-to-server call)

  Behavior:
    1. Verify X-Pipeline-Secret matches PIPELINE_SECRET env var. Return 401 if not.
    2. Validate payload: email, date, category, duration_min all present.
    3. Look up user by email in users collection. Return 404 if not found.
       (Developers must have registered before their form responses are ingested.)
    4. Validate category against ALL_CATEGORIES. Return 422 if invalid.
    5. Check for duplicate: if an activity with the same user_id, date, category,
       and duration_min already exists (ingested < 5 minutes ago): return 200 with
       { duplicate: true } — do not insert. (Prevents double-fire from Apps Script.)
    6. Call classify_activity(category) → work_type.
    7. Insert activity document with source: "google_form".
    8. Invalidate (delete) metrics_cache entry for this user's ISO week.
    9. Return 201: { activity_id, work_type }

─────────────────────────────────────────────────────────────────────────────
5.4 POLLING FALLBACK (app/pipeline/scheduler.py)
─────────────────────────────────────────────────────────────────────────────

In addition to the webhook, implement a polling job using APScheduler as a
backup for when the webhook fails (e.g. Apps Script timeout, network issue).

  from apscheduler.schedulers.background import BackgroundScheduler

  def poll_new_sheet_rows():
      """
      Reads the linked Google Sheet via the Sheets API.
      Tracks the last-processed row number in a 'pipeline_state' MongoDB
      document (collection: system_state, key: 'sheets_last_row').
      Processes any new rows since last_row.
      For each new row: run the same ingest logic as the webhook endpoint.
      Update last_row after successful processing.
      """

  scheduler = BackgroundScheduler()
  scheduler.add_job(poll_new_sheet_rows, 'interval',
                    seconds=int(os.environ['SHEETS_POLL_INTERVAL_SECONDS']))
  scheduler.start()

Start the scheduler inside the Flask app factory (app/__init__.py) after all
extensions are initialized. Ensure it does not start during test runs
(check app.testing flag).

─────────────────────────────────────────────────────────────────────────────
5.5 GOOGLE SHEETS API CLIENT (app/pipeline/sheets.py)
─────────────────────────────────────────────────────────────────────────────

  def get_sheets_service():
      """
      Authenticates using the service account JSON file at
      GOOGLE_SERVICE_ACCOUNT_JSON env path.
      Returns an authenticated Google Sheets API service resource.
      Credentials need scope: https://www.googleapis.com/auth/spreadsheets.readonly
      """

  def read_rows_from(spreadsheet_id: str, start_row: int) -> list[dict]:
      """
      Reads rows start_row onward from Sheet1 (or configured sheet name).
      Maps columns to: { email, date, category, duration_min, description }
      Returns a list of dicts ready for ingest logic.
      """

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — PHASE 3: MYSQL + MANAGER ANALYTICS + DASH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 3 goal: Managers get team-wide analytics. A read-optimized MySQL database
mirrors aggregated data for fast analytical queries. Plotly Dash provides an
internal analytics UI.

─────────────────────────────────────────────────────────────────────────────
6.1 MYSQL SCHEMA (analytics mirror)
─────────────────────────────────────────────────────────────────────────────

MySQL is for reads and analytics only. MongoDB remains the system of record.
A sync job (part of the scheduler) writes aggregated data to MySQL.

  Table: developer_weekly_metrics
    id              INT AUTO_INCREMENT PRIMARY KEY
    mongo_user_id   VARCHAR(24)    -- MongoDB ObjectId as string
    user_email      VARCHAR(255)
    user_name       VARCHAR(255)
    team_id         VARCHAR(100)
    week_start      DATE           -- Monday of the ISO week
    iwr             DECIMAL(5,2)
    bcs             DECIMAL(5,2)
    pii             DECIMAL(5,2)
    total_hours     DECIMAL(6,2)
    invisible_hours DECIMAL(6,2)
    visible_hours   DECIMAL(6,2)
    synced_at       DATETIME
    UNIQUE KEY uq_user_week (mongo_user_id, week_start)

  Table: activity_log (denormalized copy for analytics)
    id              INT AUTO_INCREMENT PRIMARY KEY
    mongo_activity_id VARCHAR(24)
    mongo_user_id   VARCHAR(24)
    user_email      VARCHAR(255)
    team_id         VARCHAR(100)
    date            DATE
    category        VARCHAR(100)
    work_type       ENUM('visible', 'invisible')
    duration_min    INT
    source          ENUM('manual', 'google_form')
    created_at      DATETIME
    INDEX idx_team_date (team_id, date)
    INDEX idx_user_date (mongo_user_id, date)

Sync job: runs every SHEETS_POLL_INTERVAL_SECONDS. Reads metrics_cache and
activities from MongoDB. Upserts into MySQL. Uses SQLAlchemy's merge() for
the upsert pattern.

─────────────────────────────────────────────────────────────────────────────
6.2 MANAGER API ROUTES (/api/manager/*)
─────────────────────────────────────────────────────────────────────────────

All routes require @require_auth and @require_manager.

GET /api/manager/team
  Behavior:
    - Return list of all developers in g.current_user's team_id.
    - For each developer: their current week's metrics from metrics_cache
      (or computed fresh if cache miss).
    - Return 200: { team: [ { user_id, name, email, iwr, bcs, pii,
      total_hours, risk_level }, ... ] }
    - risk_level is derived server-side: "low" (BCS < 40), "moderate" (40–70),
      "high" (> 70).

GET /api/manager/team/history
  Query params: ?weeks=8
  Behavior:
    - Returns aggregated team metrics per week (average IWR, BCS, PII across
      all team members). Sourced from MySQL developer_weekly_metrics for speed.
    - Return 200: { history: [ { week_start, avg_iwr, avg_bcs, avg_pii,
      high_risk_count, moderate_risk_count, low_risk_count }, ... ] }

GET /api/manager/developer/<user_id>
  Behavior:
    - Return full profile for one developer: their recent 8 weeks of metrics
      + their last 50 activities.
    - Return 403 if developer is not in the manager's team.
    - Return 200: { user, metrics_history, recent_activities }

─────────────────────────────────────────────────────────────────────────────
6.3 PLOTLY DASH ANALYTICS BOARD
─────────────────────────────────────────────────────────────────────────────

Implement as a separate Flask Blueprint mounted at /dash/ or as a standalone
Dash app on port 8050.

Charts to include:
  1. Team IWR Heatmap — each developer vs each week, color = IWR value.
     Use Plotly heatmap trace. Green (0%) → Yellow (60%) → Red (75%+).

  2. Burnout Risk Timeline — stacked area chart showing count of developers
     at each risk level (low/moderate/high) per week.

  3. Category Distribution — grouped bar chart. Each developer is a group.
     Each bar segment is an invisible work category. Shows who is carrying
     what type of invisible work.

  4. PII Ranking — horizontal bar chart, developers sorted by current week PII.
     Color encodes BCS risk level.

Data source: MySQL via SQLAlchemy (not MongoDB — this is why we have the mirror).
Access control: Dash should only be accessible with a valid manager JWT. Add a
middleware check or a Dash callback that validates the token passed as a URL
query parameter (e.g. /dash/?token=<access_token>).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — ROLE-BASED PAGE ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The frontend currently has no role separation. After Phase 1 auth is wired up,
implement role-based routing as follows.

DEVELOPER PAGES (role: "developer"):
  - dashboard.html          ← team overview (read-only, own metrics only)
  - personal-dashboard.html ← personal IWR / BCS / PII
  - weekly-summary.html     ← their own weekly breakdown
  - get-started.html        ← login / register (unauthenticated)

MANAGER PAGES (role: "manager"):
  - manager-dashboard.html  ← NEW PAGE (Phase 3): team analytics, risk flags
  - dashboard.html          ← same URL, different data rendered (see below)

ROUTING LOGIC in auth-guard.js (after replacement in Part 4.2):
  After guardRoute() resolves:
    const role = g.current_user.role (stored as a module variable)
    If current page is dashboard.html and role === 'developer':
      render developer view of dashboard.
    If current page is dashboard.html and role === 'manager':
      redirect to manager-dashboard.html.
    If current page is personal-dashboard.html and role === 'manager':
      redirect to manager-dashboard.html (managers don't have personal metrics).

TEAM_ID LOGIC:
  When a manager registers, their user_id becomes the team_id for their team.
  When a developer registers, they provide a team_id (the manager's user_id or
  a team code). The backend validates this team_id exists in the users collection
  as a manager-role account before accepting the registration.

  Add team_id field to the registration form in get-started.html for developers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — TESTING PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use pytest. Every module in app/ must have a corresponding test file.
Use mongomock or a real test MongoDB instance (test DB, not production).

tests/test_classifier.py:
  - All 14 categories classify to the correct work_type.
  - Unrecognized category raises ValueError.
  - Case-insensitive matching works.

tests/test_metrics.py:
  - IWR of 0 when all activities are visible.
  - IWR of 100 when all activities are invisible.
  - IWR rounds correctly to 2 decimal places.
  - BCS is 0 for a developer with low hours and low IWR.
  - BCS is > 70 for a developer with 55+ hours and IWR > 80.
  - PII is high for a balanced developer with 40 hours and IWR in [30, 55].
  - PII is penalized correctly for a high-BCS developer.
  - compute_all_metrics handles empty activities list (returns all zeros).

tests/test_auth.py:
  - POST /register creates a user and returns 201.
  - POST /register with duplicate email returns 409.
  - POST /login with valid credentials returns two tokens.
  - POST /login with wrong password returns 401 with generic message.
  - GET /me with valid access token returns user info.
  - GET /me with expired token returns 401 { error: "token_expired" }.
  - Protected route returns 401 with no Authorization header.
  - Protected route returns 403 when developer accesses manager-only endpoint.

tests/test_pipeline.py (Phase 2):
  - POST /pipeline/ingest with valid payload creates an activity document.
  - POST /pipeline/ingest with unknown email returns 404.
  - POST /pipeline/ingest with invalid category returns 422.
  - Duplicate detection works (same user, date, category, duration within 5 min).
  - POST /pipeline/ingest with wrong X-Pipeline-Secret returns 401.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — BUILD ORDER (EXECUTE IN EXACT SEQUENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

─── PHASE 1 ────────────────────────────────────────────────────────────────

STEP  1:  requirements.txt         ← pin all dependencies with exact versions
STEP  2:  .env.example             ← template with all required variables
STEP  3:  app/config.py            ← DevelopmentConfig, TestingConfig, ProductionConfig
STEP  4:  app/extensions.py        ← PyMongo, bcrypt, CORS — instantiated but not init'd
STEP  5:  app/__init__.py          ← create_app() factory, register blueprints, init extensions
STEP  6:  run.py                   ← entry point: create_app() + app.run()
STEP  7:  app/activities/classifier.py   ← classify_activity(), ALL_CATEGORIES, sets
STEP  8:  tests/test_classifier.py       ← write and run tests NOW before any routes
STEP  9:  app/metrics/calculator.py      ← compute_iwr(), compute_bcs(), compute_pii(), compute_all_metrics()
STEP 10:  tests/test_metrics.py          ← write and run tests NOW
STEP 11:  app/auth/models.py       ← User document schema (no ORM, just dict helpers)
STEP 12:  app/auth/utils.py        ← generate_token(), decode_token(), require_auth, require_manager
STEP 13:  app/auth/routes.py       ← /register, /login, /refresh, /logout, /me
STEP 14:  app/auth/__init__.py     ← Blueprint definition
STEP 15:  tests/test_auth.py       ← write and run tests NOW
STEP 16:  app/activities/models.py ← Activity document schema helpers
STEP 17:  app/activities/routes.py ← POST /activities, GET /activities, DELETE /activities/<id>
STEP 18:  app/activities/__init__.py ← Blueprint definition
STEP 19:  app/metrics/routes.py    ← GET /metrics/current, GET /metrics/history
STEP 20:  app/metrics/__init__.py  ← Blueprint definition
STEP 21:  js/api-client.js         ← Frontend: new API module with fallback logic
STEP 22:  js/auth-guard.js         ← Frontend: replace localStorage check with JWT check
STEP 23:  Update js/onboarding.js  ← Frontend: wire login/register form to real API
STEP 24:  Update each page JS      ← Frontend: add try/catch API calls with mock fallback

─── PHASE 2 ────────────────────────────────────────────────────────────────

STEP 25:  app/pipeline/sheets.py   ← Google Sheets API client
STEP 26:  app/pipeline/webhook.py  ← POST /api/pipeline/ingest route + Blueprint
STEP 27:  app/pipeline/scheduler.py ← APScheduler polling job
STEP 28:  tests/test_pipeline.py   ← write and run tests
STEP 29:  Google Apps Script       ← onFormSubmit trigger with UrlFetchApp call
STEP 30:  End-to-end test          ← submit a form, watch it appear in MongoDB

─── PHASE 3 ────────────────────────────────────────────────────────────────

STEP 31:  MySQL schema migration    ← create tables via SQLAlchemy create_all()
STEP 32:  MySQL sync job            ← add to scheduler: MongoDB → MySQL upsert
STEP 33:  app/manager/routes.py    ← GET /manager/team, /team/history, /developer/<id>
STEP 34:  manager-dashboard.html   ← New frontend page (mirrors frontend brief style)
STEP 35:  Plotly Dash board         ← 4 charts, manager JWT access control
STEP 36:  Role-based routing        ← Update auth-guard.js for developer/manager split
STEP 37:  Token blocklist           ← Redis or MongoDB set for logout invalidation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — ABSOLUTE QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Every route file is complete. No placeholder comments. No "TODO" stubs.

2. Every function has a docstring explaining inputs, outputs, and side effects.

3. All secrets are in .env. Zero hardcoded credentials anywhere.

4. All error responses return the standard { error, message } JSON shape.
   No HTML error pages. No stack traces in API responses.

5. All calculator functions are pure (no database calls, no side effects).
   This makes them trivially testable and reusable.

6. Tests run before any route that depends on the tested function is built.
   classifier.py tests pass before activity routes are written.
   calculator.py tests pass before metrics routes are written.

7. The frontend mock fallback is never removed. The system must work
   without a backend running, at all times, in all three phases.

8. MongoDB indexes are created in app/__init__.py on startup, not manually.
   Use ensure_index() so it's idempotent.

9. JWT tokens never contain sensitive data. The payload contains only:
   sub (user_id as string), role, name, iat, exp. No email, no password hash.

10. The backend never logs request bodies that might contain passwords.
    Log route + status code + user_id only.

═══════════════════════════════════════════════════════════════════════════════
START WITH STEP 1. Test each layer before building on top of it.
This is InvisiWork. Every endpoint must be correct before the next is written.
═══════════════════════════════════════════════════════════════════════════════
