import { type FunctionComponent } from "react";

export interface NavbarProps {
  className?: string;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Predict", href: "/predict" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

/**
 * Sticky top navigation bar with the DentTime logo, primary nav links,
 * and a \"Try Predictor\" CTA button.
 */
const Navbar: FunctionComponent<NavbarProps> = ({ className = "" }) => {
  return (
    <header
      className={`self-stretch h-[72px] bg-[#fff] border-[#e0edfa] border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-center justify-between !pt-0 !pb-0 !pl-20 !pr-20 gap-5 top-[0] z-[99] sticky text-left text-lg text-[#fff] font-[Inter] mq1050:gap-5 mq1050:!pl-10 mq1050:!pr-10 mq1050:box-border ${className}`}
    >
      {/* Logo */}
      <a
        href="/"
        className="overflow-hidden flex items-center !pt-5 !pb-5 !pl-0 !pr-0 gap-2.5 mq750:hidden no-underline"
        aria-label="DentTime home"
      >
        <div
          className="rounded-lg bg-[#0e7da1] overflow-hidden flex items-center justify-center w-8 h-8"
          aria-hidden="true"
        >
          <b className="relative text-[#fff]">D</b>
        </div>
        <span className="relative text-xl font-bold text-[#0e7da1]">
          DentTime
        </span>
      </a>

      {/* Primary navigation */}
      <nav
        aria-label="Primary navigation"
        className="!m-0 overflow-hidden flex items-center !pt-5 !pb-5 !pl-0 !pr-0 gap-[39.7px] text-left text-[15px] text-[#33455c] font-[Inter] mq450:hidden"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="relative font-medium text-[#33455c] no-underline hover:text-[#0e7da1] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* CTA button */}
      <a
        href="/predict"
        className="rounded-lg bg-[#0e7da1] overflow-hidden flex items-center justify-center !pt-2.5 !pb-2.5 !pl-6 !pr-6 text-base text-[#fff] no-underline hover:bg-[#0b6a8a] transition-colors"
      >
        <span className="relative font-semibold">Try Predictor</span>
      </a>
    </header>
  );
};

export default Navbar;
