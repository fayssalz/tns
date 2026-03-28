import React, { useState, useEffect, useCallback } from 'react';
import SizerCalculator from './components/SizerCalculator';
import BraceletVisualizer from './components/BraceletVisualizer';
import GoldCalculator from './components/GoldCalculator';
import './index.css';

// Core default assumptions (based loosely on standard brilliant cuts and jewelry settings)
// diameter (mm) -> carat mapping approximation (customizable by user)
export const getCaratFromDiameter = (d) => {
  if (d <= 0) return 0;
  // Carat = diameter * diameter * height * 0.00617 (where height = 60% of diameter)
  const height = d * 0.6;
  const estimated = d * d * height * 0.00617;
  return Number(estimated.toFixed(3));
};

export const getDiameterFromCarat = (ct) => {
  if (ct <= 0) return 0;
  // Inverse: diameter = cbrt(ct / (0.6 * 0.00617))
  const multiplier = 0.6 * 0.00617;
  return Number(Math.cbrt(ct / multiplier).toFixed(3));
};

function App() {
  // State variables
  const [length, setLength] = useState(170); // mm (17cm)
  const [numDiamonds, setNumDiamonds] = useState(80);
  const [diameter, setDiameter] = useState(1.7);
  const [carat, setCarat] = useState(0.02);
  const [totalCarat, setTotalCarat] = useState(1.6);
  const [claspLength, setClaspLength] = useState(15); // mm
  
  // The intrinsic gap is derived or fixed. Let's make gap fixed for simplicity unless modified.
  // Gap = distance between stones
  const [gap, setGap] = useState(0.2); // mm default gap
  
  // Handlers for bidirectional updating
  // When Length changes: Adjust Number of Diamonds (keeping diameter/gap fixed)
  const handleLengthChange = (val) => {
    setLength(val);
    const usableLength = val - claspLength;
    const linkSize = diameter + gap;
    const newNum = Math.max(1, Math.round(usableLength / linkSize));
    setNumDiamonds(newNum);
    setTotalCarat(Number((newNum * carat).toFixed(3)));
  };

  // When Number of Diamonds changes: Adjust Length (keeping diameter/gap fixed)
  const handleNumDiamondsChange = (val) => {
    setNumDiamonds(val);
    const linkSize = diameter + gap;
    const newLength = (val * linkSize) + claspLength;
    setLength(Number(newLength.toFixed(3)));
    setTotalCarat(Number((val * carat).toFixed(3)));
  };

  // When Diameter changes: Update Carat, recalculate Number of Diamonds to fit the CURRENT Length
  const handleDiameterChange = (val) => {
    setDiameter(val);
    const newCarat = getCaratFromDiameter(val);
    setCarat(newCarat);
    
    // Fit to current length
    const usableLength = length - claspLength;
    const linkSize = val + gap;
    const newNum = Math.max(1, Math.round(usableLength / linkSize));
    setNumDiamonds(newNum);
    setTotalCarat(Number((newNum * newCarat).toFixed(3)));
  };

  // When Carat changes: Update Diameter, recalculate to fit CURRENT Length
  const handleCaratChange = (val) => {
    setCarat(val);
    const newDiam = getDiameterFromCarat(val);
    setDiameter(newDiam);
    
    const usableLength = length - claspLength;
    const linkSize = newDiam + gap;
    const newNum = Math.max(1, Math.round(usableLength / linkSize));
    setNumDiamonds(newNum);
    setTotalCarat(Number((newNum * val).toFixed(3)));
  };

  // Run an initial calibration based on exactly the "17cm, 1.7mm, 0.02ct, ~152 stones" from user table if possible.
  // Wait, if 170 = (N * (1.7 + gap)) + clasp. If N=152 and clasp=0, gap = 170/152 - 1.7 = 1.118 - 1.7 < 0.
  // This physically means diamonds are layered or overlapping in that setting, OR the length is measured differently.
  // We will let the math hold standard spatial laws.

  useEffect(() => {
    // Initial sync
    handleDiameterChange(3.0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const state = {
    length, numDiamonds, diameter, carat, totalCarat, claspLength, gap
  };

  return (
    <div className="app-container">
      <div className="controls-section glass-panel">
        <div>
          <h1>Tennis Bracelet Configurator</h1>
          <p className="subtitle">
            Fine-tune specifications for your perfect piece. All sizing elements react bidirectionally to ensure physical accuracy.
          </p>
        </div>
        
        <SizerCalculator 
          state={state} 
          handlers={{
            handleLengthChange,
            handleNumDiamondsChange,
            handleDiameterChange,
            handleCaratChange
          }} 
        />
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Carat Weight</span>
            <div className="stat-value">{totalCarat.toFixed(3)} <span>ctw</span></div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Diamonds</span>
            <div className="stat-value">{numDiamonds} <span>stones</span></div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Bracelet Length</span>
            <div className="stat-value">{(length / 10).toFixed(3)} <span>cm</span></div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Est. Width</span>
            <div className="stat-value">{diameter.toFixed(3)} <span>mm</span></div>
          </div>
        </div>
        
        <GoldCalculator 
          numDiamonds={numDiamonds} 
          diameter={diameter} 
        />
      </div>

      <div className="visualizer-section">
        <BraceletVisualizer params={state} />
      </div>
    </div>
  );
}

export default App;
