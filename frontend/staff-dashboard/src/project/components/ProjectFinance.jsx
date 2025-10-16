import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

export default function ProjectFinance() {
  const [activeTab, setActiveTab] = useState("estimate");
  const [estimations, setEstimations] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch estimations and quotations
        const [estRes, quoRes] = await Promise.all([
          fetch("http://localhost:4000/api/finance/estimations"),
          fetch("http://localhost:4000/api/finance/quotations")
        ]);

        if (estRes.ok) {
          const estData = await estRes.json();
          setEstimations(Array.isArray(estData) ? estData : []);
        } else {
          setEstimations([]);
        }

        if (quoRes.ok) {
          const quoData = await quoRes.json();
          setQuotations(Array.isArray(quoData) ? quoData : []);
        } else {
          setQuotations([]);
        }
      } catch (err) {
        console.error('Error fetching finance data', err);
        setEstimations([]);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Finance Management</h2>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "estimate" ? "bg-brown-primary text-white" : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("estimate")}
        >
          Estimated Budgets
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "quotation" ? "bg-brown-primary text-white" : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("quotation")}
        >
          Quotations
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {loading ? (
          <div className="text-brown-primary p-4">Loading...</div>
        ) : (
          <>
            {activeTab === "estimate" && (
              <div>
                <h3 className="text-lg font-semibold text-brown-primary mb-4">Estimated Budgets</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brown-primary text-white">
                      <th className="p-3">Project</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimations.length > 0 ? (
                      estimations.map((est, i) => (
                        <tr key={est._id || i} className="border-b">
                          <td className="p-3">{est.projectName || est.projectId?.projectName || est.projectId}</td>
                          <td className="p-3">{est.version}</td>
                          <td className="p-3">{est.total?.toLocaleString?.() ?? est.total}</td>
                          <td className="p-3">{est.status}</td>
                          <td className="p-3">
                            {est.lastQuotationId ? (
                              <a href={`http://localhost:4000/api/finance/quotations/${est.lastQuotationId}`} className="text-green-primary hover:underline">View Quotation</a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500">No estimations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "quotation" && (
              <div>
                <h3 className="text-lg font-semibold text-brown-primary mb-4">Quotations</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brown-primary text-white">
                      <th className="p-3">Project</th>
                      <th className="p-3">Estimate #</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Grand Total</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.length > 0 ? (
                      quotations.map((quo, i) => (
                        <tr key={quo._id || i} className="border-b">
                          <td className="p-3">{quo.projectName || quo.projectId?.projectName || quo.projectId}</td>
                          <td className="p-3">{quo.estimateVersion}</td>
                          <td className="p-3">{quo.version}</td>
                          <td className="p-3">{quo.status}</td>
                          <td className="p-3">{quo.grandTotal?.toLocaleString?.() ?? quo.grandTotal}</td>
                          <td className="p-3">
                            {quo.fileUrl ? (
                              <a href={`http://localhost:4000${quo.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-green-primary hover:underline">
                                <FaDownload size={16} /> <span>Download</span>
                              </a>
                            ) : (
                              <span className="text-gray-400">Not available</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">No quotations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
