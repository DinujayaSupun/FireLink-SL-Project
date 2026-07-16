import React, { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const QRCodeGenerator = ({ sessionId }) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/sessions/generate/${sessionId}`)
      .then((res) => setToken(res.data.token))
      .catch((err) => console.error(err));
  }, [sessionId]);

  if (!token) return <p>Loading QR...</p>;

  // Encode the scan URL, not the bare token: a phone camera can open a link but
  // can do nothing with a raw token string. This lands on the attendance page
  // served by GET /sessions/attendance/scan/:token.
  const scanUrl = `${API_BASE_URL}/sessions/attendance/scan/${encodeURIComponent(token)}`;

  return (
    <div className="flex flex-col items-center">
      <QRCode value={scanUrl} size={200} />
      <p className="mt-2 text-gray-700 text-sm">
        Scan to mark attendance (valid 5 minutes)
      </p>
    </div>
  );
};

export default QRCodeGenerator;
