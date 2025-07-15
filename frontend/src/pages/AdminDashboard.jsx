import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const token = localStorage.getItem("token");

  const fetchDashboardData = useCallback(async () => {
    try {
      const userRes = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const postRes = await axios.get("http://localhost:5000/api/admin/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersWithStats = userRes.data.map((user) => {
        const userPosts = postRes.data.filter(
          (post) => post.author._id === user._id
        );

        return {
          ...user,
          totalBlogs: userPosts.length,
          totalSubscribers: user.subscribers?.length || 0,
        };
      });

      const sortedUsers = usersWithStats.sort((a, b) => {
        if (a.role === "admin") return 1;
        if (b.role === "admin") return -1;
        return 0;
      });

      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setTotalBlogs(postRes.data.length);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="admin-container">
        <div className="dashboard-header">
          <div className="card summary-card users">
            <h5>Total Users</h5>
            <p>{users.length}</p>
          </div>
          <div className="card summary-card blogs">
            <h5>Total Blogs</h5>
            <p>{totalBlogs}</p>
          </div>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Total Blogs</th>
                <th>Total Subscribers</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <img
                        className="dashboard-avatar"
                        src={
                          user.avatar?.startsWith("avatar")
                            ? `/avatars/${user.avatar}`
                            : `http://localhost:5000/uploads/avatars/${user.avatar}`
                        }
                        onError={(e) => {
                          e.target.src = "/avatars/default.png";
                        }}
                        alt="avatar"
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.totalBlogs}</td>
                    <td>{user.totalSubscribers}</td>
                    <td>
                      {user.role !== "admin" ? (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
