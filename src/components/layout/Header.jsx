import { PLANTS } from '../../data/plants'
import { SelectControl } from '../fields/Field'
import { useSimStore } from '../../store/useSimStore'

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
        <label className="topbar-field topbar-capacity">
          <span>Capacity</span>
          <div className="input-wrap">
            <input id="plantCapacity" className="input mono" type="number" min={1} max={9999} step={0.1} placeholder="—"
              value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            <span className="input-unit">TPH</span>
          </div>
        </label>
      </div>
      <nav className="topbar-nav">
        <a href="home.html">Home</a>
        <a href="login.html">Sign out</a>
      </nav>
    </header>
  )
}
