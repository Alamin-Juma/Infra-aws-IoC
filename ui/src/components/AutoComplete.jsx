import React, { useState, useEffect } from 'react';
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

const Autocomplete = ({ value, onChange, onSelect }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setOptions(data.map(device => device.serialNumber));
    };

    fetchOptions();
  }, []);

  return (
    <TextInput
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      options={options}
      maxOptions={5}
    />
  );
};

export default Autocomplete;
