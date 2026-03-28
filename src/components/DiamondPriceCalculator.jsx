import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import '../index.css';

const x1r9 = (hexStr, pass) => {
  let out = '';
  for (let i = 0; i < hexStr.length; i += 2) {
    let charCode = parseInt(hexStr.substr(i, 2), 16);
    let passCode = pass.charCodeAt((i / 2) % pass.length);
    out += String.fromCharCode(charCode ^ passCode);
  }
  return out;
};

const cutAdjustments = {
  'Ideal': 1.06,
  'Excellent': 1.0,
  'Very Good': 0.925,
  'Good': 0.84,
  'Fair': 0.775,
  'Poor': 0.675,
};

const lowColorConfig = {
  'N-R': { start: 0.05, end: 0.15, letters: ['N', 'O', 'P', 'Q', 'R'] },
  'S-Z': { start: 0.15, end: 0.25, letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] }
};

const fluorescenceTable = [
  {
    min: 0.00, max: 0.49,
    data: {
      'D-F': {
        'IF-VVS2': { 'Faint': 0.12, 'Medium': 0.18, 'Strong': 0.22, 'Very Strong': 0.26 },
        'VS1-VS2': { 'Faint': 0.07, 'Medium': 0.13, 'Strong': 0.16, 'Very Strong': 0.19 },
        'SI1-SI2': { 'Faint': 0.05, 'Medium': 0.09, 'Strong': 0.13, 'Very Strong': 0.17 }
      },
      'G-H': {
        'IF-VVS2': { 'Faint': 0.09, 'Medium': 0.14, 'Strong': 0.17, 'Very Strong': 0.20 },
        'VS1-VS2': { 'Faint': 0.07, 'Medium': 0.11, 'Strong': 0.13, 'Very Strong': 0.15 },
        'SI1-SI2': { 'Faint': 0.04, 'Medium': 0.07, 'Strong': 0.10, 'Very Strong': 0.13 }
      },
      'I-K': {
        'IF-VVS2': { 'Faint': 0.03, 'Medium': 0.06, 'Strong': 0.09, 'Very Strong': 0.12 },
        'VS1-VS2': { 'Faint': 0.03, 'Medium': 0.05, 'Strong': 0.09, 'Very Strong': 0.13 },
        'SI1-SI2': { 'Faint': 0.02, 'Medium': 0.05, 'Strong': 0.08, 'Very Strong': 0.11 }
      }
    }
  },
  {
    min: 0.50, max: 0.99,
    data: {
      'D-F': {
        'IF-VVS2': { 'Faint': 0.14, 'Medium': 0.21, 'Strong': 0.26, 'Very Strong': 0.31 },
        'VS1-VS2': { 'Faint': 0.10, 'Medium': 0.16, 'Strong': 0.22, 'Very Strong': 0.28 },
        'SI1-SI2': { 'Faint': 0.07, 'Medium': 0.12, 'Strong': 0.16, 'Very Strong': 0.20 }
      },
      'G-H': {
        'IF-VVS2': { 'Faint': 0.10, 'Medium': 0.15, 'Strong': 0.19, 'Very Strong': 0.23 },
        'VS1-VS2': { 'Faint': 0.08, 'Medium': 0.12, 'Strong': 0.16, 'Very Strong': 0.20 },
        'SI1-SI2': { 'Faint': 0.06, 'Medium': 0.09, 'Strong': 0.12, 'Very Strong': 0.15 }
      },
      'I-K': {
        'IF-VVS2': { 'Faint': 0.05, 'Medium': 0.09, 'Strong': 0.13, 'Very Strong': 0.17 },
        'VS1-VS2': { 'Faint': 0.04, 'Medium': 0.07, 'Strong': 0.10, 'Very Strong': 0.13 },
        'SI1-SI2': { 'Faint': 0.03, 'Medium': 0.06, 'Strong': 0.09, 'Very Strong': 0.12 }
      }
    }
  },
  {
    min: 1.00, max: 20.99,
    data: {
      'D-F': {
        'IF-VVS2': { 'Faint': 0.15, 'Medium': 0.22, 'Strong': 0.28, 'Very Strong': 0.34 },
        'VS1-VS2': { 'Faint': 0.10, 'Medium': 0.17, 'Strong': 0.25, 'Very Strong': 0.33 },
        'SI1-SI2': { 'Faint': 0.08, 'Medium': 0.13, 'Strong': 0.19, 'Very Strong': 0.25 }
      },
      'G-H': {
        'IF-VVS2': { 'Faint': 0.10, 'Medium': 0.15, 'Strong': 0.20, 'Very Strong': 0.25 },
        'VS1-VS2': { 'Faint': 0.07, 'Medium': 0.13, 'Strong': 0.18, 'Very Strong': 0.23 },
        'SI1-SI2': { 'Faint': 0.06, 'Medium': 0.11, 'Strong': 0.15, 'Very Strong': 0.19 }
      },
      'I-K': {
        'IF-VVS2': { 'Faint': 0.05, 'Medium': 0.10, 'Strong': 0.15, 'Very Strong': 0.20 },
        'VS1-VS2': { 'Faint': 0.05, 'Medium': 0.08, 'Strong': 0.12, 'Very Strong': 0.16 },
        'SI1-SI2': { 'Faint': 0.04, 'Medium': 0.07, 'Strong': 0.10, 'Very Strong': 0.13 }
      }
    }
  }
];

function getFluorescenceDiscount(weight, color, clarity, fluorescence) {
  if (fluorescence === 'None') return 0;
  let colorKey = null;
  if (['D','E','F'].includes(color)) colorKey = 'D-F';
  else if (['G','H'].includes(color)) colorKey = 'G-H';
  else if (['I','J','K','L','M'].includes(color)) colorKey = 'I-K';
  
  let clarityKey = null;
  if (['IF','VVS1','VVS2'].includes(clarity)) clarityKey = 'IF-VVS2';
  else if (['VS1','VS2'].includes(clarity)) clarityKey = 'VS1-VS2';
  else if (['SI1','SI2','I1','I2','I3'].includes(clarity)) clarityKey = 'SI1-SI2';

  if (!colorKey || !clarityKey) return 0;

  const range = fluorescenceTable.find(r => weight >= r.min && weight <= r.max);
  if (!range) return 0; 
  const discounts = range.data[colorKey]?.[clarityKey];
  return discounts?.[fluorescence] || 0;
}

const largeStoneIncreases = {
  6: { 'D-F': { 'IF-VVS': 0.00, 'VS': 0.00, 'SI': 0.07, 'I1': 0.05, 'I2-I3': 0.05 }, 'G-H': { 'IF-VVS': 0.05, 'VS': 0.05, 'SI': 0.03, 'I1': 0.03, 'I2-I3': 0.03 }, 'I-K': { 'IF-VVS': 0.05, 'VS': 0.05, 'SI': 0.03, 'I1': 0.03, 'I2-I3': 0.03 }, 'L-M': { 'IF-VVS': 0.05, 'VS': 0.05, 'SI': 0.03, 'I1': 0.02, 'I2-I3': 0.02 } },
  7: { 'D-F': { 'IF-VVS': 0.15, 'VS': 0.12, 'SI': 0.12, 'I1': 0.07, 'I2-I3': 0.07 }, 'G-H': { 'IF-VVS': 0.15, 'VS': 0.15, 'SI': 0.12, 'I1': 0.07, 'I2-I3': 0.07 }, 'I-K': { 'IF-VVS': 0.15, 'VS': 0.15, 'SI': 0.12, 'I1': 0.05, 'I2-I3': 0.05 }, 'L-M': { 'IF-VVS': 0.15, 'VS': 0.15, 'SI': 0.12, 'I1': 0.05, 'I2-I3': 0.05 } },
  8: { 'D-F': { 'IF-VVS': 0.25, 'VS': 0.23, 'SI': 0.20, 'I1': 0.15, 'I2-I3': 0.15 }, 'G-H': { 'IF-VVS': 0.20, 'VS': 0.20, 'SI': 0.20, 'I1': 0.15, 'I2-I3': 0.15 }, 'I-K': { 'IF-VVS': 0.20, 'VS': 0.20, 'SI': 0.20, 'I1': 0.10, 'I2-I3': 0.10 }, 'L-M': { 'IF-VVS': 0.20, 'VS': 0.20, 'SI': 0.20, 'I1': 0.10, 'I2-I3': 0.10 } },
  9: { 'D-F': { 'IF-VVS': 0.30, 'VS': 0.25, 'SI': 0.25, 'I1': 0.20, 'I2-I3': 0.20 }, 'G-H': { 'IF-VVS': 0.30, 'VS': 0.25, 'SI': 0.25, 'I1': 0.20, 'I2-I3': 0.20 }, 'I-K': { 'IF-VVS': 0.30, 'VS': 0.25, 'SI': 0.25, 'I1': 0.15, 'I2-I3': 0.15 }, 'L-M': { 'IF-VVS': 0.25, 'VS': 0.25, 'SI': 0.25, 'I1': 0.15, 'I2-I3': 0.15 } }
};

function getLargeStoneIncrease(weight, color, clarity) {
  const floorW = Math.floor(weight);
  if (!largeStoneIncreases[floorW]) return 0;
  let cKey = 'L-M';
  if (['D','E','F'].includes(color)) cKey = 'D-F';
  else if (['G','H'].includes(color)) cKey = 'G-H';
  else if (['I','J','K'].includes(color)) cKey = 'I-K';
  
  let clKey = 'I2-I3';
  if (['IF','VVS1','VVS2'].includes(clarity)) clKey = 'IF-VVS';
  else if (['VS1','VS2'].includes(clarity)) clKey = 'VS';
  else if (['SI1','SI2'].includes(clarity)) clKey = 'SI';
  else if (clarity === 'I1') clKey = 'I1';
  return largeStoneIncreases[floorW][cKey]?.[clKey] || 0;
}

const DiamondPriceCalculator = ({ numDiamonds, caratWeight, onTotalsChange }) => {
  const getQueryParam = (key, defaultVal, isFloat = false) => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(key)) return defaultVal;
    return isFloat ? parseFloat(params.get(key)) : params.get(key);
  };

  const [color, setColor] = useState(() => getQueryParam('clr', 'G'));
  const [clarity, setClarity] = useState(() => getQueryParam('cla', 'VS1'));
  const [cut, setCut] = useState(() => getQueryParam('cut', 'Ideal'));
  const [fluorescence, setFluorescence] = useState(() => getQueryParam('fl', 'None'));
  const [discount, setDiscount] = useState(() => getQueryParam('disc', 15.0, true));
  
  // App-level state
  const [passcode, setPasscode] = useState(localStorage.getItem('dwc_admin_key') || '');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultInput, setVaultInput] = useState('');
  const [prices, setPrices] = useState(null);
  const [apiError, setApiError] = useState('');

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('clr', color);
    params.set('cla', clarity);
    params.set('cut', cut);
    params.set('fl', fluorescence);
    params.set('disc', discount);
    window.history.replaceState(null, '', '?' + params.toString());
  }, [color, clarity, cut, fluorescence, discount]);

  const fetchPricing = useCallback(async (currentPasscode) => {
    if (!currentPasscode) return;
    setApiError('');
    setIsUnlocked(true);
    
    const xuser = "131608020a090f0f1b1410001f1203571b0f1558150f131916581f09195c";
    const xpass = "142a3f08103a2750";
    const apiUser = x1r9(xuser, currentPasscode);
    const apiPass = x1r9(xpass, currentPasscode);

    try {
      const response = await fetch('https://technet.rapaport.com/HTTP/JSON/Prices/GetPriceSheet.aspx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: JSON.stringify({
          request: {
            header: { username: apiUser, password: apiPass },
            body: { shape: 'Round' }
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.response?.body?.price) {
        setPrices(data.response.body.price);
        localStorage.setItem('dwc_admin_key', currentPasscode);
      } else {
        throw new Error("Invalid Credentials or RapNet Response");
      }
    } catch (e) {
      setApiError(e.message);
      setIsUnlocked(false);
      localStorage.removeItem('dwc_admin_key');
    }
  }, []);

  // initial load
  useEffect(() => {
    if (passcode) fetchPricing(passcode);
  }, [passcode, fetchPricing]);

  const handleVaultUnlock = () => {
    setPasscode(vaultInput);
    setShowVault(false);
    fetchPricing(vaultInput);
  };

  // Calculating final price
  let totalDiamondCost = 0;
  let perStoneCost = 0;
  let matchFound = false;

  let basePricePerCarat = 0;
  let cutMultiplier = 1;
  let fluoDiscount = 0;
  let lowColorDiscount = 0;
  let largeStoneIncrease = 0;
  let adjustedListPricePerCarat = 0;
  let discountedPricePerCarat = 0;

  if (prices && caratWeight > 0) {
    let lookupWeight = (caratWeight % 1) >= 0.99860 ? Math.ceil(caratWeight) : Math.floor(caratWeight * 100) / 100;

    if (lookupWeight >= 6.00 && lookupWeight < 10.00) {
      largeStoneIncrease = getLargeStoneIncrease(lookupWeight, color, clarity);
      lookupWeight = 5.99;
    } else if (lookupWeight > 10.99) {
      lookupWeight = 10.99;
    }

    let searchColor = color;
    
    if (['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].includes(color)) {
      searchColor = 'M';
      for (const key in lowColorConfig) {
        const conf = lowColorConfig[key];
        const idx = conf.letters.indexOf(color);
        if (idx !== -1) {
          lowColorDiscount = conf.start + (idx * ((conf.end - conf.start) / (conf.letters.length - 1)));
          break;
        }
      }
    }

    const match = prices.find(p => 
      p.color.toUpperCase() === searchColor.toUpperCase() &&
      p.clarity.toUpperCase() === clarity.toUpperCase() &&
      lookupWeight >= p.low_size && lookupWeight <= p.high_size
    );

    if (match) {
      matchFound = true;
      basePricePerCarat = match.caratprice;
      cutMultiplier = cutAdjustments[cut] || 1.0;
      fluoDiscount = getFluorescenceDiscount(caratWeight, color, clarity, fluorescence);
      
      adjustedListPricePerCarat = basePricePerCarat 
        * (1.0 + largeStoneIncrease) 
        * (1.0 - lowColorDiscount) 
        * cutMultiplier 
        * (1.0 - fluoDiscount);
        
      const discountFactor = (100 - discount) / 100;
      discountedPricePerCarat = adjustedListPricePerCarat * discountFactor;
      
      perStoneCost = discountedPricePerCarat * caratWeight;
      totalDiamondCost = perStoneCost * numDiamonds;
    }
  }

  // Effect to push totals up
  useEffect(() => {
    if (onTotalsChange) onTotalsChange(matchFound ? totalDiamondCost : 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDiamondCost, matchFound]);

  return (
    <div className="section glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', position: 'relative' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Live Diamond RapNet Calculator
        <button 
          onClick={() => setShowVault(true)}
          style={{ 
            background: 'transparent', border: 'none', cursor: 'pointer', 
            color: isUnlocked ? '#2ecc71' : '#e74c3c', 
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' 
          }}
        >
          {isUnlocked && !apiError ? <Unlock size={16} /> : <Lock size={16} />}
          {isUnlocked && !apiError ? "API Secured" : "Locked"}
        </button>
      </h2>

      {showVault && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ background: '#1a1f33', padding: '2rem', borderRadius: '10px', textAlign: 'center', width: '80%' }}>
            <h3 style={{ marginBottom: '1rem' }}>Enter Rapaport Passcode</h3>
            <input 
              type="password" 
              value={vaultInput} 
              onChange={e => setVaultInput(e.target.value)} 
              style={{ padding: '0.75rem', width: '100%', borderRadius: '5px', border: '1px solid #333', background: '#000', color: '#fff', marginBottom: '1rem' }} 
              placeholder="••••••••"
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowVault(false)}
                style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={handleVaultUnlock}
                style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >Unlock Live Prices</button>
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', padding: '1rem', borderRadius: 'var(--radius-sm)', color: '#ff7675', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> {apiError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="control-group" style={{ padding: '0.75rem' }}>
          <label className="control-label" style={{ fontSize: '0.7rem' }}>Color</label>
          <select value={color} onChange={e => setColor(e.target.value)} className="custom-select" style={{ marginTop: 0 }}>
            {['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="control-group" style={{ padding: '0.75rem' }}>
          <label className="control-label" style={{ fontSize: '0.7rem' }}>Clarity</label>
          <select value={clarity} onChange={e => setClarity(e.target.value)} className="custom-select" style={{ marginTop: 0 }}>
            {['IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="control-group" style={{ padding: '0.75rem' }}>
          <label className="control-label" style={{ fontSize: '0.7rem' }}>Cut</label>
          <select value={cut} onChange={e => setCut(e.target.value)} className="custom-select" style={{ marginTop: 0 }}>
            {['Ideal','Excellent','Very Good','Good','Fair','Poor'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="control-group" style={{ padding: '0.75rem' }}>
          <label className="control-label" style={{ fontSize: '0.7rem' }}>Fluorescence</label>
          <select value={fluorescence} onChange={e => setFluorescence(e.target.value)} className="custom-select" style={{ marginTop: 0 }}>
            {['None','Faint','Medium','Strong','Very Strong'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">Your Discount (%)</label>
          <input 
            type="number" 
            className="control-value-input" 
            value={discount.toFixed(1)} 
            step="0.5"
            onChange={(e) => setDiscount(parseFloat(e.target.value))} 
          />
        </div>
        <input 
          type="range" 
          min="-20" 
          max="80" 
          step="0.5" 
          value={discount} 
          onChange={(e) => setDiscount(parseFloat(e.target.value))} 
        />
      </div>

      <div className="melt-box" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
        <h3 className="melt-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Calculated Diamond Cost</h3>
        
        {(!prices || !isUnlocked || !matchFound) ? (
          <p className="note" style={{ textAlign: 'center', opacity: 0.7 }}>
            {!isUnlocked ? 'Unlock the vault to fetch prices.' : (prices && !matchFound) ? 'No valid price found for this exact geometry.' : 'Loading prices...'}
          </p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Price Breakdown</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base RapNet List / Ct:</span> <span>${basePricePerCarat.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
              </div>
              {lowColorDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff7675' }}>
                  <span>↳ Low Color ({color}):</span> <span>-{(lowColorDiscount * 100).toFixed(1)}%</span>
                </div>
              )}
              {largeStoneIncrease > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff7675' }}>
                  <span>↳ Premium Size ({caratWeight.toFixed(2)}ct):</span> <span>+{(largeStoneIncrease * 100).toFixed(1)}%</span>
                </div>
              )}
              {cutMultiplier !== 1.0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: cutMultiplier > 1 ? '#55efc4' : '#ff7675' }}>
                  <span>↳ Cut ({cut}):</span> <span>{((cutMultiplier - 1) * 100).toFixed(1)}%</span>
                </div>
              )}
              {fluoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff7675' }}>
                  <span>↳ Fluorescence ({fluorescence}):</span> <span>-{(fluoDiscount * 100).toFixed(1)}%</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem', color: 'var(--text-primary)' }}>
                <span>Adjusted List / Ct:</span> <span>${adjustedListPricePerCarat.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>Market Discount ({discount.toFixed(1)}%) applied</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Real Price / Ct:</span> <span>${discountedPricePerCarat.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
              </div>
            </div>

            <div className="melt-row">
              <span className="melt-lbl">Price Per Stone ({caratWeight.toFixed(3)} ct)</span>
              <span className="melt-val">${perStoneCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="melt-row" style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span className="melt-lbl" style={{ color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 600 }}>Total Diamond Parcel ({numDiamonds}x)</span>
              <span className="melt-val" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>${totalDiamondCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiamondPriceCalculator;
