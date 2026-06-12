import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { token } = useAuthStore();
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="flex gap-4 mb-8">
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

        <div className="bg-white p-6 rounded shadow">
          {activeTab === "missions" && <CreateMissionForm token={token} />}
          {activeTab === "levels" && <CreateLevelForm token={token} />}
          {activeTab === "marketplace" && <CreateListingForm token={token} />}
        </div>
      </div>
    </div>
  );
};

const CreateMissionForm = ({ token }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "daily",
    category: "surveys",
    targetValue: 1,
    xpReward: 0,
    pointsReward: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/admin/gamification/missions",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Mission created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create mission");
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
      <input
        type="number"
        placeholder="Target Value"
        className="border p-2 rounded"
        value={formData.targetValue}
        onChange={(e) =>
          setFormData({ ...formData, targetValue: Number(e.target.value) })
        }
      />
      <input
        type="number"
        placeholder="XP Reward"
        className="border p-2 rounded"
        value={formData.xpReward}
        onChange={(e) =>
          setFormData({ ...formData, xpReward: Number(e.target.value) })
        }
      />
      <input
        type="number"
        placeholder="Points Reward"
        className="border p-2 rounded"
        value={formData.pointsReward}
        onChange={(e) =>
          setFormData({ ...formData, pointsReward: Number(e.target.value) })
        }
      />
      <button
        type="submit"
        className="bg-[#00A5B5] text-white p-2 rounded mt-4"
      >
        Create Mission
      </button>
    </form>
  );
};

const CreateLevelForm = ({ token }) => {
  const [formData, setFormData] = useState({
    level: 1,
    name: "",
    minXP: 0,
    maxXP: 100,
    benefits: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/admin/gamification/levels",
        {
          ...formData,
          benefits: formData.benefits.split(",").map((b) => b.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Level created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create level");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">Create Level Config</h2>
      <input
        type="number"
        placeholder="Level"
        className="border p-2 rounded"
        value={formData.level}
        onChange={(e) =>
          setFormData({ ...formData, level: Number(e.target.value) })
        }
        required
      />
      <input
        type="text"
        placeholder="Name"
        className="border p-2 rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Min XP"
        className="border p-2 rounded"
        value={formData.minXP}
        onChange={(e) =>
          setFormData({ ...formData, minXP: Number(e.target.value) })
        }
        required
      />
      <input
        type="number"
        placeholder="Max XP"
        className="border p-2 rounded"
        value={formData.maxXP}
        onChange={(e) =>
          setFormData({ ...formData, maxXP: Number(e.target.value) })
        }
        required
      />
      <input
        type="text"
        placeholder="Benefits (comma separated)"
        className="border p-2 rounded"
        value={formData.benefits}
        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
      />
      <button
        type="submit"
        className="bg-[#00A5B5] text-white p-2 rounded mt-4"
      >
        Create Level
      </button>
    </form>
  );
};

const CreateListingForm = ({ token }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "gift_card",
    pointsCost: 0,
    value: "",
    partnerName: "",
    stock: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/admin/marketplace/listings",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Listing created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
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
      <input
        type="number"
        placeholder="Points Cost"
        className="border p-2 rounded"
        value={formData.pointsCost}
        onChange={(e) =>
          setFormData({ ...formData, pointsCost: Number(e.target.value) })
        }
        required
      />
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
      <input
        type="number"
        placeholder="Stock"
        className="border p-2 rounded"
        value={formData.stock}
        onChange={(e) =>
          setFormData({ ...formData, stock: Number(e.target.value) })
        }
        required
      />
      <button
        type="submit"
        className="bg-[#00A5B5] text-white p-2 rounded mt-4"
      >
        Create Listing
      </button>
    </form>
  );
};

export default Admin;
