# Umami Analytics Tracking

## Overview
This application tracks user search behavior using Umami Analytics to help understand popular rooms, buildings, and usage patterns.

## Implementation Details

### Tracking Library
All tracking functions are located in `lib/umami.ts` and provide type-safe wrappers around the Umami Analytics API.

### Events Being Tracked

#### 1. room-search
Triggered when a user searches for a specific room.

**Properties:**
- `room` (string): The room name being searched (e.g., "CM234")
- `source` (string): Where the search originated
  - `"command-search"`: From the Cmd+K command palette
  - `"room-page"`: From the room search page dropdown

**Example:**
```javascript
trackRoomSearch("CM234", "command-search");
```

#### 2. room-view
Triggered when a user successfully views detailed information about a room.

**Properties:**
- `room` (string): The room name being viewed

**Example:**
```javascript
trackRoomView("CM234");
```

#### 3. building-search
Triggered when a user searches for free rooms in a building.

**Properties:**
- `building` (string): The building code (e.g., "CM", "HA")
- `duration` (number): Minimum duration in minutes (15, 30, 60, etc.)
- `source` (string): Where the search originated
  - `"command-search"`: From the Cmd+K command palette
  - `"building-page"`: From the buildings page

**Example:**
```javascript
trackBuildingSearch("CM", 30, "building-page");
```

#### 4. free-rooms-result
Triggered when free room search results are displayed to the user.

**Properties:**
- `building` (string): The building code
- `availableRooms` (number): Number of rooms available
- `totalRooms` (number): Total number of rooms checked
- `duration` (number): Minimum duration in minutes
- `availabilityRate` (number): Calculated percentage of available rooms

**Example:**
```javascript
trackFreeRoomsResult("CM", 15, 45, 30);
// Results in: { building: "CM", availableRooms: 15, totalRooms: 45, duration: 30, availabilityRate: 33.33 }
```

## Usage Locations

### CommandSearch Component (`components/CommandSearch.tsx`)
- Tracks room searches when users select a room from the command palette
- Tracks building searches when users select a building from the command palette

### Rooms Page (`app/rooms/page.tsx`)
- Tracks room searches when users select a room from the dropdown
- Tracks room views when room details are successfully loaded

### Buildings Page (`app/buildings/page.tsx`)
- Tracks building searches when users select a building
- Tracks free room results when the API returns available rooms

## Data Privacy
- Only room names, building codes, and search metadata are tracked
- No personal information is collected
- All tracking is anonymous and aggregated by Umami
- Tracking fails gracefully if Umami is unavailable or blocked

## Testing Tracking Events

To verify tracking is working in development:

1. Open the browser console
2. Check the Network tab for requests to `umami.dakheera47.com`
3. Or add a temporary console log in `lib/umami.ts`:

```typescript
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  console.log('Tracking event:', eventName, eventData); // Add this line
  if (typeof window !== "undefined" && window.umami) {
    // ... rest of the code
  }
}
```

## Analytics Insights

With this tracking data, you can now answer questions like:
- Which rooms are most frequently searched?
- What buildings are most popular?
- What duration filters do users prefer?
- What's the typical availability rate for each building?
- Which search method (command palette vs. page) is more popular?
