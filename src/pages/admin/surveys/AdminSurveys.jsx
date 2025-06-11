import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../../../config/config";
import useAuthStore from "../../../store/useAuthStore";
import { toast } from "react-toastify";
import "./AdminSurveys.css";

const AdminSurveys = () => {
  const { authToken } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    search: "",
    published: "",
    paid: "",
    userId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchSurveys();
  }, [filters]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") params.append(key, value);
      });

      const response = await fetch(`${config.API_URL}/admin/surveys?${params}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        setSurveys(data.data.surveys);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.msg || "Failed to fetch surveys");
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast.error("Error loading surveys");
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
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

  const markAsPaid = async (surveyId, userEmail) => {
    try {
      setProcessing(prev => ({ ...prev, [`paid_${surveyId}`]: true }));

      const response = await fetch(`${config.API_URL}/admin/surveys/${surveyId}/mark-paid`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success(data.msg);
        // Update the survey in the local state
        setSurveys(prev => prev.map(survey => 
          survey._id === surveyId 
            ? { ...survey, isPaid: true, payment: data.data }
            : survey
        ));
      } else {
        throw new Error(data.msg || "Failed to mark survey as paid");
      }
    } catch (error) {
      console.error("Error marking survey as paid:", error);
      toast.error("Error marking survey as paid");
    } finally {
      setProcessing(prev => ({ ...prev, [`paid_${surveyId}`]: false }));
    }
  };

  const unpublishSurvey = async (surveyId, reason = "") => {
    try {
      setProcessing(prev => ({ ...prev, [`unpublish_${surveyId}`]: true }));

      const response = await fetch(`${config.API_URL}/admin/surveys/${surveyId}/unpublish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success(data.msg);
        // Update the survey in the local state
        setSurveys(prev => prev.map(survey => 
          survey._id === surveyId 
            ? { ...survey, published: false, unpublishedAt: new Date().toISOString(), unpublishReason: reason }
            : survey
        ));
      } else {
        throw new Error(data.msg || "Failed to unpublish survey");
      }
    } catch (error) {
      console.error("Error unpublishing survey:", error);
      toast.error("Error unpublishing survey");
    } finally {
      setProcessing(prev => ({ ...prev, [`unpublish_${surveyId}`]: false }));
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading && surveys.length === 0) {
    return (
      <div className="admin-surveys">
        <div className="admin-loading">Loading surveys...</div>
      </div>
    );
  }

  return (
    <div className="admin-surveys">
      <div className="admin-surveys-header">
        <div className="header-left">
          <Link to="/admin" className="back-link">← Back to Dashboard</Link>
          <h1>Survey Management</h1>
          <p>Monitor and manage all platform surveys</p>
        </div>
      </div>

      <div className="admin-surveys-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search surveys by title or description..."
            defaultValue={filters.search}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="filter-controls">
          <select
            value={filters.published}
            onChange={(e) => handleFilterChange("published", e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>

          <select
            value={filters.paid}
            onChange={(e) => handleFilterChange("paid", e.target.value)}
            className="filter-select"
          >
            <option value="">All Payment</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
            className="limit-select"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      <div className="surveys-table-container">
        <table className="surveys-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} className="sortable">
                Title {filters.sortBy === 'title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Owner</th>
              <th onClick={() => handleSort('no_of_participants')} className="sortable">
                Participants {filters.sortBy === 'no_of_participants' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Payment</th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey._id}>
                <td className="survey-title">
                  <div className="title-info">
                    <div className="title">{survey.title}</div>
                    <div className="description">{survey.description?.substring(0, 100)}...</div>
                  </div>
                </td>
                <td className="survey-owner">
                  <div className="owner-info">
                    <div className="owner-name">{survey.user_id?.fullname}</div>
                    <div className="owner-email">{survey.user_id?.email}</div>
                    <div className="owner-points">Points: {survey.user_id?.pointBalance?.toLocaleString() || 0}</div>
                  </div>
                </td>
                <td className="participants">
                  <div className="participant-stats">
                    <div className="filled">{survey.filledCount || 0} filled</div>
                    <div className="total">of {survey.no_of_participants} total</div>
                    <div className="remaining">{survey.remainingSpots || survey.no_of_participants} remaining</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${survey.published ? 'published' : 'unpublished'}`}>
                    {survey.published ? 'Published' : 'Unpublished'}
                  </span>
                </td>
                <td>
                  <div className="payment-info">
                    <span className={`payment-badge ${survey.isPaid ? 'paid' : 'unpaid'}`}>
                      {survey.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    {survey.payment && (
                      <div className="payment-details">
                        <div className="amount">{formatCurrency(survey.payment.amount)}</div>
                        <div className="payment-date">{formatDate(survey.payment.paymentDate)}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="date">{formatDate(survey.createdAt)}</td>
                <td className="actions">
                  <div className="action-buttons">
                    {!survey.isPaid && (
                      <button
                        onClick={() => markAsPaid(survey._id, survey.user_id?.email)}
                        disabled={processing[`paid_${survey._id}`]}
                        className="action-btn mark-paid"
                      >
                        {processing[`paid_${survey._id}`] ? 'Processing...' : 'Mark Paid'}
                      </button>
                    )}
                    
                    {survey.published && (
                      <button
                        onClick={() => {
                          const reason = prompt("Reason for unpublishing (optional):");
                          if (reason !== null) {
                            unpublishSurvey(survey._id, reason);
                          }
                        }}
                        disabled={processing[`unpublish_${survey._id}`]}
                        className="action-btn unpublish"
                      >
                        {processing[`unpublish_${survey._id}`] ? 'Processing...' : 'Unpublish'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {surveys.length === 0 && !loading && (
        <div className="no-surveys">
          <div className="no-surveys-icon">📊</div>
          <h3>No surveys found</h3>
          <p>Try adjusting your search or filter criteria</p>
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
            ({pagination.totalSurveys} total surveys)
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

export default AdminSurveys; 