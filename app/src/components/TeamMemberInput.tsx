"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { isAddress } from "viem";

export interface TeamMember {
  address: string;
  role: string;
}

interface TeamMemberInputProps {
  teamMembers: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  disabled?: boolean;
}

const ROLE_PRESETS = [
  "Technical Lead / CTO",
  "Product Manager / CPO",
  "Designer / Creative Director",
  "Marketing Lead / CMO",
  "Business Development",
  "Community Manager",
  "Developer",
  "Custom",
];

export function TeamMemberInput({ teamMembers, onChange, disabled = false }: TeamMemberInputProps) {
  const [newAddress, setNewAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("Technical Lead / CTO");
  const [customRole, setCustomRole] = useState("");
  const [addressError, setAddressError] = useState("");

  const handleAddMember = () => {
    // Clear previous error
    setAddressError("");

    // Validate address
    if (!newAddress.trim()) {
      setAddressError("Please enter a wallet address");
      return;
    }

    if (!isAddress(newAddress)) {
      setAddressError("Invalid wallet address format");
      return;
    }

    // Check for duplicates
    const isDuplicate = teamMembers.some(
      (member) => member.address.toLowerCase() === newAddress.toLowerCase()
    );

    if (isDuplicate) {
      setAddressError("This address is already in the team");
      return;
    }

    // Get the final role
    const finalRole = selectedRole === "Custom" ? customRole.trim() : selectedRole;

    if (!finalRole) {
      setAddressError("Please specify a role");
      return;
    }

    // Add the new member
    onChange([...teamMembers, { address: newAddress, role: finalRole }]);

    // Reset form
    setNewAddress("");
    setSelectedRole("Technical Lead / CTO");
    setCustomRole("");
  };

  const handleRemoveMember = (index: number) => {
    const updated = teamMembers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddressChange = (value: string) => {
    setNewAddress(value);
    if (addressError) {
      setAddressError("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Member Form */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-6">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-600 mb-4">
          Add Team Member
        </h4>

        <div className="space-y-4">
          {/* Address Input */}
          <div>
            <label htmlFor="member-address" className="input-label text-sm flex items-center gap-2">
              <Icon name="user" size="sm" />
              Wallet Address *
            </label>
            <input
              id="member-address"
              type="text"
              value={newAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x..."
              className={`input-field text-sm ${addressError ? "border-red-300 focus:border-red-500" : ""}`}
              disabled={disabled}
            />
            {addressError && (
              <p className="mt-2 text-xs text-red-600">{addressError}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="member-role" className="input-label text-sm flex items-center gap-2">
              <Icon name="tag" size="sm" />
              Role *
            </label>
            <select
              id="member-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field text-sm"
              disabled={disabled}
            >
              {ROLE_PRESETS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Role Input */}
          {selectedRole === "Custom" && (
            <div>
              <label htmlFor="custom-role" className="input-label text-sm">
                Custom Role *
              </label>
              <input
                id="custom-role"
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g., Smart Contract Auditor"
                className="input-field text-sm"
                disabled={disabled}
                maxLength={50}
              />
              <p className="mt-2 text-xs text-gray-500">
                {customRole.length}/50 characters
              </p>
            </div>
          )}

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAddMember}
            disabled={disabled}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Icon name="plus" size="sm" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Team Members ({teamMembers.length})
          </h4>
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-gray-900 truncate">
                    {member.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {member.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  disabled={disabled}
                  className="flex-shrink-0 rounded-full p-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Remove team member"
                >
                  <Icon name="trash" size="sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No team members added yet. Add co-founders to share credit and build trust.
        </div>
      )}
    </div>
  );
}
