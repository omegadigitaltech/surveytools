import useDashboardStore from "../../store/useDashboardStore";

const MobileNavBar = () => {
  const { menuOpen, setMenuOpen } = useDashboardStore();

  return (
    <header className="mobile-topbar md:hidden fixed top-0 left-0 right-0 h-10 bg-white z-40 flex items-center justify-between px-4">

      {/* Logo */}
      <img
        src="/Blue-logo-1.svg"
        alt="Logo"
        className="h-8"
      />

      {/* Menu Button */}
      <button
        className={`header-w1-menu ${menuOpen ? "menu-open" : ""}`}
        onClick={() => setMenuOpen(true)}
      >
        <div className="header-w1-line" />
        <div className="header-w1-line" />
        <div className="header-w1-line" />
        {/* <div class="header-w1-line" aria-hidden="true"></div>
        <div class="header-w1-line" aria-hidden="true"></div>
        <div class="header-w1-line" aria-hidden="true"></div> */}
      </button>

    </header>
  );
};

export default MobileNavBar;