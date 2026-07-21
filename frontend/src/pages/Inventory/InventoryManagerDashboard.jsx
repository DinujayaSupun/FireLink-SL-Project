import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInventoryDashboardStats } from '../../api/inventoryDashboardApi';


/**
 * Inventory activity — ONE chart, two series.
 *
 * Replaces four separate single-series charts (plus a 28-tile day grid and an
 * 8-tile weekly block) that all showed the same week of data. Added and removed
 * belong on a shared axis: the comparison between them is the actual insight.
 * Navy = added, fire = removed, with the latest point emphasised.
 */
const ActivityChart = ({ added = [], removed = [], height = 240 }) => {
  const days = Math.max(added.length, removed.length);
  if (!days) {
    return <div className="py-10 text-center text-sm text-gray-400">No activity recorded yet</div>;
  }

  const W = 720;
  const P = { top: 16, right: 16, bottom: 34, left: 36 };
  const innerW = W - P.left - P.right;
  const innerH = height - P.top - P.bottom;

  const at = (arr, i) => arr[i]?.count || 0;
  const max = Math.max(4, ...added.map((d) => d?.count || 0), ...removed.map((d) => d?.count || 0));
  const stepX = days > 1 ? innerW / (days - 1) : 0;
  const x = (i) => P.left + i * stepX;
  const y = (v) => P.top + innerH - (v / max) * innerH;

  const line = (arr) =>
    Array.from({ length: days }, (_, i) => `${i ? "L" : "M"} ${x(i)} ${y(at(arr, i))}`).join(" ");
  const area = (arr) => `${line(arr)} L ${x(days - 1)} ${P.top + innerH} L ${x(0)} ${P.top + innerH} Z`;

  const ticks = [0, 1, 2, 3, 4].map((t) => ({
    v: Math.round((max * t) / 4),
    y: P.top + innerH - (t / 4) * innerH,
  }));
  const label = (i) => String(added[i]?.date || removed[i]?.date || "").slice(5);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }}
         role="img" aria-label="Inventory items added versus removed over the last 7 days">
      {ticks.map((t) => (
        <g key={t.y}>
          <line x1={P.left} y1={t.y} x2={W - P.right} y2={t.y} stroke="var(--color-gray-200)" strokeWidth="1" />
          <text x={P.left - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--color-gray-400)">{t.v}</text>
        </g>
      ))}
      <path d={area(added)} fill="var(--color-navy)" opacity="0.07" />
      <path d={area(removed)} fill="var(--color-fire)" opacity="0.06" />
      <path d={line(added)} fill="none" stroke="var(--color-navy)" strokeWidth="2" />
      <path d={line(removed)} fill="none" stroke="var(--color-fire)" strokeWidth="2" />
      <circle cx={x(days - 1)} cy={y(at(added, days - 1))} r="3.5" fill="var(--color-navy)" />
      <circle cx={x(days - 1)} cy={y(at(removed, days - 1))} r="3.5" fill="var(--color-fire)" />
      {Array.from({ length: days }, (_, i) => (
        <text key={i} x={x(i)} y={height - 12} textAnchor="middle" fontSize="10" fill="var(--color-gray-400)">
          {label(i)}
        </text>
      ))}
    </svg>
  );
};

const InventoryManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getInventoryDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard data');
        // Still set safe default data to prevent UI crashes
        setStats(response.data);
      }
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Unable to load dashboard data');
      // Set minimal safe data
      setStats({
        inventory: { totalItems: 0, lowStockCount: 0, expiredCount: 0, expiringSoonCount: 0 },
        vehicles: { totalVehicles: 0, availableVehicles: 0, inUseVehicles: 0, maintenanceVehicles: 0 },
        reorders: {},
        assignments: { totalAssignments: 0, totalAssignedQuantity: 0, vehiclesWithAssignments: 0 },
        recentLogs: [],
        trends: { itemsAddedLast7Days: [] },
        categories: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 30 seconds to catch new activity
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-info border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-fire-50 border border-fire-200 rounded-lg p-6">
            <div className="text-fire-dark text-center">
              <h3 className="text-lg font-medium mb-2">Dashboard Error</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-fire text-white px-4 py-2 rounded hover:bg-fire-dark"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const inventory = stats?.inventory || {};
  const vehicles = stats?.vehicles || {};
  const reorders = stats?.reorders || {};
  const assignments = stats?.assignments || {};
  const recentLogs = Array.isArray(stats?.recentLogs) ? stats.recentLogs : [];
  // Use backend data directly since it now generates correct dates
  const generateCorrect7DayData = (backendData) => {
    console.log('Frontend received backend data:', backendData);
    
    // If backend data exists and has the right structure, use it directly
    if (Array.isArray(backendData) && backendData.length > 0) {
      return backendData.map(item => ({
        date: item.date,
        count: item.count || 0,
        quantity: item.quantity || 0,
        dayName: item.dayName || new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
      }));
    }
    
    // Fallback: generate empty 7-day data if backend data is missing
    const result = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      result.push({
        date: dateStr,
        count: 0,
        quantity: 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return result;
  };

  const rawTrends = stats?.trends || {};
  
  // Get today's date properly in local timezone
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Debug logging
  console.log('Backend trend data:', rawTrends);
  console.log('Today is:', todayStr);
  console.log('Browser timezone offset:', now.getTimezoneOffset());
  
  const trends = {
    ...rawTrends,
    itemsAddedLast7Days: generateCorrect7DayData(rawTrends.itemsAddedLast7Days || []),
    itemsRemovedLast7Days: generateCorrect7DayData(rawTrends.itemsRemovedLast7Days || [])
  };
  
  // Debug the corrected data
  console.log('Corrected trends with dates:', trends.itemsAddedLast7Days?.map(d => `${d.date} (${d.dayName})`));
  const categories = Array.isArray(stats?.categories) ? stats.categories : [];

  const kpis = [
    { 
      label: 'Total Item Types', 
      value: inventory.totalItems || 0, 
      color: 'bg-white border border-gray-200 text-navy hover:bg-gray-50', 
      link: '/inventory',
      description: 'View all inventory items'
    },
    { 
      label: 'Low Stock', 
      value: inventory.lowStockCount || 0, 
      color: 'bg-amber-50 text-amber-dark hover:bg-amber-100', 
      link: '/inventory?condition=Low Stock',
      description: 'Items needing restock'
    },
    { 
      label: 'Expired', 
      value: inventory.expiredCount || 0, 
      color: 'bg-fire-50 text-fire-dark hover:bg-fire-100', 
      link: '/inventory?condition=Expired',
      description: 'Expired items requiring attention'
    },
    { 
      label: 'Expiring Soon', 
      value: inventory.expiringSoonCount || 0, 
      color: 'bg-amber-50 text-amber-dark hover:bg-amber-100', 
      link: '/inventory?search=expiring',
      description: 'Items expiring within 120 days'
    },
    { 
      label: 'Total Vehicles', 
      value: vehicles.totalVehicles || 0, 
      color: 'bg-white border border-gray-200 text-navy hover:bg-gray-50', 
      link: '/inventory/vehicles',
      description: 'View all vehicles'
    },
    { 
      label: 'Available Vehicles', 
      value: vehicles.availableVehicles || 0, 
      color: 'bg-white border border-gray-200 text-navy hover:bg-gray-50', 
      link: '/inventory/vehicles?status=Available',
      description: 'Vehicles ready for use'
    },
    { 
      label: 'Assignments', 
      value: assignments.totalAssignments || 0, 
      color: 'bg-white border border-gray-200 text-navy hover:bg-gray-50', 
      link: '/inventory/vehicle-items',
      description: 'View vehicle assignments'
    },
    { 
      label: 'Assigned Qty', 
      value: assignments.totalAssignedQuantity || 0, 
      color: 'bg-white border border-gray-200 text-navy hover:bg-gray-50', 
      link: '/inventory/vehicle-items',
      description: 'Total assigned quantities'
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Manager Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of inventory, vehicles, and operations.</p>
        </div>

        {/* KPI Grid - Clickable Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Link 
              key={index} 
              to={kpi.link}
              className={`rounded-lg border p-4 shadow-sm transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-md ${kpi.color}`}
              title={kpi.description}
            > 
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{kpi.label}</div>
                  <div className="mt-2 text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs opacity-75 mt-1">{kpi.description}</div>
                </div>
                <div className="ml-2 opacity-60">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Trend Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-5">
              {/* Totals live in the summary row under the chart — no need to repeat them here. */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Inventory Activity</h2>
                <p className="text-sm text-gray-500">Items added and removed over the last 7 days</p>
              </div>
            
            {/* One chart: added and removed share an axis — the comparison is the insight. */}
            <div className="mt-2">
              <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-navy" />Items added</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-fire" />Items removed</span>
              </div>
              <ActivityChart
                added={trends.itemsAddedLast7Days || []}
                removed={trends.itemsRemovedLast7Days || []}
              />
            </div>

            {/* Compact summary — replaces the 28-tile day grid and 8-tile weekly block. */}
            {(() => {
              const A = trends.itemsAddedLast7Days || [];
              const R = trends.itemsRemovedLast7Days || [];
              const sum = (arr, k) => arr.reduce((s, d) => s + (d?.[k] || 0), 0);
              const addedItems = sum(A, 'count');
              const removedItems = sum(R, 'count');
              const netItems = addedItems - removedItems;
              const netUnits = sum(A, 'quantity') - sum(R, 'quantity');
              const signed = (n) => `${n >= 0 ? '+' : ''}${n.toLocaleString()}`;
              const tone = (n) => (n > 0 ? 'text-success-dark' : n < 0 ? 'text-fire' : 'text-navy');
              const tiles = [
                ['Items added', String(addedItems), 'text-navy'],
                ['Items removed', String(removedItems), 'text-navy'],
                ['Net items', signed(netItems), tone(netItems)],
                ['Net units', signed(netUnits), tone(netUnits)],
              ];
              return (
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-200 pt-4 lg:grid-cols-4">
                  {tiles.map(([label, value, colour]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`text-xl font-bold tabular-nums ${colour}`}>{value}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h2>
            {categories.length > 0 ? (
              <div className="text-sm max-h-96 overflow-y-auto">
                {/* Column Headers */}
                <div className="flex justify-between mb-3 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase sticky top-0 bg-white">
                  <span>Category</span>
                  <span>ITEM types / Quantity</span>
                </div>
                {/* Data Rows */}
                <ul className="space-y-2">
                  {categories.map((cat, index) => (
                    <li key={index} className="flex justify-between py-1 hover:bg-gray-50 px-2 -mx-2 rounded">
                      <span className="font-medium text-gray-700">{cat.category || 'Uncategorized'}</span>
                      <span className="text-gray-600">{cat.items || 0} / {cat.quantity || 0}</span>
                    </li>
                  ))}
                </ul>
                {categories.length > 15 && (
                  <div className="mt-4 text-center text-xs text-gray-500 border-t pt-2">
                    Showing all {categories.length} categories
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No category data available</div>
            )}
          </div>
        </div>

        {/* Status Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Reorders */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Reorders by Status</h2>
            <ul className="space-y-2 text-sm">
              {Object.keys(reorders).length > 0 ? (
                Object.entries(reorders).map(([status, count]) => (
                  <li key={status} className="flex justify-between capitalize">
                    <span>{status.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{count || 0}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No reorder data</li>
              )}
            </ul>
          </div>

          {/* Assignments Summary */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Assignments</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Records</span>
                <span className="font-semibold">{assignments.totalAssignments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Quantity</span>
                <span className="font-semibold">{assignments.totalAssignedQuantity || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicles With Items</span>
                <span className="font-semibold">{assignments.vehiclesWithAssignments || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link to="/inventory" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Inventory
              </Link>
              <Link to="/inventory/vehicle-items" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Vehicle Items
              </Link>
              <Link to="/inventory/vehicles" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Vehicles
              </Link>
              <Link to="/inventory/reorders" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Reorders
              </Link>
              <Link to="/inventory/logs" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Logs
              </Link>
              <Link to="/dashboard" className="px-3 py-2 rounded bg-white text-navy border border-gray-300 text-center hover:bg-gray-50 transition-colors">
                Main
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Inventory Activity</h2>
            <Link to="/inventory/logs" className="text-sm text-info hover:underline">
              View All Logs
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 uppercase text-xs border-b">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.slice(0, 5).map((log) => (
                    <tr key={log._id || Math.random()} className="border-b last:border-none">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-2 pr-4 font-medium">{log.action || 'N/A'}</td>
                      <td className="py-2 pr-4">{log.itemName || 'N/A'}</td>
                      <td className="py-2 pr-4 text-gray-600 max-w-xs truncate" title={log.description}>
                        {log.description || 'No description'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-500 text-center">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerDashboard;