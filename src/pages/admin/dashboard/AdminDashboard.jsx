import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../../../config/config";
import useAuthStore from "../../../store/useAuthStore";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { authToken } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSurveys: 0,
    totalRedemptions: 0,
    publishedSurveys: 0,
    pendingRedemptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch users count
      const usersResponse = await fetch(`${config.API_URL}/admin/users?limit=1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const usersData = await usersResponse.json();

      // Fetch surveys count
      const surveysResponse = await fetch(`${config.API_URL}/admin/surveys?limit=1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const surveysData = await surveysResponse.json();

      // Fetch published surveys count
      const publishedSurveysResponse = await fetch(`${config.API_URL}/admin/surveys?published=true&limit=1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const publishedSurveysData = await publishedSurveysResponse.json();

      // Fetch redemptions stats
      const redemptionsResponse = await fetch(`${config.API_URL}/admin/redemptions/stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const redemptionsData = await redemptionsResponse.json();

      setStats({
        totalUsers: usersData.data?.pagination?.totalUsers || 0,
        totalSurveys: surveysData.data?.pagination?.totalSurveys || 0,
        publishedSurveys: publishedSurveysData.data?.pagination?.totalSurveys || 0,
        totalRedemptions: redemptionsData.data?.statusCounts?.total || 0,
        pendingRedemptions: redemptionsData.data?.statusCounts?.pending || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Error loading dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the SurveyPro Admin Panel</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          <Link to="/admin/users" className="stat-link">
            View All →
          </Link>
        </div>

        <div className="admin-stat-card surveys">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalSurveys.toLocaleString()}</h3>
            <p>Total Surveys</p>
          </div>
          <Link to="/admin/surveys" className="stat-link">
            Manage →
          </Link>
        </div>

        <div className="admin-stat-card published">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.publishedSurveys.toLocaleString()}</h3>
            <p>Published Surveys</p>
          </div>
          <Link to="/admin/surveys?published=true" className="stat-link">
            View →
          </Link>
        </div>

        <div className="admin-stat-card redemptions">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.totalRedemptions.toLocaleString()}</h3>
            <p>Total Redemptions</p>
          </div>
          <Link to="/admin/redemptions" className="stat-link">
            Manage →
          </Link>
        </div>

        <div className="admin-stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRedemptions.toLocaleString()}</h3>
            <p>Pending Redemptions</p>
          </div>
          <Link to="/admin/redemptions?status=pending" className="stat-link">
            Review →
          </Link>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/users" className="quick-action-card">
            <div className="action-icon">👤</div>
            <h3>Manage Users</h3>
            <p>View, search, and manage user accounts</p>
          </Link>

          <Link to="/admin/surveys" className="quick-action-card">
            <div className="action-icon">📋</div>
            <h3>Survey Management</h3>
            <p>Monitor, publish, and unpublish surveys</p>
          </Link>

          <Link to="/admin/redemptions" className="quick-action-card">
            <div className="action-icon">🎁</div>
            <h3>Redemptions</h3>
            <p>Track and manage point redemptions</p>
          </Link>

          <Link to="/admin/redemptions/stats" className="quick-action-card">
            <div className="action-icon">📈</div>
            <h3>Analytics</h3>
            <p>View detailed statistics and reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 