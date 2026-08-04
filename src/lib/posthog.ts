/**
 * PostHog wrapper. Provides typed event names and a useScreenTracking hook
 * that fires `$screen` events on Expo Router navigation changes.
 */

import PostHog from 'posthog-react-native';

const rawKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/** A real key is one that exists and is not the .env.example placeholder. */
export function isUsableProjectKey(key: string): boolean {
  return key.length > 0 && !key.startsWith('phc_REPLACE');
}

const hasUsableKey = isUsableProjectKey(rawKey);

/**
 * `null` whenever no project key is configured — which is the current default.
 *
 * The earlier shape constructed the client with a `phc_analytics_disabled`
 * placeholder and `disabled: true`, because the constructor throws on an empty
 * key. `disabled` does suppress event capture, but the SDK still fetches its
 * remote config on init: every page load of the "analytics is off" build sent
 * `GET https://us-assets.i.posthog.com/array/phc_analytics_disabled/config` —
 * observed in the browser network log, one 404 per route — which contacts
 * PostHog with the visitor's IP and user agent and contradicts
 * `docs/MEASUREMENT_AND_EXPERIMENTS.md`. Not constructing the client is the
 * only way to send nothing at all.
 */
export const posthog: PostHog | null = hasUsableKey
  ? new PostHog(rawKey, {
      host,
      // Profiles contain visa, housing, insurance, and date conditions. Event
      // analytics may be enabled with an explicit project key, but replay
      // remains off until a separate consent and redaction design is approved.
      enableSessionReplay: false,
      flushAt: 20,
      flushInterval: 30_000,
    })
  : null;

export type KJEvent =
  | 'mission_complete'
  | 'mission_uncomplete'
  | 'panel_unlock'
  | 'phase_transition'
  | 'phase_manual_override'
  | 'journey_view_change'
  | 'bucket_create'
  | 'bucket_item_complete'
  | 'era_switch'
  | 'dday_milestone_view'
  | 'emergency_open'
  | 'gallery_open'
  | 'byeongpung_share'
  | 'byeongpung_save_image'
  | 'onboarding_step_complete'
  | 'onboarding_complete'
  | 'sign_in'
  | 'sign_out'
  // UX KPI events (Wave 2 — ANALYTICS_SCHEMA.md §10.1)
  | 'screen_empty_view'
  | 'error_toast_dismissed'
  | 'notification_priming_shown'
  | 'notification_priming_response'
  | 'mission_first_complete_time'
  | 'settings_open'
  | 'notification_pref_change'
  | 'profile_field_change'
  | 'account_delete_initiated'
  | 'tour_aha_moment_shown'
  | 'tour_aha_moment_dismissed'
  | 'task_open'
  | 'task_start'
  | 'task_complete'
  | 'task_uncomplete'
  | 'task_order_choice'
  | 'task_housing_address_check'
  // Event names only. DEC-027 is confirmed but its rules have never run in
  // code, so no condition, task, or cohort payload is attached to these.
  | 'task_departure_type'
  | 'data_export_delivered'
  | 'data_export_failed';

type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: KJEvent, properties?: Props) {
  posthog?.capture(event, (properties ?? {}) as any);
}

export function identify(uid: string, properties?: Props) {
  posthog?.identify(uid, (properties ?? {}) as any);
}

export function trackScreen(name: string, properties?: Props) {
  posthog?.screen(name, (properties ?? {}) as any);
}

export function reset() {
  posthog?.reset();
}
