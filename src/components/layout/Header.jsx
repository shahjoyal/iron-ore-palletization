import { PLANTS } from '../../data/plants'
import { InlineSlider, SelectControl } from '../fields/Field'
import { useSimStore } from '../../store/useSimStore'

/** Ends the session, so opening the link again starts from the home page. */
function signOut() {
  try { sessionStorage.removeItem('abhitech_auth') } catch (e) { /* storage blocked: nothing to clear */ }
  window.location.href = 'login.html'
}

export function Header() {
  const { plant, capacity, setPlant, setCapacity } = useSimStore()
  return (
    <header className="topbar">
      <a className="brand" href="home.html" aria-label="Abhitech Energycon home">
        <img src="./logo.png" alt="" />
        <span className="brand-text">
          <strong>Abhitech</strong>
          <small>Pelletization simulator</small>
        </span>
      </a>
      <div className="topbar-fields">
        <label className="topbar-field">
          <span>Plant</span>
          <SelectControl id="plantName" value={plant} options={PLANTS} placeholder="Select plant" onChange={setPlant} />
        </label>
        <InlineSlider id="plantCapacity" className="topbar-capacity" label="Capacity" min={0} max={2000} step={5} unit="TPH"
          value={capacity} onChange={setCapacity} />
      </div>
      <nav className="topbar-nav">
        <a href="home.html">Home</a>
        <button type="button" className="nav-btn" onClick={signOut}>Sign out</button>
      </nav>
    </header>
  )
}
