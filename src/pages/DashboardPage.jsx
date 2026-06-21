import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const filtered = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.issue_type?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtType = (t) => t ? t.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : '';

  const statusBadge = (s) => {
    const map = {
      Pending: 'bg-error-container text-error',
      'In Progress': 'bg-secondary-fixed text-secondary',
      Resolved: 'bg-[#dcfce7] text-[#166534]',
    };
    const cls = map[s] || 'bg-surface-container text-on-surface-variant';
    return <span className={`inline-flex items-center justify-center px-2 py-1 rounded ${cls} font-label-sm text-label-sm uppercase tracking-wide`}>{s}</span>;
  };

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <Layout>
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-x py-stack-lg flex flex-col gap-stack-lg">
        <section className="bg-surface-container-low rounded-xl custom-shadow p-stack-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-fixed to-surface-bright opacity-30 z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="font-headline-xl text-headline-xl text-primary mb-stack-sm">Welcome back, {name}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Track your water complaints and stay safe.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-stack-md flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack-sm">Total Complaints</p>
              <p className="font-headline-lg text-headline-lg text-primary">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-stack-md flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack-sm">Pending</p>
              <p className="font-headline-lg text-headline-lg text-primary">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-stack-md flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack-sm">Resolved</p>
              <p className="font-headline-lg text-headline-lg text-primary">{resolvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl custom-shadow flex flex-col overflow-hidden">
          <div className="p-stack-md border-b border-surface-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-md">
            <h2 className="font-headline-md text-headline-md text-primary">Recent Complaints</h2>
            <div className="flex gap-stack-sm w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-2 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline-variant input-glow focus:outline-none transition-all duration-200" placeholder="Search..." type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>
              <select className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg py-2 px-4 font-label-md text-label-md text-on-surface input-glow focus:outline-none transition-all duration-200 cursor-pointer appearance-none pr-8" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="p-stack-md whitespace-nowrap">Issue Type</th>
                  <th className="p-stack-md whitespace-nowrap">Location</th>
                  <th className="p-stack-md whitespace-nowrap">Date</th>
                  <th className="p-stack-md whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
                {loading ? (
                  <tr><td colSpan="4" className="p-stack-lg text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-secondary mr-2">progress_activity</span>Loading...
                  </td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan="4" className="p-stack-lg text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2 py-8">
                      <span className="material-symbols-outlined text-[48px] text-outline-variant">inbox</span>
                      <p className="font-label-md text-label-md">No complaints found</p>
                    </div>
                  </td></tr>
                ) : paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container transition-colors duration-150 cursor-pointer">
                    <td className="p-stack-md font-medium text-primary">{fmtType(c.issue_type)}</td>
                    <td className="p-stack-md text-on-surface-variant">{c.location}</td>
                    <td className="p-stack-md text-on-surface-variant">{fmtDate(c.created_at)}</td>
                    <td className="p-stack-md text-right">{statusBadge(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-stack-md border-t border-surface-variant flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
            <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-50" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
