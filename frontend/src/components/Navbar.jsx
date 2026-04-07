import { Globe, Bell } from 'lucide-react';

const Navbar = () => (
  <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
      <Globe size={28} /> DAOU Marketing AI
    </h1>
    <div className="flex items-center gap-4">
      <Bell className="text-slate-400 cursor-pointer" size={20} />
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">D</div>
    </div>
  </nav>
);

export default Navbar;