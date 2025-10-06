import React, { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/apiInterceptor";
import { toPascalCase } from "../utils/toPascalCase";

export default function CreateScheduleModal({ onCreateSchedule }) {
  const [deviceTypes, setDeviceTypes] = useState([])
  const [recurrencePatterns, setRecurrencePatterns] = useState([]);
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredGroups, setFilteredGrouos] = useState([]);
  const [filteredDeviceTypes, setFilteredDeviceTypes] = useState([]);
  const [deviceTypeSearch, setDeviceTypeSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    deviceTypeId: "",
    recurrencePatternId: "",
    recurring: true,
    assignedToUser: [],
    assignedToRole: [],
    location: "",
    nextDue: "",
  })

  const deviceTypeOptions = [
    "HVAC",
    "Network",
    "Office Equipment",
    "Security",
    "Power",
    "Safety",
    "IT Equipment",
    "Building Systems",
  ]

  const patternOptions = ["Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Semi-annually", "Annually"]

  const fetchDeviceTypes = async () => {
    try {
      const res = await api.get(`/deviceTypes?page=${1}&limit=${100}`);
      setDeviceTypes(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch device types");
    }
  };

  const getTotalDeviceCount = () => {
    return formData.deviceTypeId ? 1 : 0;
  }

  const getTotalAssignees = () => {
    return (formData.assignedToRole?.length ?? 0) + 
            (formData.assignedToUser?.length ?? 0);
  }

  const fetchRecurrencePatterns = async () => {
    try {
      const res = await api.get(`/api/recurrence-patterns?page=${1}&limit=${100}`);
      setRecurrencePatterns(res.data.data);
    } catch {
      toast.error("Failed to fetch device types");
    }
  };

  const removeUser = (userId) => {
    
  }
  
  const showUsers = (userId) => {
    
  }

  const showGroups = (userId) => {
    
  }

  const handleCancel = () => {
    setIsOpen(false);
  }

  const showDeviceTypes = () => {

  }

  const toggleDeviceType = (deviceTypeId) => {
    setFormData(prev => ({...prev, deviceTypeId: deviceTypeId}));
    setDeviceTypeSearch("");
  }

  useEffect(() => {
    if(deviceTypeSearch.length > 3){
      const filteredDeviceTypes = deviceTypes.filter((dt) => {
          return dt.name.toLowerCase() === deviceTypeSearch.toLowerCase()
}      );

      setFilteredDeviceTypes(filteredDeviceTypes);
    }
  }, [deviceTypeSearch])

  useEffect(() => {
    fetchDeviceTypes();
    fetchRecurrencePatterns();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.deviceTypes.length > 0 && formData.pattern && formData.nextDue) {
      onCreateSchedule(formData)
      setFormData({
        title: "",
        deviceTypeId: "",
        recurrencePatternId: "",
        recurring: true,
        assignedToUser: [],
        assignedToRole: [],
        location: "",
        nextDue: "",
      })
      setIsOpen(false)
    }
  }

  const handleDeviceTypeChange = (deviceType, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        deviceTypes: [...prev.deviceTypes, deviceType],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        deviceTypes: prev.deviceTypes.filter((type) => type !== deviceType),
      }))
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#8BC34A] hover:bg-[#7CB342] text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        + Create Schedule
      </button>
    )
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4  z-[99999]">
      <div className="bg-white rounded-lg w-1/2 max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Create Maintenance Schedule</h2>
            <p className="text-gray-600 mt-1">Set up a new maintenance schedule for your equipment</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Schedule Title */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-900">
                Schedule Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Weekly Laptop Maintenance"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-900">Location</label>
              <input
                type="text"
                placeholder="e.g., Building A, Floor 2"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
              />
            </div>

            {/* Device Type Selection */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-gray-900">
                Select Device Types <span className="text-red-500">*</span>
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({formData.deviceTypeId} types selected, {getTotalDeviceCount()} total devices)
                </span>
              </label>

              {/* Selected Device Types */}
              {formData.deviceTypeId > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {(() => {
                    const typeId = formData.deviceTypeId;
                    const deviceType = deviceTypes.find((dt) => dt.id === typeId);

                    return deviceType ? (
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {toPascalCase(deviceType.name)}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({...prev, deviceTypeId: null}))}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          title="Remove device type"
                        >
                          ✕
                        </button>
                      </span>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Device Types Dropdown */}
              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeviceTypes(!showDeviceTypes)
                    setShowUsers(false)
                    setShowGroups(false)
                  }}
                  className="w-full h-12 px-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  <span className="text-gray-500">Search and select device types...</span>
                  <span className={`text-gray-400 transition-transform ${showDeviceTypes ? "rotate-180" : ""}`}>▼</span>
                </button>

                {showDeviceTypes && (
                  <div className={`absolute z-20 w-full mt-1 bg-white rounded-md ${deviceTypeSearch.length > 0 && 'border border-gray-300 shadow-lg max-h-80 overflow-hidden'}`}>
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search device types..."
                        value={deviceTypeSearch}
                        onChange={(e) => setDeviceTypeSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8BC34A] text-sm"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {deviceTypeSearch.length === 0 ? (<></>) : 
                        ( filteredDeviceTypes.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No device types found</div>
                        ) : (
                          filteredDeviceTypes.map((deviceType) => (
                            <div
                              key={deviceType.id}
                              onClick={() => toggleDeviceType(deviceType.id)}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center mr-3">
                                <span
                                  className={`text-lg ${formData.deviceTypeId === deviceType.id ? "text-[#8BC34A]" : "text-gray-300"}`}
                                >
                                  {formData.deviceTypeId === deviceType.id ? "✓" : "○"}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{toPascalCase(deviceType.name)}</div>
                              </div>
                            </div>
                          ))
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pattern Selection and Date Settings */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-900">
                    Schedule Pattern <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pattern}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pattern: e.target.value }))}
                    className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                    required
                  >
                    <option value="">Select pattern</option>
                    {recurrencePatterns.map((pattern) => (
                      <option key={pattern.id} value={pattern.id}>
                        {pattern.name} - {pattern.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-900">
                    Next Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.nextDue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nextDue: e.target.value }))}
                    className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                    required
                  />
                </div>
              </div>

              {/* Recurrence Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="recurrent"
                  checked={formData.isRecurrent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isRecurrent: e.target.checked }))}
                  className="w-4 h-4 text-[#8BC34A] border-gray-300 rounded focus:ring-[#8BC34A]"
                />
                <label htmlFor="recurrent" className="text-base font-medium text-gray-900 cursor-pointer">
                  Set as recurrent maintenance
                </label>
              </div>

              {/* End Date - Show when recurrent is selected */}
              {formData.isRecurrent && (
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-900">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty for indefinite recurrence. The maintenance schedule will stop after this date.
                  </p>
                </div>
              )}
            </div>

            {/* User Assignment */}
            <div className="space-y-4">
              <label className="block text-base font-medium text-gray-900">
                Assign Users
                <span className="text-sm font-normal text-gray-600 ml-2">({getTotalAssignees()} total assignees)</span>
              </label>

              {/* Individual Users */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Individual Users</label>

                {/* Selected Users */}
                {formData.assignedToUser.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {formData.assignedToUser.map((userId) => {
                      return (
                        <span
                          key={userId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {userId}
                          <button
                            type="button"
                            onClick={() => removeUser(userId)}
                            className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                            title="Remove user"
                          >
                            ✕
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Users Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUsers(!showUsers)
                      setShowDeviceTypes(false)
                      setShowGroups(false)
                    }}
                    className="w-full h-12 px-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-500">Search and select users...</span>
                    <span className={`text-gray-400 transition-transform ${showUsers ? "rotate-180" : ""}`}>▼</span>
                  </button>

                  {showUsers && (
                    <div className={`absolute z-20 w-full mt-1 bg-white rounded-md ${userSearch.length > 0 && 'border border-gray-300 shadow-lg max-h-80 overflow-hidden'}`}>
                      <div className="p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8BC34A] text-sm"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {userSearch.length === 0 ? (<></>) : 
                          (filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => toggleUser(user.id)}
                                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center mr-3">
                                  <span
                                    className={`text-lg ${formData.selectedUsers.includes(user.id) ? "text-[#8BC34A]" : "text-gray-300"}`}
                                  >
                                    {formData.selectedUsers.includes(user.id) ? "✓" : "○"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                            ))
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Groups */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">User Groups</label>

                {/* Selected Groups */}
                {formData.assignedToRole.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {formData.assignedToRole.map((groupId) => {
                      const group = mockGroups.find((g) => g.id === groupId)
                      return (
                        <span
                          key={groupId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {group?.name}
                          <button
                            type="button"
                            onClick={() => removeGroup(groupId)}
                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                            title="Remove group"
                          >
                            ✕
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Groups Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroups(!showGroups)
                      setShowDeviceTypes(false)
                      setShowUsers(false)
                    }}
                    className="w-full h-12 px-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-500">Search and select groups...</span>
                    <span className={`text-gray-400 transition-transform ${showGroups ? "rotate-180" : ""}`}>▼</span>
                  </button>

                  {showGroups && (
                    <div className={`absolute z-20 w-full mt-1 bg-white rounded-md ${groupSearch.length > 0 && 'border border-gray-300 shadow-lg max-h-80 overflow-hidden'}`}>
                      <div className="p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search groups..."
                          value={groupSearch}
                          onChange={(e) => setGroupSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8BC34A] text-sm"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {groupSearch.length === 0 ? (<></>) :
                          (filteredGroups.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No groups found</div>
                          ) : (
                            filteredGroups.map((group) => (
                              <div
                                key={group.id}
                                onClick={() => toggleGroup(group.id)}
                                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center mr-3">
                                  <span
                                    className={`text-lg ${formData.assignedToRole.includes(group.id) ? "text-[#8BC34A]" : "text-gray-300"}`}
                                  >
                                    {formData.assignedToRole.includes(group.id) ? "✓" : "○"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{group.name}</div>
                                  <div className="text-sm text-gray-500">{group.description}</div>
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                                    {group.members}
                                  </span>
                                </div>
                              </div>
                            ))
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-12 px-4 text-base border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.title.trim() ||
                formData.selectedDeviceTypes.length === 0 ||
                !formData.pattern ||
                !formData.nextDue
              }
              className="flex-1 h-12 px-4 text-base bg-[#8BC34A] hover:bg-[#7CB342] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
