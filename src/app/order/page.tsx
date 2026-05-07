'use client';

import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { orderAPI, getErrorMessage } from '@/lib/api-client';
import { getToday, formatDateIndian, formatIndianNumber, formatCurrency, printTable } from '@/lib/utils';
import { handleEnterNavigation } from '@/lib/form-nav';

interface Order {
  id: number;
  date: string;
  po_number: string;
  customer_name: string;
  size_mm: string;
  colour: string;
  product_type: string;
  quantity: number;
  rate: number;
  amount: number;
  delivered_quantity: number;
  status: 'PENDING' | 'COMPLETED';
}

export default function OrderPage() {
  const [entries, setEntries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [formData, setFormData] = useState({
    date: getToday(),
    po_number: '',
    customer_name: '',
    size_mm: '3',
    custom_size: '',
    colour: '',
    product_type: '',
    quantity: '',
    rate: '',
  });

  const sizes = ['3', '4', '6', '8', '10', '15', '18', '20', '25', '30', '35', '40', '45', '50', '55', 'Unsize'];
  const COLOURS = ['Black', 'White', 'Other'];
  const PRODUCT_TYPES = ['Rubber Elastic', '840 Lycra', '840 Lycra Finishing', '1120 Lycra Finishing'];

  useEffect(() => {
    fetchOrders(selectedDate);
    return () => {
      setLoading(false);
      setError(null);
      setSuccess(null);
    };
  }, [selectedDate]);

  const fetchOrders = async (date: string) => {
    try {
      setLoading(true);
      const response = await orderAPI.getByDate(date);
      setEntries(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSize = formData.size_mm === 'Unsize' ? formData.custom_size : formData.size_mm;

    if (!formData.po_number || !formData.customer_name || !formData.quantity || !formData.rate || !formData.colour || !formData.product_type || (formData.size_mm === 'Unsize' && !formData.custom_size)) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await orderAPI.create({
        date: formData.date,
        po_number: formData.po_number,
        customer_name: formData.customer_name,
        size_mm: finalSize,
        colour: formData.colour,
        product_type: formData.product_type,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
      });

      if (response.data?.success) {
        setSuccess('Order created successfully');
        setTimeout(() => setSuccess(null), 3000);
        setFormData({
          date: formData.date,
          po_number: '',
          customer_name: '',
          size_mm: '3',
          custom_size: '',
          colour: '',
          product_type: '',
          quantity: '',
          rate: '',
        });
        
        // Add new entry with default delivered_quantity and status
        const newEntry = {
          ...response.data.data,
          delivered_quantity: 0,
          status: 'PENDING'
        };
        
        // If the new entry matches the current filter date, add it to list
        if (formatDateIndian(newEntry.date) === formatDateIndian(selectedDate)) {
          setEntries(prev => [newEntry, ...prev]);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    const previousEntries = entries;
    setEntries(entries.filter(e => e.id !== id));
    setSuccess('Order deleted');
    setTimeout(() => setSuccess(null), 3000);

    try {
      await orderAPI.delete(id);
    } catch (err) {
      setEntries(previousEntries);
      setError(getErrorMessage(err));
      setSuccess(null);
    }
  };

  const handlePrint = () => {
    const printData = entries.map(entry => ({
      date: formatDateIndian(new Date(entry.date)),
      po_number: entry.po_number,
      customer: entry.customer_name,
      size: entry.size_mm,
      ordered: formatIndianNumber(entry.quantity),
      delivered: formatIndianNumber(entry.delivered_quantity),
      remaining: formatIndianNumber(Math.max(0, entry.quantity - entry.delivered_quantity)),
      amount: formatCurrency(entry.amount),
      status: entry.status === 'COMPLETED' ? 'Completed' : 'Pending',
    }));

    printTable(`Order Tracking - ${formatDateIndian(selectedDate)}`, printData, [
      { key: 'date', label: 'Date' },
      { key: 'po_number', label: 'PO Number' },
      { key: 'customer', label: 'Customer' },
      { key: 'size', label: 'Size' },
      { key: 'ordered', label: 'Ordered' },
      { key: 'delivered', label: 'Delivered' },
      { key: 'remaining', label: 'Remaining' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Order" subtitle="Customer orders and tracking" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Showing orders for:</p>
              <p className="text-lg font-bold text-gray-900">{formatDateIndian(new Date(selectedDate))}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">New Order Entry</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            onKeyDown={handleEnterNavigation}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">PO Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="po_number"
                value={formData.po_number}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Customer Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Size <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="size_mm"
                  value={formData.size_mm}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {sizes.map(s => (
                    <option key={s} value={s}>
                      {s === 'Unsize' ? s : `${s} mm`}
                    </option>
                  ))}
                </select>
                {formData.size_mm === 'Unsize' && (
                  <input
                    type="text"
                    name="custom_size"
                    value={formData.custom_size}
                    onChange={handleInputChange}
                    placeholder="Enter Custom Size"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Colour <span className="text-red-500">*</span></label>
              <select
                name="colour"
                value={formData.colour}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                required
              >
                <option value="">Select Colour</option>
                {COLOURS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Type of Product <span className="text-red-500">*</span></label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                required
              >
                <option value="">Select Type</option>
                {PRODUCT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quantity (meters) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Rate <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount</label>
              <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 font-semibold h-10 flex items-center">
                {formData.quantity && formData.rate
                    ? formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.rate))
                    : '₹0.00'
                }
              </div>
            </div>

            <div className="lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Saving...' : 'Add Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <h2 className="text-lg font-bold text-gray-800">Order Tracking</h2>
            {entries.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Print
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No orders for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">PO Number</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Customer</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Size</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">Type / Colour</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Ordered</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Delivered</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Remaining</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-3 py-4 text-gray-600 tabular-nums">{formatDateIndian(entry.date)}</td>
                      <td className="px-3 py-4 text-gray-700 font-medium">{entry.po_number}</td>
                      <td className="px-3 py-4 text-gray-800">{entry.customer_name}</td>
                      <td className="text-center px-3 py-4 text-gray-700 font-medium">{entry.size_mm}</td>
                      <td className="px-3 py-4 text-gray-700 text-xs">
                        {entry.product_type} <br/>
                        <span className="text-gray-500">{entry.colour}</span>
                      </td>
                      <td className="text-center px-3 py-4 tabular-nums font-bold text-gray-800">{formatIndianNumber(entry.quantity)}</td>
                      <td className="text-center px-3 py-4 tabular-nums font-medium text-blue-600">{formatIndianNumber(entry.delivered_quantity)}</td>
                      <td className="text-center px-3 py-4 tabular-nums font-medium text-orange-600">
                        {formatIndianNumber(Math.max(0, entry.quantity - entry.delivered_quantity))}
                      </td>
                      <td className="text-center px-3 py-4 tabular-nums text-gray-800">{formatCurrency(entry.amount)}</td>
                      <td className="text-center px-3 py-4">
                        {entry.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="text-center px-3 py-4">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
