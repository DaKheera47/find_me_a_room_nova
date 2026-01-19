/**
 * Umami Analytics Tracking Utilities
 *
 * This module provides type-safe functions to track custom events with Umami Analytics.
 * Umami automatically tracks page views, so these functions are for custom event tracking only.
 */

// Type for event data that can be sent to Umami
type EventData = Record<string, string | number | boolean>;

// Extend the Window interface to include umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: EventData) => void;
    };
  }
}

/**
 * Track a custom event with Umami Analytics
 * @param eventName - The name of the event to track
 * @param eventData - Optional data to associate with the event
 */
export function trackEvent(eventName: string, eventData?: EventData) {
  if (typeof window !== "undefined" && window.umami) {
    try {
      window.umami.track(eventName, eventData);
    } catch (error) {
      console.error("Failed to track Umami event:", error);
    }
  }
}

/**
 * Track when a user searches for a room
 * @param roomName - The name of the room being searched
 * @param source - Where the search originated from (e.g., 'command-search', 'room-selector')
 */
export function trackRoomSearch(roomName: string, source: string) {
  trackEvent("room-search", {
    room: roomName,
    source,
  });
}

/**
 * Track when a user views room details
 * @param roomName - The name of the room being viewed
 */
export function trackRoomView(roomName: string) {
  trackEvent("room-view", {
    room: roomName,
  });
}

/**
 * Track when a user searches for free rooms in a building
 * @param buildingCode - The building code being searched
 * @param duration - The minimum duration in minutes
 * @param source - Where the search originated from
 */
export function trackBuildingSearch(
  buildingCode: string,
  duration: number,
  source: string
) {
  trackEvent("building-search", {
    building: buildingCode,
    duration,
    source,
  });
}

/**
 * Track when a user views free rooms results
 * @param buildingCode - The building code
 * @param availableRooms - Number of available rooms found
 * @param totalRooms - Total number of rooms checked
 * @param duration - The minimum duration in minutes
 */
export function trackFreeRoomsResult(
  buildingCode: string,
  availableRooms: number,
  totalRooms: number,
  duration: number
) {
  trackEvent("free-rooms-result", {
    building: buildingCode,
    availableRooms,
    totalRooms,
    duration,
    availabilityRate:
      totalRooms > 0
        ? Math.round((availableRooms / totalRooms) * 10000) / 100
        : 0,
  });
}
