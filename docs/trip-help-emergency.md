# Emergency & Trip Disruption Management

This feature was added to the existing YatraAI frontend as a demo-ready disruption workflow. The repo in this workspace is a Vite + React app and does not contain a separate Flask backend, so the implementation uses frontend demo logic and API-ready structures instead of live server endpoints.

## Modified frontend files

- [src/pages/MyTripsPage.tsx](../src/pages/MyTripsPage.tsx)
- [src/pages/ChatbotPage.tsx](../src/pages/ChatbotPage.tsx)
- [src/lib/tripHelp.ts](../src/lib/tripHelp.ts)

## Backend status

There is no Flask backend in this project folder. The feature is implemented as a frontend demo with realistic estimated data and clearly labeled Demo/Estimated options, while keeping the integration structure ready for future live APIs.

## MySQL schema changes (ready for integration)

```sql
CREATE TABLE IF NOT EXISTS TripDisruptions (
  disruption_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id UUID NOT NULL,
  trip_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  original_details JSON,
  updated_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AlternativeOptions (
  option_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  disruption_id BIGINT NOT NULL,
  option_type VARCHAR(50) NOT NULL,
  provider VARCHAR(100),
  departure_time VARCHAR(50),
  arrival_time VARCHAR(50),
  estimated_cost DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pending',
  FOREIGN KEY (disruption_id) REFERENCES TripDisruptions(disruption_id)
);

CREATE TABLE IF NOT EXISTS TripCancellations (
  cancellation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id UUID NOT NULL,
  trip_id UUID NOT NULL,
  reason VARCHAR(100),
  cancellation_charge DECIMAL(12,2) DEFAULT 0,
  estimated_refund DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Notifications (
  notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API route changes (Flask-ready structure)

```python
@app.route('/api/trip-help', methods=['POST'])
def trip_help():
    pass

@app.route('/api/trip-disruptions/<trip_id>', methods=['GET'])
def trip_disruptions(trip_id):
    pass

@app.route('/api/trip-disruptions', methods=['POST'])
def create_trip_disruption():
    pass

@app.route('/api/alternative-options/<trip_id>', methods=['GET'])
def alternative_options(trip_id):
    pass

@app.route('/api/select-alternative', methods=['POST'])
def select_alternative():
    pass

@app.route('/api/cancel-trip', methods=['POST'])
def cancel_trip():
    pass

@app.route('/api/cancellation-details/<trip_id>', methods=['GET'])
def cancellation_details(trip_id):
    pass

@app.route('/api/notifications', methods=['GET'])
def notifications():
    pass

@app.route('/api/notifications/read', methods=['POST'])
def mark_notifications_read():
    pass
```

Notes:
- Protect all routes with login/session checks.
- Ensure only the authenticated user can access their own trip data.
- Validate all POST payloads and never expose raw database or secret API errors.

## Required environment variables

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GOOGLE_MAPS_API_KEY=
OPENWEATHER_API_KEY=
GEMINI_API_KEY=
```

If the API key is not available, the app falls back to demo/estimated values and labels them clearly as such.

## How to run the feature in VS Code

1. Open the workspace folder in VS Code.
2. Open the terminal in the project folder.
3. Run:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

4. Open the app at http://localhost:4173
5. Go to My Trips and click the Trip Help / Emergency Assistance button.
6. Choose a disruption type: Flight Problem, Train Problem, Hotel Problem, Cancel My Trip, Emergency Assistance, or Other Travel Problem.
7. Review the demo alternatives, cancellation summary, or emergency guidance.

## Where the feature appears in the site

The new feature appears inside the existing My Trips page, within each active trip card:

- The Trip Help / Emergency Assistance button sits on the right side of each trip card.
- A warning banner appears at the top of the trip card when a disruption is triggered.
- The feature opens in a modal with premium travel-style cards and actions.
- The AI chat still responds to disruption prompts such as flight delay, cancelled train, hotel issue, emergency, or trip cancellation.

## Notes

- Live flight/train/hotel and refund data are intentionally labeled as Demo/Estimated unless a real booking provider is connected.
- The design keeps the original YatraAI app intact and adds the emergency workflow without removing existing features.
