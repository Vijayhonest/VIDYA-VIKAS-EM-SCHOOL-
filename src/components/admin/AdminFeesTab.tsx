import { useState, useEffect } from 'react';
import {
  IndianRupee,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  X,
  CreditCard,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { FeeRecord, FeePayment, Student } from '../../types';
import {
  fetchAdminFees,
  createFeeRecord,
  generateClassFees,
  payFeeRecord,
  deleteFeeRecord,
  fetchAdminStudents,
} from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminFeesTabProps {
  onDataChange?: () => void;
}

const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
];

export function AdminFeesTab({ onDataChange }: AdminFeesTabProps) {
  const { showToast } = useToast();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClassGenModalOpen, setIsClassGenModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeFee, setActiveFee] = useState<FeeRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<{ fee: FeeRecord; payment: FeePayment } | null>(null);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [totalFeeInput, setTotalFeeInput] = useState('18000');
  const [discountInput, setDiscountInput] = useState('0');
  const [dueDateInput, setDueDateInput] = useState(new Date().toISOString().split('T')[0]);

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [payRef, setPayRef] = useState('');
  const [payRemarks, setPayRemarks] = useState('');

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [feeList, stuList] = await Promise.all([
        fetchAdminFees(selectedClass, selectedStatus, searchQuery),
        fetchAdminStudents(),
      ]);
      setFees(feeList);
      setStudents(stuList);
    } catch (err) {
      console.error('Failed to load fees:', err);
      showToast('Could not load fee records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Summaries
  const totalBilled = fees.reduce((sum, f) => sum + f.netFee, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + f.dueAmount, 0);
  const paidCount = fees.filter((f) => f.status === 'paid').length;
  const pendingCount = fees.filter((f) => f.status === 'pending' || f.status === 'overdue').length;

  // Actions
  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student.', 'error');
      return;
    }

    const res = await createFeeRecord({
      studentId: selectedStudentId,
      totalFee: Number(totalFeeInput),
      discount: Number(discountInput),
      dueDate: dueDateInput,
    });

    if (res) {
      showToast('Fee record created successfully.', 'success');
      setIsAddModalOpen(false);
      loadData();
      onDataChange?.();
    } else {
      showToast('Failed to create fee record.', 'error');
    }
  };

  const handleGenerateClassFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClass === 'all') {
      showToast('Please choose a specific class.', 'error');
      return;
    }

    const res = await generateClassFees({
      class: selectedClass,
      totalFee: Number(totalFeeInput),
      dueDate: dueDateInput,
    });

    if (res.success) {
      showToast(`Generated ${res.generatedCount} fee records for ${selectedClass}.`, 'success');
      setIsClassGenModalOpen(false);
      loadData();
      onDataChange?.();
    } else {
      showToast(res.error || 'Failed to generate class fees.', 'error');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFee) return;

    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    if (amount > activeFee.dueAmount) {
      showToast(`Amount exceeds remaining due of ₹${activeFee.dueAmount}.`, 'error');
      return;
    }

    const res = await payFeeRecord(activeFee.id, {
      amount,
      paymentMode: payMode,
      referenceNo: payRef,
      remarks: payRemarks,
    });

    if (res.success && res.fee && res.payment) {
      showToast(`Payment of ₹${amount} recorded. Receipt #${res.payment.receiptNo}`, 'success');
      setIsPayModalOpen(false);
      loadData();
      onDataChange?.();

      // Offer to show receipt
      setActivePayment({ fee: res.fee, payment: res.payment });
      setIsReceiptModalOpen(true);
    } else {
      showToast(res.error || 'Failed to record payment.', 'error');
    }
  };

  const handleDeleteFee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the fee record for ${name}?`)) return;
    const ok = await deleteFeeRecord(id);
    if (ok) {
      showToast('Fee record removed.', 'success');
      loadData();
      onDataChange?.();
    } else {
      showToast('Failed to delete fee record.', 'error');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-serif text-blue-950 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-amber-500" />
            <span>Student Fee & Billing Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track class-wise fee dues, record installments, issue official payment receipts, and monitor financial clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTotalFeeInput('18000');
              setIsClassGenModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition"
          >
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Generate for Class</span>
          </button>
          <button
            onClick={() => {
              setTotalFeeInput('18000');
              setDiscountInput('0');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-900/10 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Student Fee</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Total Billed</div>
          <div className="text-lg font-bold text-slate-900 mt-1">₹{totalBilled.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{fees.length} Total Records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/20 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">Total Collected</div>
          <div className="text-lg font-bold text-emerald-800 mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}% clearance` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-gradient-to-b from-white to-rose-50/20 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-rose-700">Total Due / Balance</div>
          <div className="text-lg font-bold text-rose-800 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">Awaiting collection</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Fully Paid</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">{paidCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Students cleared</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Pending / Partial</div>
          <div className="text-lg font-bold text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Action needed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, Student ID, or Admission No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden text-xs"
            >
              <option value="all">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading fee accounts...
          </div>
        ) : fees.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <IndianRupee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No fee records found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Create an individual student fee record or generate dues for a class above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class & Sec</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{fee.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {fee.studentId} • {fee.admissionNo}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{fee.class}</span>
                      <span className="text-slate-400 ml-1 font-mono">({fee.section})</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{fee.netFee.toLocaleString('en-IN')}
                      {fee.discount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          (₹{fee.discount} discount)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      ₹{fee.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-700">
                      ₹{fee.dueAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          fee.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fee.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : fee.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{fee.dueDate || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {fee.dueAmount > 0 ? (
                          <button
                            onClick={() => {
                              setActiveFee(fee);
                              setPayAmount(String(fee.dueAmount));
                              setPayRef('');
                              setPayRemarks('');
                              setIsPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-2xs transition"
                          >
                            Collect ₹
                          </button>
                        ) : null}

                        {fee.payments && fee.payments.length > 0 && (
                          <button
                            onClick={() => {
                              const last = fee.payments[fee.payments.length - 1];
                              setActivePayment({ fee, payment: last });
                              setIsReceiptModalOpen(true);
                            }}
                            title="Print / View Receipt"
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteFee(fee.id, fee.studentName)}
                          title="Delete fee record"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <X className="w-4 h-4" />
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

      {/* MODAL: Record Payment */}
      {isPayModalOpen && activeFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Fee Payment</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  {activeFee.studentName} ({activeFee.class} - {activeFee.section})
                </p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Remaining Balance:</span>
                <span className="font-bold text-blue-950 text-sm">₹{activeFee.dueAmount.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={activeFee.dueAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Cash">Cash Counter</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction / Ref Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., UPI Ref or Cheque No."
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g., Term 1 installment paid in full"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Generate for Class */}
      {isClassGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Batch Generate Class Fee Records</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Applies fee structure to all enrolled active students in the selected class
                </p>
              </div>
              <button onClick={() => setIsClassGenModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateClassFees} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all" disabled>Select Class</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={totalFeeInput}
                  onChange={(e) => setTotalFeeInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassGenModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Generate Class Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Single Student Fee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Add Individual Student Fee</h3>
                <p className="text-xs text-blue-200 mt-0.5">Vidya Vikas EM School • Kotauratla</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFee} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.class}-{s.section}) - ID: {s.studentId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalFeeInput}
                    onChange={(e) => setTotalFeeInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount/Concession (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  Create Fee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Printable Official Fee Receipt */}
      {isReceiptModalOpen && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
            {/* Action Bar (hidden on print) */}
            <div className="bg-slate-900 text-white p-3 px-5 flex items-center justify-between print:hidden">
              <div className="text-xs font-medium text-slate-300">Official Fee Receipt Preview</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={printReceipt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-blue-950 font-bold text-xs hover:bg-amber-300 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Sheet */}
            <div className="p-8 bg-white text-slate-900 print:p-0" id="official-fee-receipt">
              <div className="text-center border-b-2 border-blue-950 pb-4 mb-5">
                <h1 className="text-xl font-bold font-serif text-blue-950 tracking-tight">
                  VIDYA VIKAS EM SCHOOL
                </h1>
                <p className="text-[11px] font-medium text-slate-600">
                  Recognized Co-Educational English Medium School
                </p>
                <p className="text-[11px] text-slate-500">
                  Kotauratla, Anakapalle District, Andhra Pradesh - 531085
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Helpline: +91-9441971531 | Academic Year: 2026–2027
                </p>
              </div>

              <div className="flex items-center justify-between text-xs mb-4 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-400">Receipt No: </span>
                  <span className="font-mono font-bold text-blue-950">{activePayment.payment.receiptNo}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="font-semibold">{activePayment.payment.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Student Name</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activePayment.fee.studentName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">ID: {activePayment.fee.studentId}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Class & Section</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activePayment.fee.class} - {activePayment.fee.section}</div>
                  <div className="text-slate-500 font-mono text-[11px]">Adm No: {activePayment.fee.admissionNo}</div>
                </div>
              </div>

              <table className="w-full text-xs mb-5">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5">
                      School Tuition & Development Fee
                      <div className="text-[10px] text-slate-400">
                        Paid via: {activePayment.payment.paymentMode} {activePayment.payment.referenceNo ? `(Ref: ${activePayment.payment.referenceNo})` : ''}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹{activePayment.payment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-bold">
                    <td className="py-2 text-left text-slate-800">Total Amount Received</td>
                    <td className="py-2 text-right text-emerald-800 text-sm">
                      ₹{activePayment.payment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="text-slate-500 text-[11px]">
                    <td className="py-1 text-left">Remaining Balance Due:</td>
                    <td className="py-1 text-right font-bold text-rose-700">
                      ₹{activePayment.fee.dueAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-8 flex items-end justify-between text-xs">
                <div className="text-[10px] text-slate-400">
                  * System generated computer receipt.<br />
                  Issued by: {activePayment.payment.collectedBy}
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <div className="font-semibold text-[11px] text-slate-700">Authorized Signature</div>
                  <div className="text-[10px] text-slate-400">Vidya Vikas EM School</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
