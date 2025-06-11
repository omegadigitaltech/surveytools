import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../../../config/config";
import useAuthStore from "../../../store/useAuthStore";
import { toast } from "react-toastify";
import "./AdminUsers.css";

const AdminUsers = () => {
  const { authToken } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [processingAdmin, setProcessingAdmin] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`${config.API_URL}/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.msg || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("search");
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const toggleAdminStatus = async (userId, currentAdminStatus) => {
    try {
      setProcessingAdmin(prev => ({ ...prev, [userId]: true }));

      const response = await fetch(`${config.API_URL}/admin/users/${userId}/admin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminStatus: !currentAdminStatus }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success(data.msg);
        // Update the user in the local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, admin: !currentAdminStatus }
            : user
        ));
      } else {
        throw new Error(data.msg || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Error updating admin status");
    } finally {
      setProcessingAdmin(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-users">
        <div className="admin-loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <div className="header-left">
          <Link to="/admin" className="back-link">← Back to Dashboard</Link>
          <h1>User Management</h1>
          <p>Manage and monitor all platform users</p>
        </div>
      </div>

      <div className="admin-users-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search users by name, email, ID, or institution..."
            defaultValue={filters.search}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="view-controls">
          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="limit-select"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('fullname')} className="sortable">
                Name {filters.sortBy === 'fullname' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Institution</th>
              <th onClick={() => handleSort('pointBalance')} className="sortable">
                Points {filters.sortBy === 'pointBalance' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Admin</th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Joined {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-name">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="name">{user.fullname}</div>
                      <div className="user-id">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.institution || 'Not specified'}</td>
                <td className="points">{user.pointBalance?.toLocaleString() || 0}</td>
                <td>
                  <span className={`status-badge ${user.verified ? 'verified' : 'unverified'}`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleAdminStatus(user.id, user.admin)}
                    disabled={processingAdmin[user.id]}
                    className={`admin-toggle ${user.admin ? 'admin' : 'user'}`}
                  >
                    {processingAdmin[user.id] ? 'Processing...' : (user.admin ? 'Admin' : 'User')}
                  </button>
                </td>
                <td className="date">{formatDate(user.createdAt)}</td>
                <td>
                  <Link 
                    to={`/admin/users/${user.id}/redemptions`}
                    className="action-btn view-redemptions"
                  >
                    View Redemptions
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="no-users">
          <div className="no-users-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalUsers} total users)
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 