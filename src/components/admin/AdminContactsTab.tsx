import { useState } from 'react';
import { Search, Mail, Trash2, Eye, Phone, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { ContactEnquiry, ContactStatus } from '../../types';
import { formatDate } from '../../utils/helpers';
import { updateContactStatus, deleteContactEnquiry } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminContactsTabProps {
  contacts: ContactEnquiry[];
  onDataChange: () => void;
}

export function AdminContactsTab({ contacts, onDataChange }: AdminContactsTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactEnquiry | null>(null);
  const [replyNotes, setReplyNotes] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = contacts.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matches =
      item.name.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      item.message.toLowerCase().includes(q);

    if (!matches) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const handleOpenDetail = (con: ContactEnquiry) => {
    setSelectedContact(con);
    setReplyNotes(con.replyNotes || '');
    if (con.status === 'unread') {
      updateContactStatus(con.id, 'read');
      onDataChange();
    }
  };

  const handleStatusChange = (id: string, status: ContactStatus) => {
    updateContactStatus(id, status);
    onDataChange();
    if (selectedContact && selectedContact.id === id) {
      setSelectedContact({ ...selectedContact, status });
    }
    showToast(`Message marked as "${status}".`, 'success');
  };

  const handleSaveReplyNotes = () => {
    if (!selectedContact) return;
    updateContactStatus(selectedContact.id, selectedContact.status, replyNotes);
    onDataChange();
    setSelectedContact({ ...selectedContact, replyNotes });
    showToast('Reply notes saved.', 'success');
  };

  const handleDelete = (id: string) => {
    deleteContactEnquiry(id);
    if (selectedContact?.id === id) setSelectedContact(null);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Message deleted.', 'info');
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case 'unread':
        return 'bg-rose-100 text-rose-900 border-rose-200 font-bold';
      case 'read':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Messages & Enquiries</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            General queries, parent messages, and feedback submitted via the Contact page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sender, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
          >
            <option value="all">All ({contacts.length})</option>
            <option value="unread">Unread ({contacts.filter((c) => c.status === 'unread').length})</option>
            <option value="read">Read ({contacts.filter((c) => c.status === 'read').length})</option>
            <option value="resolved">Resolved ({contacts.filter((c) => c.status === 'resolved').length})</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Messages Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No messages match your search criteria. Inquiries submitted via the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((con) => (
                  <tr key={con.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 block">{con.name}</span>
                        {con.isDemo && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                            Sample
                          </span>
                        )}
                      </div>
                      <a href={`tel:${con.phone}`} className="text-blue-900 text-[11px] font-semibold hover:underline">
                        {con.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[140px] truncate">
                      {con.subject || 'General Enquiry'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">
                      {con.message}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(con.submittedAt || con.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={con.status}
                        onChange={(e) => handleStatusChange(con.id, e.target.value as ContactStatus)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${getStatusBadge(con.status)}`}
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(con)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-950 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(con.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedContact(null)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Message Details
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {selectedContact.subject || 'School Enquiry'}
                </h3>
              </div>
              <button onClick={() => setSelectedContact(null)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Sender</span>
                  <p className="font-bold text-slate-900">{selectedContact.name}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Date</span>
                  <p className="font-bold text-slate-900">
                    {formatDate(selectedContact.submittedAt || selectedContact.createdAt)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Phone</span>
                  <a href={`tel:${selectedContact.phone}`} className="font-bold text-blue-900 hover:underline block">
                    {selectedContact.phone}
                  </a>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
                  <p className="font-semibold text-slate-800 truncate">
                    {selectedContact.email || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Message Content</span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Staff Reply / Action Notes
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedContact.id, 'resolved')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-bold hover:bg-emerald-200"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={replyNotes}
                  onChange={(e) => setReplyNotes(e.target.value)}
                  placeholder="Record what action or reply was given to this parent..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
                <button
                  type="button"
                  onClick={handleSaveReplyNotes}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition-colors"
                >
                  Save Action Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Message</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this contact message?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
