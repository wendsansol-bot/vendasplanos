# Project rules

- Store month-specific targets, weekly ranges and chart start dates in the existing year-month configuration maps; this preserves historical behavior without changing shared calculations.
- Keep business-rule regression tests beside the data modules and run them with `bun test`; this verifies configuration changes without introducing another test dependency.