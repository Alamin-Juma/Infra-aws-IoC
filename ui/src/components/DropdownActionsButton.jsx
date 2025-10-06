
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const DropdownActionsButton = ({ actions, defaultActionKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActionKey, setSelectedActionKey] = useState(defaultActionKey);
  const dropdownRef = useRef(null);

  const selectedAction = actions.find((a) => a.key === selectedActionKey);

  const handleSelectAction = (key, onClick) => {
    setSelectedActionKey(key);
    setIsOpen(false);
    onClick?.();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionColors = {
  edit: "bg-blue-500 text-white hover:bg-blue-600",
  approve: "bg-green-500 text-white hover:bg-green-600",
  reject: "bg-red-500 text-white hover:bg-red-600",
  "more-info": "bg-yellow-500 text-white hover:bg-yellow-600",
};

const actionTextColors = {
  edit: "text-blue-600",
  approve: "text-green-600",
  reject: "text-red-600",
  "more-info": "text-yellow-600",
};

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex h-10">
        

<button
  type="button"
  onClick={selectedAction?.onClick}
  className={`inline-flex items-center px-4 text-sm font-medium border border-r-0 border-gray-300 
  ${actionColors[selectedActionKey] || "bg-white text-gray-700 hover:bg-gray-50"} 
  focus:outline-none rounded-l-md`}
>
  {selectedAction?.label}
</button>
       <button
  type="button"
  onClick={() => setIsOpen((prev) => !prev)}
  className={`inline-flex items-center justify-center w-10 border border-l-0 border-gray-300 rounded-r-md focus:outline-none
    ${
      actionColors[selectedActionKey]
        ? `${actionColors[selectedActionKey].replace("hover:", "")} hover:brightness-90 brightness-95`
        : "bg-white text-gray-500 hover:bg-gray-50"
    }
  `}
>
  <ChevronDown
    className={`w-5 h-5 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
  />
</button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-0 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() =>
                  handleSelectAction(action.key, action.onSelectChange)
                }
               className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
  ${selectedActionKey === action.key ? actionTextColors[action.key] : "text-gray-800"} 
  `}

              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownActionsButton;