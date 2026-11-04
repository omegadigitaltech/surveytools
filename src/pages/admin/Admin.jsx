import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import config from "../../config/config";
// Corrected AuthToken

// ── number input helpers ───────────────────────────────────────────────────────
// Number fields keep their raw text in state so they can be cleared and typed
// into normally, and are only converted to numbers when the form is submitted.
const digitsOnly = (v) => String(v).replace(/\D/g, "");
const toInt = (v) => (v === "" || v == null ? 0 : parseInt(v, 10) || 0);
const numberInputProps = {
  min: 0,
  step: 1,
  inputMode: "numeric",
  // stop the scroll wheel from silently changing a focused number
  onWheel: (e) => e.target.blur(),
  // all of these fields are whole, non-negative numbers
  onKeyDown: (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  },
};

// Small label so a filled-in number field still says what it is
const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm text-gray-600">{label}</span>
    {children}
  </label>
);

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { authToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState("missions");

  // Basic password protection
  const ADMIN_PASSWORD = "adminpassword123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      toast.error("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full border p-2 rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-[#00A5B5] text-white p-2 rounded font-bold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveTab("missions")}
            className={`px-4 py-2 rounded ${
              activeTab === "missions"
                ? "bg-[#00A5B5] text-white"
                : "bg-white text-gray-700 shadow"
            }`}
          >
            Create Mission
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`px-4 py-2 rounded ${
              activeTab === "levels"
                ? "bg-[#00A5B5] text-white"
                : "bg-white text-gray-700 shadow"
            }`}
          >
            Create Level
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-4 py-2 rounded ${
              activeTab === "marketplace"
                ? "bg-[#00A5B5] text-white"
                : "bg-white text-gray-700 shadow"
            }`}
          >
            Create Listing
          </button>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded shadow">
          {activeTab === "missions" && <CreateMissionForm token={authToken} />}
          {activeTab === "levels" && <CreateLevelForm token={authToken} />}
          {activeTab === "marketplace" && <CreateListingForm token={authToken} />}
        </div>
      </div>
    </div>
  );
};

const MISSION_INITIAL = {
  title: "",
  description: "",
  type: "daily",
  category: "surveys",
  targetValue: "1",
  xpReward: "0",
  pointsReward: "0",
};

const CreateMissionForm = ({ token }) => {
  const [formData, setFormData] = useState(MISSION_INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      targetValue: toInt(formData.targetValue),
      xpReward: toInt(formData.xpReward),
      pointsReward: toInt(formData.pointsReward),
    };
    if (!payload.title) {
      toast.error("Please enter a title");
      return;
    }
    if (payload.targetValue < 1) {
      toast.error("Target value must be at least 1");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${config.API_URL}/admin/gamification/missions`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Mission created successfully!");
      setFormData(MISSION_INITIAL);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create mission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">Create Mission</h2>
      <input
        type="text"
        placeholder="Title"
        className="border p-2 rounded"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Description"
        className="border p-2 rounded"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <select
        className="border p-2 rounded"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <input
        type="text"
        placeholder="Category"
        className="border p-2 rounded"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      />
      <Field label="Target Value">
        <input
          type="number"
          placeholder="Target Value"
          className="border p-2 rounded"
          value={formData.targetValue}
          onChange={(e) =>
            setFormData({ ...formData, targetValue: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          min={1}
          required
        />
      </Field>
      <Field label="XP Reward">
        <input
          type="number"
          placeholder="XP Reward"
          className="border p-2 rounded"
          value={formData.xpReward}
          onChange={(e) =>
            setFormData({ ...formData, xpReward: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
        />
      </Field>
      <Field label="Points Reward">
        <input
          type="number"
          placeholder="Points Reward"
          className="border p-2 rounded"
          value={formData.pointsReward}
          onChange={(e) =>
            setFormData({
              ...formData,
              pointsReward: digitsOnly(e.target.value),
            })
          }
          {...numberInputProps}
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#00A5B5] text-white p-2 rounded mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create Mission"}
      </button>
    </form>
  );
};

const LEVEL_INITIAL = {
  level: "1",
  name: "",
  minXP: "0",
  maxXP: "100",
  benefits: "",
};

const CreateLevelForm = ({ token }) => {
  const [formData, setFormData] = useState(LEVEL_INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    const payload = {
      ...formData,
      name: formData.name.trim(),
      level: toInt(formData.level),
      minXP: toInt(formData.minXP),
      maxXP: toInt(formData.maxXP),
      benefits: formData.benefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
    };
    if (!payload.name) {
      toast.error("Please enter a level name");
      return;
    }
    if (payload.level < 1) {
      toast.error("Level must be at least 1");
      return;
    }
    if (payload.maxXP <= payload.minXP) {
      toast.error("Max XP must be greater than Min XP");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${config.API_URL}/admin/gamification/levels`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Level created successfully!");
      setFormData(LEVEL_INITIAL);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create level");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">Create Level Config</h2>
      <Field label="Level">
        <input
          type="number"
          placeholder="Level"
          className="border p-2 rounded"
          value={formData.level}
          onChange={(e) =>
            setFormData({ ...formData, level: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          min={1}
          required
        />
      </Field>
      <input
        type="text"
        placeholder="Name"
        className="border p-2 rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Field label="Min XP">
        <input
          type="number"
          placeholder="Min XP"
          className="border p-2 rounded"
          value={formData.minXP}
          onChange={(e) =>
            setFormData({ ...formData, minXP: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          required
        />
      </Field>
      <Field label="Max XP">
        <input
          type="number"
          placeholder="Max XP"
          className="border p-2 rounded"
          value={formData.maxXP}
          onChange={(e) =>
            setFormData({ ...formData, maxXP: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          required
        />
      </Field>
      <input
        type="text"
        placeholder="Benefits (comma separated)"
        className="border p-2 rounded"
        value={formData.benefits}
        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#00A5B5] text-white p-2 rounded mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create Level"}
      </button>
    </form>
  );
};

const LISTING_INITIAL = {
  title: "",
  description: "",
  type: "gift_card",
  pointsCost: "0",
  value: "",
  partnerName: "",
  stock: "0",
};

const CreateListingForm = ({ token }) => {
  const [formData, setFormData] = useState(LISTING_INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }
    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      value: formData.value.trim(),
      partnerName: formData.partnerName.trim(),
      pointsCost: toInt(formData.pointsCost),
      stock: toInt(formData.stock),
    };
    if (!payload.title) {
      toast.error("Please enter a title");
      return;
    }
    if (payload.pointsCost < 1) {
      toast.error("Points cost must be at least 1");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${config.API_URL}/admin/marketplace/listings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Listing created successfully!");
      setFormData(LISTING_INITIAL);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">Create Marketplace Listing</h2>
      <input
        type="text"
        placeholder="Title"
        className="border p-2 rounded"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Description"
        className="border p-2 rounded"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <select
        className="border p-2 rounded"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="gift_card">Gift Card</option>
        <option value="product">Product</option>
        <option value="upgrade">Premium Upgrade</option>
      </select>
      <Field label="Points Cost">
        <input
          type="number"
          placeholder="Points Cost"
          className="border p-2 rounded"
          value={formData.pointsCost}
          onChange={(e) =>
            setFormData({ ...formData, pointsCost: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          min={1}
          required
        />
      </Field>
      <input
        type="text"
        placeholder="Value (e.g., 10% Off)"
        className="border p-2 rounded"
        value={formData.value}
        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
      />
      <input
        type="text"
        placeholder="Partner Name"
        className="border p-2 rounded"
        value={formData.partnerName}
        onChange={(e) =>
          setFormData({ ...formData, partnerName: e.target.value })
        }
      />
      <Field label="Stock">
        <input
          type="number"
          placeholder="Stock"
          className="border p-2 rounded"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: digitsOnly(e.target.value) })
          }
          {...numberInputProps}
          required
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#00A5B5] text-white p-2 rounded mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
};

export default Admin;