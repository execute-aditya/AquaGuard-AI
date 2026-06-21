import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="bg-background min-h-screen font-body-md text-on-background antialiased flex flex-col">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
