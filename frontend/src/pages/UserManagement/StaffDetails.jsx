// Components/UserDetails.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const componentRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // JWT token
        const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user data");
        setLoading(false);
        console.error(err);
      }
    };

    if (id) fetchUserData();
    else setLoading(false);
  }, [id]);

  const handlePrint = () => {
    const printContents = componentRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    document.title = id;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-info">Loading user data...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-fire">{error}</div>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-fire">User not found</div>
        <Link to="/" className="ml-4 text-info hover:underline">
          Go Back
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-navy py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Print button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white text-navy border border-gray-300 rounded-md shadow hover:bg-gray-50 transition text-sm"
          >
            Print / Download PDF
          </button>
        </div>

        <div ref={componentRef} className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
          <h1 className="text-3xl font-bold mb-4">User Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Full Name:</p>
              <p>{user.name || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{user.gmail || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Age:</p>
              <p>{user.age || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Phone:</p>
              <p>{user.phone || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Position:</p>
              <p>{user.position || "N/A"}</p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <p>{user.status || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-semibold">Address:</p>
              <p>{user.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-fire text-white rounded-md"
          >
            Back
          </button>
          <Link
            to={`/update-user/${user._id}`}
            className="px-6 py-2 bg-white text-navy border border-gray-300 hover:bg-gray-50 rounded-md"
          >
            Edit User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
