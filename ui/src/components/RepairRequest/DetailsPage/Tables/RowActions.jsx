import React, { useMemo } from "react";
import { MoreVertical, Wrench, Archive, UserPlus, ClipboardList } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getUserPermissions } from "../../../../services/permission.service";
import { PERMISSION_VIEW_VENDORS } from "../../../../constants/permissions.constants";

export function RowActions() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const canAssignToVendor = useMemo(() => {
    const permissions = getUserPermissions();
    return permissions.includes(PERMISSION_VIEW_VENDORS.toUpperCase());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFix = () => {
    console.log("Fix clicked");
    setIsOpen(false);
  };

  const handleRetire = () => {
    console.log("Retire clicked");
    setIsOpen(false);
  };

  const handleAssignToVendor = () => {
    console.log("Assign to Vendor clicked");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Open options menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-0 w-48 rounded-md border border-border bg-white shadow-lg z-50">
          <div className="p-1">
            <button
              onClick={handleFix}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <ClipboardList className="h-4 w-4" />
              Repair
            </button>

            <button
              onClick={handleFix}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              Fix
            </button>
            <button
              onClick={handleRetire}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <Archive className="h-4 w-4" />
              Retire
            </button>
            {canAssignToVendor && (
              <button
                onClick={handleAssignToVendor}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Assign to Vendor
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
