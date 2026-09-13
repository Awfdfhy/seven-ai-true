# Seven Tool Fabric 2.0 — Wave 17 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: geospatial data, maps, geocoding, routing, places, weather, timezone/world-data normalization and privacy.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 17

Goal: give Seven a normalized real-world spatial/environment capability plane without binding product logic to one maps/weather vendor or leaking precise user location.

Research current standards, open-data services, self-hostable engines and mobile renderers. Provider usage policies/licenses are part of capability evidence, not footnotes.

Research at minimum:
- coordinate and GeoJSON representation
- geometry operations
- geocoding/reverse geocoding
- place/POI lookup
- routing/directions
- map rendering
- weather/current/forecast/historical data
- timezone from coordinates
- provider attribution/licensing/usage limits
- cache/freshness semantics
- offline/self-host possibilities
- Android/mobile rendering cost
- exact-location privacy and permission boundaries
- ambiguous place resolution

Rules:
- never infer/transmit precise user location without authoritative permission/input.
- geocoder/place results are candidates with confidence/identity, not unquestioned truth.
- weather results retain observation/forecast time, timezone, model/provider and units.
- route results retain profile/mode/provider and are not safety guarantees.
- provider ToS/attribution/rate policy must be preserved in adapter metadata.
- map tiles/renderers do not own canonical place/location state.
- prefer GeoJSON/typed Seven geometry contracts over vendor objects.
- heavy map engines are lazy and never startup dependencies.

Output:
1. GeoBroker architecture
2. canonical location/place/geometry/weather/route contracts
3. provider candidate registry
4. privacy/permission policy
5. freshness/cache/attribution policy
6. map renderer strategy
7. Android/startup strategy
8. rejected approaches
9. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
