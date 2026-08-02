# Monitoring

## What can be monitored

| Signal | Source | Notes |
|---|---|---|
| web uptime and asset/route errors | hosting provider and browser smoke | primary web availability signal |
| native crashes | Crashlytics when configured | confirm exact production setting |
| product behavior | PostHog when key configured | no replay; allowlisted events only |
| bundle/asset growth | CI/build output | compare to performance budget |
| content freshness | source ledger | not an analytics dashboard |

No PostHog key means product funnels are not measurable. Do not convert “deployed” into “instrumented.” No server database means there are no Firestore read/write, ACL, or sync-lag alerts.

## Release smoke

- home and all four tabs load;
- direct detail routes refresh;
- no unexpected console errors or missing assets;
- mode switch, mission completion, bucket creation, and panel progress work;
- official links and emergency calls dispatch;
- export/reset flows are reachable;
- inactive tabs are absent from the accessibility tree.

## Alerts

- SEV-1: app cannot load, destructive local-data regression, prohibited telemetry data, or high-consequence guidance likely to cause immediate harm.
- SEV-2: a core tab/action unavailable, direct routes broadly broken, crash-free users materially degraded.
- SEV-3: isolated content, visual, or low-risk accessibility regression.

Thresholds require real baselines. Do not publish invented percentages before instrumentation and traffic exist.
