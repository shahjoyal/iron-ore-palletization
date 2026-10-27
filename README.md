# Abhitech Pelletization Simulator

Single-page dashboard: process route (right), drawing + footage (left), inputs (centre).

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/ (open via any static server)
```
`/home.html` and `/login.html` are the original landing and login pages; login redirects to the app.

## Structure
```
src/data/stages.js        stage list, media, form schemas, default values (edit inputs here)
src/data/oreZones.js      ore chemistry by zone / mine location
src/data/plants.js        plants and induration technology
src/store/useSimStore.js  all inputs, saved flags, active stage, simulation summary (persisted)
src/components/layout     Header, Sidebar
src/components/workspace  Workspace (inputs → running → results), Studio, Results, RouteBar, RunCard, OutputCard
src/data/results.js       dummy output values (swap makeResults for the real model)
src/components/cards      DrawingCard, VideoCard, InputCard
src/components/fields     NumberField, SelectField, Segmented, FluxList / FuelList
src/components/stages     FeedForm, MixForm, InduForm, CoolForm, GenericForm
src/scenes                canvas drawings ported from the original dashboard (logic unchanged)
```
To add or change a simple input, edit its entry in `src/data/stages.js`; keep the `id` so the drawing keeps reading it.
