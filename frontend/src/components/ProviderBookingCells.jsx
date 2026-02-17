
import React, { useState } from 'react';
import { updateBookingDetailsProvider, updateBookingStatus } from '../api/bookings';

export const ProviderDateCell = ({ booking, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : '');

    const handleSave = async () => {
        const res = await updateBookingDetailsProvider(booking._id, { scheduledDate: date });
        if (res.success) {
            onUpdate(booking._id, { scheduledDate: date });
            setIsEditing(false);
        } else alert(res.error);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-1 w-full">
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="text-xs border rounded p-1" />
                <div className="flex gap-1">
                    <button onClick={handleSave} className="bg-black text-white px-2 py-0.5 rounded text-[10px]">Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-2 py-0.5 rounded text-[10px]">Cancel</button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 group">
            <span>{new Date(booking.scheduledDate).toLocaleDateString()} <span className="text-xs text-gray-500">{booking.scheduledTime}</span></span>
            {['accepted', 'arrived'].includes(booking.status) && (
                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs underline">
                    Edit
                </button>
            )}
        </div>
    );
};

export const ProviderStatusCell = ({ booking, onUpdate, statusConfig }) => {
    const handleChange = async (e) => {
        const newStatus = e.target.value;
        if (!window.confirm(`Change status to ${newStatus.replace(/_/g, ' ')}?`)) return;

        const res = await updateBookingStatus(booking._id, newStatus);
        if (res.success) {
            onUpdate(booking._id, { status: newStatus });
        } else alert(res.error);
    };

    // If terminal state, just show badge
    if (['completed', 'cancelled', 'rejected', 'work_completed'].includes(booking.status)) {
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[booking.status]?.color || 'bg-gray-100'}`}>
                {statusConfig[booking.status]?.label || booking.status}
            </span>
        );
    }

    // Editable dropdown
    return (
        <select
            value={booking.status}
            onChange={handleChange}
            className={`px-3 py-1 rounded-full text-xs font-semibold border-none focus:ring-2 focus:ring-black cursor-pointer ${statusConfig[booking.status]?.color || 'bg-gray-100'}`}
        >
            {Object.entries(statusConfig).map(([key, config]) => {
                // strict logic: can only move forward or cancel
                // Allow current status
                if (key === booking.status) return <option key={key} value={key}>{config.label}</option>;
                // Allow specific transitions
                if (booking.status === 'pending' && ['accepted', 'rejected'].includes(key)) return <option key={key} value={key}>{config.label}</option>;
                if (booking.status === 'accepted' && ['arrived', 'cancelled'].includes(key)) return <option key={key} value={key}>{config.label}</option>;
                if (booking.status === 'arrived' && ['in_progress', 'cancelled'].includes(key)) return <option key={key} value={key}>{config.label}</option>;
                if (booking.status === 'in_progress' && ['work_completed', 'cancelled'].includes(key)) return <option key={key} value={key}>{config.label}</option>;
                return null;
            })}
        </select>
    );
};
