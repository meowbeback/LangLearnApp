import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, error }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;