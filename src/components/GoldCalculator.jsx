import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import '../index.css';

const densities = { '14ni': 12.6, '14pd': 13.7, '18ni': 14.7, '18pd': 16.4 };
const purities = { '14ni': 0.585, '14pd': 0.585, '18ni': 0.750, '18pd': 0.750 };
const alloyNotes = {
  '14ni': 'Most mass-market white gold tennis bracelets use nickel alloy (cheaper). Can cause skin reactions in sensitive wearers.',
  '14pd': '14k palladium white gold is hypoallergenic and denser \u2014 rarer and more expensive. Ask your jeweler to confirm.',
  '18ni': '18k nickel white gold is less common \u2014 higher gold content but still uses nickel for whitening.',
  '18pd': '18k palladium white gold is the premium standard \u2014 denser, hypoallergenic, and visibly whiter.'
};

const GoldCalculator = ({ numDiamonds, diameter, onTotalsChange }) => {
  const getQueryParam = (key, defaultVal, isFloat = true) => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(key)) return defaultVal;
    return isFloat ? parseFloat(params.get(key)) : params.get(key);
  };

  const [karat, setKarat] = useState(() => getQueryParam('k', '14ni', false));
  const [perLinkWeight, setPerLinkWeight] = useState(() => getQueryParam('plw', 0.080));
  const [makingCharge, setMakingCharge] = useState(() => getQueryParam('mc', 30.0));
  const [spotPrice, setSpotPrice] = useState(95); // fallback default
  const [status, setStatus] = useState('Connecting to live feed...');
  const [statusColor, setStatusColor] = useState('var(--text-secondary)');

  useEffect(() => {
    const socket = io("wss://www.livepriceofgold.com", {
      path: "/sio/p7012/socket.io/",
      transports: ["websocket"]
    });

    socket.on('connect', () => {
      setStatus('Live Feed Connected');
      setStatusColor('#2ecc71'); // success green
    });

    socket.on('update', (data) => {
      let jsonString = data;
      if (Array.isArray(data) && data.length > 0) jsonString = data[0];

      try {
        const ratesObj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        if (ratesObj && ratesObj.XAUUSD) {
          const xau = parseFloat(ratesObj.XAUUSD);
          // Convert Troy Ounce to Gram (1 Troy Ounce = 31.1034768 grams)
          const pricePerGram = xau / 31.1034768;
          setSpotPrice(pricePerGram);
        }
      } catch (e) {
        console.error("Socket parse error", e);
      }
    });

    socket.on('disconnect', () => {
      setStatus('Feed disconnected');
      setStatusColor('#e74c3c'); // red error
    });

    return () => socket.disconnect();
  }, []);

  // Sync these specific panel settings to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('k', karat);
    params.set('plw', perLinkWeight);
    params.set('mc', makingCharge);
    window.history.replaceState(null, '', '?' + params.toString());
  }, [karat, perLinkWeight, makingCharge]);

  const density = densities[karat];
  const purity = purities[karat];
  const claspWeight = karat.startsWith('18') ? 0.90 : 0.75;

  const wSettings = numDiamonds * perLinkWeight;
  const wTotal = wSettings + claspWeight;
  const goldGrams = wTotal * purity;
  const meltValue = goldGrams * spotPrice;
  const manufacturingCost = wTotal * makingCharge;
  const totalGoldCost = meltValue + manufacturingCost;

  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange({ wTotal, meltValue, totalGoldCost });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wTotal, meltValue, totalGoldCost]);

  return (
    <div className="section glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        White Gold & Melt Value
        <span style={{ fontSize: '0.75rem', color: statusColor, fontWeight: 500 }}>• {status}</span>
      </h2>
      
      <div className="control-group" style={{ marginBottom: '1rem' }}>
        <div className="control-header">
          <label className="control-label">Alloy & Karat</label>
        </div>
        <select 
          value={karat} 
          onChange={(e) => setKarat(e.target.value)}
          className="custom-select"
        >
          <option value="14ni">14k white gold — nickel (~12.6 g/cm³)</option>
          <option value="14pd">14k white gold — palladium (~13.7 g/cm³)</option>
          <option value="18ni">18k white gold — nickel (~14.7 g/cm³)</option>
          <option value="18pd">18k white gold — palladium (~16.4 g/cm³)</option>
        </select>
        <p className="note" style={{marginTop: '0.5rem'}}>{alloyNotes[karat]}</p>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">Per-Link Weight (g)</label>
          <input 
            type="number" 
            className="control-value-input" 
            value={perLinkWeight.toFixed(3)} 
            step="0.005"
            onChange={(e) => setPerLinkWeight(parseFloat(e.target.value))} 
          />
        </div>
        <input 
          type="range" 
          min="0.04" 
          max="0.15" 
          step="0.005" 
          value={perLinkWeight} 
          onChange={(e) => setPerLinkWeight(parseFloat(e.target.value))} 
        />
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">Labor/Making Charge ($/g)</label>
          <input 
            type="number" 
            className="control-value-input" 
            value={makingCharge.toFixed(0)} 
            step="1"
            onChange={(e) => setMakingCharge(parseFloat(e.target.value))} 
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max="150" 
          step="5" 
          value={makingCharge} 
          onChange={(e) => setMakingCharge(parseFloat(e.target.value))} 
        />
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-lbl">Density used</div>
          <div className="card-val">{density.toFixed(1)} <span style={{fontSize:'0.6em', color: 'var(--text-secondary)'}}>g/cm³</span></div>
        </div>
        <div className="card">
          <div className="card-lbl">Settings weight</div>
          <div className="card-val">{wSettings.toFixed(2)} <span style={{fontSize:'0.6em', color: 'var(--text-secondary)'}}>g</span></div>
        </div>
        <div className="card hi">
          <div className="card-lbl" style={{color: 'var(--accent)'}}>Total est. weight</div>
          <div className="card-val" style={{color: 'var(--accent)'}}>{wTotal.toFixed(2)} <span style={{fontSize:'0.6em', opacity: 0.8}}>g</span></div>
        </div>
      </div>

      <div className="melt-box" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
        <h3 className="melt-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Intrinsic Material Value</h3>
        
        <div className="melt-row">
          <span className="melt-lbl">Live Gold Spot (24k)</span>
          <span className="melt-val">${spotPrice.toFixed(2)} /g</span>
        </div>
        <div className="melt-row">
          <span className="melt-lbl">Pure gold content ({karat.substring(0,2)}k)</span>
          <span className="melt-val">{(purity * 100).toFixed(1)}%</span>
        </div>
        <div className="melt-row">
          <span className="melt-lbl">Pure gold (grams)</span>
          <span className="melt-val">{goldGrams.toFixed(2)} g</span>
        </div>
        <div className="melt-row" style={{ marginTop: '0.25rem' }}>
          <span className="melt-lbl" style={{ color: 'var(--accent)'}}>Intrinsic Melt Value</span>
          <span className="melt-val" style={{ color: 'var(--accent)'}}>${meltValue.toFixed(0)}</span>
        </div>
        <div className="melt-row" style={{ marginTop: '0.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <span className="melt-lbl">Labor/Making Charge</span>
          <span className="melt-val">${manufacturingCost.toFixed(0)}</span>
        </div>
        <div className="melt-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem' }}>
          <span className="melt-lbl" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>Total Setting Cost</span>
          <span className="melt-val" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>${totalGoldCost.toFixed(0)}</span>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Weight Sanity Check</h3>
        <p className="note" style={{ marginBottom: '10px' }}>
          For {numDiamonds} stones at {diameter.toFixed(1)}mm ({ (wTotal).toFixed(1) }g baseline):
        </p>
        <div className="range-band">
          <div className="band" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#ff7675' }}>
            &lt; { (wTotal * 0.75).toFixed(1) }g<span className="band-label">Too hollow</span>
          </div>
          <div className="band" style={{ background: 'rgba(253, 203, 110, 0.15)', color: '#fdcb6e' }}>
            { (wTotal * 0.75).toFixed(1) }–{ (wTotal * 0.95).toFixed(1) }g<span className="band-label">Light build</span>
          </div>
          <div className="band" style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#55efc4' }}>
            { (wTotal * 0.95).toFixed(1) }–{ (wTotal * 1.25).toFixed(1) }g<span className="band-label">Standard</span>
          </div>
          <div className="band" style={{ background: 'rgba(9, 132, 227, 0.15)', color: '#74b9ff' }}>
            &gt; { (wTotal * 1.25).toFixed(1) }g<span className="band-label">Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldCalculator;
