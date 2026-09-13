# Seven Tool Fabric 2.0 — Wave 17 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 17. No geospatial/weather provider is frozen.
Governing command: `WAVE_17_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should own a **Geo & World Data Plane** that separates spatial identity/data from providers and rendering.

Architecture:

1. `GeoBroker` — canonical geocode/reverse/place/route/weather dispatch.
2. `GeoIdentity` — stable Seven place/location candidate representation with provider refs.
3. `GeometryEngine` — local typed geometry operations.
4. `PlaceProviderAdapter` — geocoders/POI systems.
5. `RoutingProviderAdapter` — route/matrix/matching engines.
6. `WeatherProviderAdapter` — forecast/observation/reanalysis normalization.
7. `TimezoneResolver` — coordinate-to-IANA-zone specialist with dataset version evidence.
8. `MapSpec` — safe typed presentation contract.
9. `MapRenderer` — replaceable lazy visual renderer.
10. `GeoPrivacyGate` — exact/coarse location authority and network-disclosure checks.

A map is presentation. A geocoder result is a candidate. A weather forecast is time/model-specific evidence. None becomes truth merely because a provider returned it.

## Candidate registry

| Candidate/standard | Kind | Preliminary class | Seven role |
|---|---|---|---|
| RFC 7946 GeoJSON | interchange standard | CORE SEMANTIC STANDARD | geometry/feature interchange |
| Turf.js | modular JS geospatial library | CORE/SPECIALIST CANDIDATE | local geometry calculations |
| Nominatim | geocoder | SPECIALIST/FALLBACK | OSM search/reverse/self-host option |
| Overpass API | OSM query engine | SPECIALIST | POI/tag/area data queries |
| OSRM | routing engine | SPECIALIST | fast OSM routing/matrix/matching service |
| Valhalla | multimodal routing engine | SPECIALIST | richer routing/multimodal/elevation/matrix |
| Open-Meteo | weather/geocoding provider | SPECIALIST CANDIDATE | forecast/history/environment data adapter |
| timezone-boundary-builder | timezone boundary dataset | SPECIALIST DATA PACK | coordinate-to-IANA zone resolution |
| MapLibre GL JS | web map renderer | SPECIALIST RENDERER | lazy WebGL interactive maps |
| MapLibre Native | native map ecosystem | FUTURE NATIVE SPECIALIST | evaluate if native Android map UX warrants it |
| public demo/community OSM endpoints | hosted public infrastructure | FALLBACK/DEV ONLY | never assumed production SLA |

## Canonical geometry

Use RFC 7946 GeoJSON-compatible semantics at boundaries:
- Position/Point
- MultiPoint
- LineString/MultiLineString
- Polygon/MultiPolygon
- GeometryCollection
- Feature/FeatureCollection

Coordinates are WGS84 longitude/latitude in GeoJSON order. Seven UI/API contracts should name fields explicitly where confusion with lat/lon order is possible.

Source:
- RFC 7946, The GeoJSON Format: https://www.rfc-editor.org/rfc/rfc7946

## GeoLocation / PlaceCandidate

Recommended fields:
- canonical Seven id if resolved
- name/display label
- coordinate + precision class
- bounding box where available
- address components
- place/category/type
- country/admin codes
- provider + provider object id
- provider importance/rank/confidence where exposed
- source/retrieved time
- attribution/license metadata
- raw result lineage reference
- ambiguity state

Do not convert a ranked search candidate into a persistent canonical place until user/task evidence resolves ambiguity where material.

## Precision / privacy classes

Location data must carry an explicit class:

- `NONE`
- `COUNTRY`
- `REGION`
- `CITY`
- `APPROXIMATE_AREA`
- `PRECISE_COORDINATE`
- `USER_SELECTED_PLACE`

`PRECISE_COORDINATE` from device/user is sensitive and requires authoritative permission before acquisition and a second policy check before sending to a remote provider when the task does not obviously require it.

Seven must not silently upgrade city-level context to GPS-level location.

## GeometryEngine / Turf

Turf provides modular GeoJSON-based browser/Node functions. It can run many geometry calculations locally without sending coordinates to a server.

Seven role:
- import only needed modules
- candidate operations: distance, bearing, point-in-polygon, bbox, centroid, area, buffer/intersection where justified
- operations record algorithm/library version and units
- local geometry should be preferred when a server is unnecessary

Source:
- https://turfjs.org/

## Geocoding / Nominatim

Nominatim provides search, reverse and object lookup over OpenStreetMap. Its own reverse-geocoding docs warn that the returned address is based on the closest suitable OSM object and can be unexpected.

Critical public-service policy:
- OSMF public Nominatim is capacity-limited
- absolute maximum 1 request/sec under current policy
- identify the application via User-Agent/Referer
- attribution required
- heavy/bulk use is not appropriate

Seven decision:
- Nominatim adapter is viable, especially for user-initiated low-volume geocoding or self-hosted/alternate services
- public `nominatim.openstreetmap.org` is not a production-unlimited backend
- cache user-visible geocoding where policy permits and include attribution
- reverse results retain ambiguity/provider provenance

Sources:
- https://nominatim.org/release-docs/latest/api/Overview/
- https://nominatim.org/release-docs/develop/api/Reverse/
- https://operations.osmfoundation.org/policies/nominatim/

## POI / Overpass

Overpass is a read-only query API optimized for selecting OSM data by tags/location/proximity and can support POI queries that Nominatim is not designed to exhaustively return.

Current public-instance guidance warns public servers can be overloaded; regular app usage should be cached/rate-limited or moved to a suitable/self-hosted/commercial backend. Queries can also return an `osm_base` timestamp indicating source freshness.

Seven role:
- specialist POI/tag/area query adapter
- generate bounded reviewed query templates rather than arbitrary giant model-generated Overpass requests
- spatial radius/bbox, element count, response bytes and timeout bounded
- preserve OSM base timestamp when available

Source:
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://dev.overpass-api.de/overpass-doc/en/

## Routing

### OSRM

OSRM provides OSM-backed route, distance/time matrix, map matching, nearest and trip services.

Seven role:
- strong fast routing backend candidate
- remote/self-host specialist
- canonical Seven `RouteResult` isolates profile/provider-specific details

Source:
- https://project-osrm.org/docs/

### Valhalla

Valhalla supports driving, walking, cycling and multimodal/transit-oriented routing plus matrix/isochrone/matching/elevation services. It exposes OpenAPI documentation.

Seven role:
- richer specialist candidate where routing policy/multimodal capability matters
- not mobile base dependency; route service is host/remote
- public demo is fair-use infrastructure, not production guarantee

Sources:
- https://valhalla.github.io/valhalla/api/
- https://valhalla.github.io/valhalla/api/turn-by-turn/overview/

## RouteRequest / RouteResult

Request:
- ordered waypoints
- coordinate precision/source
- travel mode/profile
- avoid/preferences if supported
- departure/arrival time when relevant
- accessibility/vehicle constraints where provider supports them

Result:
- provider + graph/data timestamp/version when available
- route geometry
- distance
- duration estimate
- route alternatives
- instructions/narrative
- mode/profile
- assumptions/avoid settings
- snapping/matched coordinates
- warnings
- attribution

Route ETA is an estimate tied to provider/model/data. It is not a safety guarantee.

## Weather / Open-Meteo

Open-Meteo exposes forecast and historical/environment APIs keyed by WGS84 coordinates, with explicit units and timezone support. Current documentation distinguishes live forecasts from historical forecasts/reanalysis/model-run products.

Important truth distinction:
- a forecast is a model prediction
- reanalysis/historical gridded values blend observations and models and may estimate locations without stations
- historical forecast archives differ from long-term reanalysis datasets

Seven WeatherResult must retain:
- coordinate/elevation used
- timezone
- requested/returned units
- generated/retrieved time
- valid time per datapoint
- data class: `FORECAST`, `OBSERVATION` if a provider truly supplies observations, `REANALYSIS`, `HISTORICAL_FORECAST`, `MODEL_RUN`
- provider/model/source when available
- resolution
- attribution/license

Open-Meteo currently states weather data is based on open data under CC BY 4.0 and requires attribution; service plan/usage terms remain time-sensitive.

Sources:
- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/historical-weather-api
- https://open-meteo.com/en/pricing

## TimezoneResolver

Timezone Boundary Builder releases approximate geographic boundaries associated with IANA timezone identifiers and tracks timezone-database releases.

Seven role:
- optional data pack/remote service basis to resolve timezone from coordinate
- dataset release/version must be recorded because timezone rules/boundaries evolve
- map coordinate → zone id is spatial resolution; actual UTC offset for an instant still uses a timezone database/runtime

The full boundary data is tens of MB compressed, so it is not base-APK material.

Source:
- https://github.com/evansiroky/timezone-boundary-builder

## MapSpec

Seven-owned safe map presentation contract:
- viewport intent/bounds
- point/line/polygon layer refs
- selected place/route ids
- label fields
- semantic categories
- user-location display permission state
- attribution entries
- interaction policy
- accessibility summary

No arbitrary renderer JavaScript/style expressions from the model in canonical MapSpec V1.

## MapLibre renderer

MapLibre GL JS renders interactive vector-tile maps with WebGL and a worker; MapLibre Native exists for mobile platforms.

Seven decision:
- strong renderer candidate for rich map workspace
- load only when map is requested
- simple results can use a lightweight static/typed map surface or external system map handoff before paying GL/WebGL cost
- tile/style provider remains separate from renderer and carries its own attribution/usage policy
- device/WebGL capability and ResourceGovernor apply

Source:
- https://maplibre.org/maplibre-gl-js/docs/

## Freshness / caching

Every external result records `retrievedAt` plus provider-specific source/model/data time where available.

Cache semantics differ:
- geocoding/place identity: relatively stable but provider policy controls caching
- POI/business properties: mutable
- routing: road graphs/traffic assumptions change
- weather: short TTL based on forecast/update schedule
- timezone boundaries: release-versioned data pack

Seven cache never erases original freshness metadata.

## Attribution

Attribution is data carried with results, not hardcoded footer text only.

Adapters expose:
- attribution text/link identifier
- license/data source
- display requirements
- provider terms version/observed time where practical

UI/renderers aggregate required attribution without hiding it.

## Android/startup strategy

- GeoJSON/GeoBroker contracts: tiny core.
- Turf: per-function lazy imports when geometry is actually needed.
- all geocoding/weather/routing providers remote adapters: no SDK by default unless justified.
- MapLibre: lazy workspace/render chunk only.
- timezone polygon dataset: optional pack/server path.
- no background GPS collection.
- precise device location uses Wave 06 permission/user-presence path only when explicitly needed.

## Rejected approaches

- one maps vendor object model as Seven canonical state: rejected
- public Nominatim/Overpass/demo routing servers treated as unlimited production backend: rejected
- reverse-geocoder output treated as exact physical address truth: rejected
- precise location silently sent to remote services: rejected
- map renderer loaded at chat startup: rejected
- weather number without valid time/units/source class: rejected
- forecast presented as observation: rejected
- route ETA presented as guarantee: rejected
- bundling full timezone polygons in base APK: rejected
- Nominatim used for exhaustive POI enumeration: rejected

## Canonical capabilities

- `geo.geocode`
- `geo.reverse_geocode`
- `geo.place.lookup`
- `geo.poi.search`
- `geo.geometry.compute`
- `geo.route`
- `geo.route.matrix`
- `geo.timezone.resolve`
- `weather.forecast`
- `weather.history`
- `map.spec.create`
- `map.render`

## Required Evals

Before Freeze:
- ambiguous same-name places produce candidates rather than silent choice
- lat/lon order canaries are caught
- precise-location network transmission requires proper authority
- Nominatim/Overpass rate/attribution policy is enforced
- reverse-geocode mismatch remains uncertain/candidate
- weather timezone/unit conversions are correct
- forecast vs history/reanalysis labels remain distinct
- route provider swap preserves canonical result shape
- map renderer failure does not destroy place/route data
- map feature remains unloaded during ordinary chat startup
- RTL/Arabic place labels and mixed Latin coordinates remain legible

## Deep Polish queue

`Geo contracts/privacy → Turf GeometryEngine → WeatherResult/Open-Meteo adapter → Nominatim PlaceAdapter → POI/Overpass specialist → RouteResult/OSRM → Valhalla benchmark → MapSpec → MapLibre renderer bakeoff → TimezoneResolver → provider policy/attribution regression tests`

## Coverage statement

Wave 17 closes the high-value general geospatial/weather/world-data discovery gap. Provider selection remains replaceable and policy-aware; precise location stays under Seven's explicit permission model.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
