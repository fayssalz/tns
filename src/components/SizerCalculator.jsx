import React from 'react';
import { Target, Scale, Diamond, Layers } from 'lucide-react';
import '../index.css';

const SizerCalculator = ({ state, handlers }) => {
  const { length, numDiamonds, diameter, carat, totalCarat } = state;

  return (
    <>
      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <Scale size={16} /> Bracelet Length (cm)
          </label>
          <input
            type="number"
            className="control-value-input"
            value={(length / 10).toFixed(3)}
            step="0.001"
            min="10"
            max="30"
            onChange={(e) => handlers.handleLengthChange(parseFloat(e.target.value) * 10)}
          />
        </div>
        <input
          type="range"
          min="100"
          max="300"
          step="1"
          value={length}
          onChange={(e) => handlers.handleLengthChange(parseInt(e.target.value))}
        />
        <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
          Standard sizes range from 16 to 19 cm.
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <Layers size={16} /> Total Diamonds
          </label>
          <input
            type="number"
            className="control-value-input"
            value={numDiamonds}
            onChange={(e) => handlers.handleNumDiamondsChange(parseInt(e.target.value))}
          />
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={numDiamonds}
          onChange={(e) => handlers.handleNumDiamondsChange(parseInt(e.target.value))}
        />
        <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
          Adjusts bracelet length physically.
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <Target size={16} /> Max Size (mm)
          </label>
          <input
            type="number"
            className="control-value-input"
            value={diameter.toFixed(3)}
            step="0.001"
            onChange={(e) => handlers.handleDiameterChange(parseFloat(e.target.value))}
          />
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="0.001"
          value={diameter}
          onChange={(e) => handlers.handleDiameterChange(parseFloat(e.target.value))}
        />
        <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
          Diamond diameter width. Adjusts diamond size.
        </div>
      </div>

      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <Diamond size={16} /> Carat Weight (Each)
          </label>
          <input
            type="number"
            className="control-value-input"
            value={carat.toFixed(3)}
            step="0.001"
            onChange={(e) => handlers.handleCaratChange(parseFloat(e.target.value))}
          />
        </div>
        <input
          type="range"
          min="0.01"
          max="2"
          step="0.001"
          value={carat}
          onChange={(e) => handlers.handleCaratChange(parseFloat(e.target.value))}
        />
        <div className="subtitle" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
          Carat estimate. Updates diamond diameter bidirectionally.
        </div>
      </div>
    </>
  );
};

export default SizerCalculator;
