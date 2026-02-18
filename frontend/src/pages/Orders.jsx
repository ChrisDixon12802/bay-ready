import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle,
  Package,
  Calendar,
  Truck,
  Search,
  X,
  Filter,
  ChevronDown,
  Trash2,
  Clock,
  Building2,
  Zap,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import ConfirmModal from "@/components/ConfirmModal";

export default function Orders() {
  const {
    orders,
    addOrder: contextAddOrder,
    toggleOrder: contextToggleOrder,
    deleteOrder,
    canDeleteContent,
    verifyDeleteApproval,
  } = useAppContext();

  const canDelete = canDeleteContent();

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFrequency, setFilterFrequency] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [groupByVendor, setGroupByVendor] = useState(false);
  const [orderPendingDelete, setOrderPendingDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [newOrder, setNewOrder] = useState({
    item: "",
    vendor: "",
    frequency: "Weekly",
    dueDate: "",
    emergency: false,
  });

  const handleAddOrder = () => {
    if (newOrder.item.trim() && newOrder.vendor.trim()) {
      contextAddOrder(newOrder);
      setNewOrder({
        item: "",
        vendor: "",
        frequency: "Weekly",
        dueDate: "",
        emergency: false,
      });
      setShowNewOrder(false);
    }
  };

  // Get unique vendors
  const vendors = [...new Set(orders.map((o) => o.vendor))].sort();

  // Filter orders
  const filterOrders = (orderList) => {
    return orderList.filter((order) => {
      const matchesSearch =
        order.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFrequency =
        filterFrequency === "all" || order.frequency === filterFrequency;
      const matchesVendor =
        filterVendor === "all" || order.vendor === filterVendor;
      return matchesSearch && matchesFrequency && matchesVendor;
    });
  };

  const pendingOrders = filterOrders(orders.filter((o) => !o.completed));
  const completedOrders = filterOrders(orders.filter((o) => o.completed));

  // Sort: emergency first, then by due date
  const sortedPendingOrders = [...pendingOrders].sort((a, b) => {
    if (a.emergency !== b.emergency) return b.emergency ? 1 : -1;
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  // Group orders by vendor if enabled
  const groupedOrders = {};
  if (groupByVendor) {
    sortedPendingOrders.forEach((order) => {
      if (!groupedOrders[order.vendor]) {
        groupedOrders[order.vendor] = [];
      }
      groupedOrders[order.vendor].push(order);
    });
  }

  const emergencyCount = pendingOrders.filter((o) => o.emergency).length;
  const activeFiltersCount =
    (filterFrequency !== "all" ? 1 : 0) + (filterVendor !== "all" ? 1 : 0);

  const frequencyConfig = {
    "One-time": { color: "bg-gray-100 text-gray-700", icon: "⚪" },
    Weekly: { color: "bg-blue-100 text-blue-700", icon: "🔵" },
    Monthly: { color: "bg-purple-100 text-purple-700", icon: "🟣" },
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Package size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Supply Orders</h2>
                <p className="text-sm opacity-90">Track inventory & orders</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-2">
              <p className="text-4xl font-bold">{pendingOrders.length}</p>
            </div>
            <p className="text-xs opacity-90">Pending</p>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white border-opacity-30">
          <div>
            <p className="text-2xl font-bold">{emergencyCount}</p>
            <p className="text-xs opacity-75">Emergency</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{completedOrders.length}</p>
            <p className="text-xs opacity-75">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{vendors.length}</p>
            <p className="text-xs opacity-75">Vendors</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filter & View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
              showFilters
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-200 hover:border-primary"
            }`}
          >
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <ChevronDown
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
              size={20}
            />
          </button>

          <button
            onClick={() => setGroupByVendor(!groupByVendor)}
            className={`px-4 py-3 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
              groupByVendor
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-purple-600"
            }`}
          >
            <Building2 size={20} />
            <span className="hidden sm:inline">Group</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="card space-y-3 border-2 border-primary">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Frequency
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterFrequency("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterFrequency === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterFrequency("One-time")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterFrequency === "One-time"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ⚪ One-time
                </button>
                <button
                  onClick={() => setFilterFrequency("Weekly")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterFrequency === "Weekly"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  🔵 Weekly
                </button>
                <button
                  onClick={() => setFilterFrequency("Monthly")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterFrequency === "Monthly"
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  🟣 Monthly
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Vendor
              </label>
              <select
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="all">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterFrequency("all");
                  setFilterVendor("all");
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Order Button */}
      <button
        onClick={() => setShowNewOrder(!showNewOrder)}
        className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        <Plus size={24} />
        <span className="font-semibold">Add New Order</span>
      </button>

      {/* New Order Form */}
      {showNewOrder && (
        <div className="card space-y-4 border-2 border-primary shadow-xl bg-gradient-to-br from-white to-orange-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-dark">Create New Order</h3>
            <button
              onClick={() => setShowNewOrder(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Item to Order *
            </label>
            <input
              type="text"
              placeholder="e.g., 5W-30 Motor Oil, Air Filters..."
              value={newOrder.item}
              onChange={(e) =>
                setNewOrder({ ...newOrder, item: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
              <Building2 size={16} />
              Vendor Name *
            </label>
            <input
              type="text"
              placeholder="e.g., NAPA Auto Parts, O'Reilly..."
              value={newOrder.vendor}
              onChange={(e) =>
                setNewOrder({ ...newOrder, vendor: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                <Clock size={16} />
                Order Frequency
              </label>
              <select
                value={newOrder.frequency}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, frequency: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="One-time">⚪ One-time Order</option>
                <option value="Weekly">🔵 Weekly Reorder</option>
                <option value="Monthly">🟣 Monthly Reorder</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-2">
                <Calendar size={16} />
                Due Date
              </label>
              <input
                type="date"
                value={newOrder.dueDate}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, dueDate: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-all">
            <input
              type="checkbox"
              checked={newOrder.emergency}
              onChange={(e) =>
                setNewOrder({ ...newOrder, emergency: e.target.checked })
              }
              className="w-5 h-5"
            />
            <div className="flex items-center gap-2 flex-1">
              <AlertTriangle size={20} className="text-danger" />
              <div>
                <span className="font-semibold text-danger block">
                  Emergency Order
                </span>
                <span className="text-xs text-red-700">
                  Needs immediate attention
                </span>
              </div>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddOrder}
              disabled={!newOrder.item.trim() || !newOrder.vendor.trim()}
              className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              ✓ Create Order
            </button>
            <button
              onClick={() => {
                setShowNewOrder(false);
                setNewOrder({
                  item: "",
                  vendor: "",
                  frequency: "Weekly",
                  dueDate: "",
                  emergency: false,
                });
              }}
              className="flex-1 bg-gray-200 text-dark py-3 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pending Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark text-xl flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold">
              {pendingOrders.length}
            </div>
            Pending Orders
          </h3>
          {pendingOrders.length > 0 && (
            <span className="text-sm text-gray-500">
              ~{pendingOrders.length * 5} min to process
            </span>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div className="card text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-gray-300">
            <CheckCircle2 className="text-success mx-auto mb-3" size={48} />
            <p className="text-xl font-semibold text-dark mb-1">
              All Orders Placed! ✓
            </p>
            <p className="text-gray-600">No pending orders at the moment.</p>
          </div>
        ) : groupByVendor ? (
          // Grouped View
          <div className="space-y-4">
            {Object.entries(groupedOrders).map(([vendor, vendorOrders]) => (
              <div key={vendor} className="card border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Building2 className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{vendor}</h4>
                      <p className="text-xs text-gray-500">
                        {vendorOrders.length} items
                      </p>
                    </div>
                  </div>
                  {vendorOrders.some((o) => o.emergency) && (
                    <AlertCircle className="text-danger" size={24} />
                  )}
                </div>

                <div className="space-y-2">
                  {vendorOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-3 rounded-lg border transition-all group hover:shadow-md ${
                        order.emergency
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => contextToggleOrder(order.id)}
                          className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                        >
                          <div className="w-7 h-7 border-2 border-gray-300 rounded-full hover:border-success hover:bg-green-50 transition-all flex items-center justify-center">
                            <Circle className="text-gray-300" size={20} />
                          </div>
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-dark">
                            {order.item}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${frequencyConfig[order.frequency].color}`}
                            >
                              {frequencyConfig[order.frequency].icon}{" "}
                              {order.frequency}
                            </span>
                            {order.dueDate && (
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(order.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {order.emergency && (
                              <span className="text-xs bg-danger text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                <AlertTriangle size={12} />
                                URGENT
                              </span>
                            )}
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderPendingDelete({
                                id: order.id,
                                name: order.item,
                              });
                            }}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {sortedPendingOrders.map((order) => (
              <div
                key={order.id}
                className={`card border-l-4 transition-all group hover:shadow-lg ${
                  order.emergency
                    ? "border-danger bg-red-50"
                    : "border-orange-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => contextToggleOrder(order.id)}
                    className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                  >
                    <div className="w-7 h-7 border-2 border-gray-300 rounded-full hover:border-success hover:bg-green-50 transition-all flex items-center justify-center">
                      <Circle className="text-gray-300" size={20} />
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-dark text-lg">
                          {order.item}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 size={14} className="text-gray-500" />
                          <p className="text-sm text-gray-600 font-medium">
                            {order.vendor}
                          </p>
                        </div>
                      </div>
                      {order.emergency && (
                        <div className="bg-danger text-white p-2 rounded-lg">
                          <AlertCircle size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${frequencyConfig[order.frequency].color}`}
                      >
                        {frequencyConfig[order.frequency].icon}{" "}
                        {order.frequency}
                      </span>
                      {order.dueDate && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          Due {new Date(order.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        ⏱️ ~5 min
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderPendingDelete({
                          id: order.id,
                          name: order.item,
                        });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-600 text-xl flex items-center gap-2">
              <div className="w-10 h-10 bg-success text-white rounded-lg flex items-center justify-center">
                ✓
              </div>
              Completed ({completedOrders.length})
            </h3>
            <span className="text-sm text-success font-semibold">
              +{completedOrders.length * 5} min saved
            </span>
          </div>

          <div className="space-y-2">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="card bg-gray-50 border border-gray-200 opacity-75 hover:opacity-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => contextToggleOrder(order.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                  >
                    <CheckCircle2 className="text-success" size={28} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-500 line-through">
                      {order.item}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 size={12} className="text-gray-400" />
                      <p className="text-sm text-gray-400">{order.vendor}</p>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderPendingDelete({
                          id: order.id,
                          name: order.item,
                        });
                      }}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={orderPendingDelete !== null}
        title="Delete Order"
        message={`Are you sure you want to delete "${orderPendingDelete?.name || "this order"}"? This action cannot be undone.`}
        confirmText="Delete Order"
        requirePassword
        passwordValue={deletePassword}
        onPasswordChange={(value) => {
          setDeletePassword(value);
          if (deleteError) {
            setDeleteError("");
          }
        }}
        passwordError={deleteError}
        onCancel={() => {
          setOrderPendingDelete(null);
          setDeletePassword("");
          setDeleteError("");
        }}
        onConfirm={() => {
          if (!verifyDeleteApproval(deletePassword)) {
            setDeleteError("Manager/Creator password is incorrect.");
            return;
          }

          if (orderPendingDelete !== null) {
            deleteOrder(orderPendingDelete.id);
          }
          setOrderPendingDelete(null);
          setDeletePassword("");
          setDeleteError("");
        }}
      />
    </div>
  );
}
