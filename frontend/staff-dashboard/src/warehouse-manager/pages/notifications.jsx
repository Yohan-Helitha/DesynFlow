import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../component/navbar.jsx";
import { useNotifications } from "../context/notificationContext.jsx";
import { Trash2, Bell, BellOff, CheckCircle } from "lucide-react";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const {
    notifications = [],
    refreshNotifications,
    markNotificationAsRead: providerMarkNotificationAsRead,
    markAsRead,
    removeNotification,
    unreadCount = 0
  } = useNotifications();

  const getProductType = (id) => {
    if (!id) return "Unknown";
    if (id.startsWith("MP")) return "Manufactured Product";
    if (id.startsWith("RM")) return "Raw Material";
    if (id.startsWith("TR")) return "Transfer Request";
    if (id.startsWith("SRR")) return "Stock Restocked Notification";
    return "Unknown";
  };

  const getNotifications = async () => {
    try {
      setLoading(true);
      if (refreshNotifications) await refreshNotifications();
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markNotificationAsRead = async (id) => {
    try {
      if (providerMarkNotificationAsRead) await providerMarkNotificationAsRead(id);
    } catch (e) {
      console.error("markNotificationAsRead failed", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (markAsRead) await markAsRead();
    } catch (e) {
      console.error("markAllAsRead failed", e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await removeNotification(id);
      if (refreshNotifications) await refreshNotifications();
    } catch (e) {
      console.error("deleteNotification failed", e);
    }
  };

  const isNotificationRead = (id) => {
    try {
      const stored = localStorage.getItem("readNotifications");
      if (!stored) return false;
      const arr = JSON.parse(stored);
      if (arr.includes(id)) return true;
      const base = id && id.toString().split("_")[0];
      return base && arr.includes(base);
    } catch {
      return false;
    }
  };

  const listItems = useMemo(() => {
    const items = (notifications || [])
      .map((n) => ({
        ...n,
        productType: n.data?.materialId ? getProductType(n.data.materialId) : getProductType(n.relatedId),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items;
  }, [notifications]);

  const unreadItems = listItems.filter(i => !isNotificationRead(i.id));
  const readItems = listItems.filter(i => isNotificationRead(i.id));

  const selectedNotification = useMemo(() => listItems.find(i => i.id === selectedId), [listItems, selectedId]);

  const NotificationRow = ({ notification, onSelect }) => {
    const isRead = isNotificationRead(notification.id);
    return (
      <tr className={`${isRead ? 'bg-gray-50' : ''} hover:bg-gray-50`}>
        <td className="px-4 py-3 text-sm text-left">
          <div className="flex items-center gap-2">
            <div className="text-gray-500">{isRead ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4 text-yellow-600" />}</div>
            <div>
              <div className="font-medium text-gray-900">{notification.title}</div>
              <div className="text-xs text-gray-500">{notification.type}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-left">{notification.data?.materialName || notification.relatedId || '-'}</td>
        <td className="px-4 py-3 text-sm text-left">{notification.data?.inventoryName || '-'}</td>
        <td className="px-4 py-3 text-sm text-left">{new Date(notification.createdAt).toLocaleString()}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            {!isRead && (
              <button onClick={() => markNotificationAsRead(notification.id)} className="text-green-600 hover:text-green-800" title="Mark as read">
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => { onSelect(notification.id); }} className="text-blue-600 hover:text-blue-800" title="View details">Details</button>
            <button onClick={() => deleteNotification(notification.id)} className="text-red-600 hover:text-red-800" title="Delete">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const Table = ({ items }) => {
    if (loading) return <div className="py-8 text-center">Loading...</div>;
    if (!items || items.length === 0) return <div className="py-8 text-center text-gray-500">No notifications</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Notification</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Inventory</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((n) => (
              <NotificationRow key={n.id} notification={n} onSelect={(id) => setSelectedId(id)} />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Warehouse alerts and reorder notifications</p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">{unreadCount} unread</span>
            )}
            <button onClick={() => markAllAsRead()} className="text-sm text-blue-600">Mark all read</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button onClick={() => setActiveTab("alerts")} className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'alerts' ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                Threshold Alerts
              </button>
              <button onClick={() => setActiveTab("reorders")} className={`flex items-center px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'reorders' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                Reorder Requests
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'alerts' && (
              <>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                  <button onClick={() => setActiveSubTab('all')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeSubTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>All</button>
                  <button onClick={() => setActiveSubTab('manufactured')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeSubTab === 'manufactured' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600'}`}>Manufactured</button>
                  <button onClick={() => setActiveSubTab('raw')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeSubTab === 'raw' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}>Raw</button>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Unread ({unreadItems.length})</h3>
                  <Table items={unreadItems} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Read ({readItems.length})</h3>
                  <Table items={readItems} />
                </div>
              </>
            )}

            {activeTab === 'reorders' && (
              <div>
                <Table items={listItems.filter(n => n.type === 'reorder')} />
              </div>
            )}
          </div>
        </div>

        {/* Details panel */}
        {selectedNotification && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{selectedNotification.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isNotificationRead(selectedNotification.id) && (
                  <button onClick={() => markNotificationAsRead(selectedNotification.id)} className="text-green-600" title="Mark as read"><CheckCircle className="w-5 h-5" /></button>
                )}
                <button onClick={() => deleteNotification(selectedNotification.id)} className="text-red-600" title="Delete"><Trash2 className="w-5 h-5" /></button>
                <button onClick={() => setSelectedId(null)} className="text-sm text-gray-600 px-3 py-1">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Message</h3>
                <p className="text-sm text-gray-800 mt-1">{selectedNotification.message || selectedNotification.data?.message || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Details</h3>
                <pre className="text-xs text-gray-600 mt-1 max-h-40 overflow-auto bg-gray-50 p-2 rounded">{JSON.stringify(selectedNotification.data || selectedNotification, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
