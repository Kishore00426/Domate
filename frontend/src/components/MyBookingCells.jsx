import React, { useState } from 'react';
import { Calendar, User, Clock, Edit2, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateBookingDetails } from '../api/bookings';

export const NotesCell = ({ booking, onUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(booking.notes || '');

    const handleSave = async () => {
        const res = await updateBookingDetails(booking._id, { notes });
        if (res.success) {
            onUpdate({ ...booking, notes });
            setIsEditing(false);
        } else alert(res.error);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full text-xs border rounded p-1" />
                <button onClick={handleSave} className="text-green-600" title={t('common.save')}><Save className="w-3 h-3" /></button>
                <button onClick={() => setIsEditing(false)} className="text-gray-400" title={t('common.cancel')}><X className="w-3 h-3" /></button>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 group">
            <p className="text-gray-600 text-sm italic truncate max-w-[120px]" title={booking.notes}>{booking.notes || '-'}</p>
            {['pending', 'accepted'].includes(booking.status) && (
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-black" title={t('common.edit')}>
                    <Edit2 className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export const DateCell = ({ booking, onUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [date, setDate] = useState(booking.scheduledDate ? new Date(booking.scheduledDate).toISOString().slice(0, 16) : '');

    const handleSave = async () => {
        const res = await updateBookingDetails(booking._id, { scheduledDate: date });
        if (res.success) {
            onUpdate({ ...booking, scheduledDate: date });
            setIsEditing(false);
        } else alert(res.error);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-1 w-full">
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="text-xs border rounded p-1" />
                <div className="flex gap-1">
                    <button onClick={handleSave} className="bg-black text-white px-2 py-0.5 rounded text-[10px]">{t('common.save')}</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-2 py-0.5 rounded text-[10px]">{t('common.cancel')}</button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 group">
            <div>
                <div className="flex items-center gap-1 text-gray-700 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{booking.scheduledTime}</span>
                </div>
            </div>
            {['pending', 'accepted'].includes(booking.status) && (
                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600" title={t('common.edit')}>
                    <Edit2 className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};
