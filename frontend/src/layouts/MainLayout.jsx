import Navbar from '../components/common/Navbar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
