import React, { useState,useEffect } from "react";

const MultiValueInput = ({ placeholder = "Enter values", onChange,existingTags = [] }) => {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState(existingTags);

  useEffect(() => {
    setTags(existingTags);
  }, [existingTags]);



  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Add a tag when Enter or comma is pressed
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !tags.includes(value)) {
        const newTags = [...tags, value];
        setTags(newTags);
        setInputValue("");
        onChange(newTags); // Notify parent component of changes
      }
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onChange(newTags); // Notify parent component of changes
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2 focus-within:border-blue-500">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-blue-800 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
         
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="flex-1 outline-none input input-solid"
        />
      </div>
    </div>
  );
};

export default MultiValueInput;
