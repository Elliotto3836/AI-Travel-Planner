export default function Navbar({ theme }) {
  return (
    <nav
      className={`flex justify-between items-center max-w-6xl mx-auto py-2 px-6`}
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="text-2xl font-bold" style={{ color: theme.accent }}>
        Trip by Elliot Zheng
      </div>

      {/* Links */}
      <div className="space-x-6 font-medium">
        <a
          href="#about"
          className="transition-colors duration-200"
          style={{ color: theme.text }}
          onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = theme.accent)}
          onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = theme.text)}
        >
          About
        </a>
        {/* <a
          href="#demo"
          className="transition-colors duration-200"
          style={{ color: theme.text }}
          onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = theme.accent)}
          onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = theme.text)}
        >
          Demo
        </a> */}
        <a
          href="https://github.com/Elliotto3836"
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-200"
          style={{ color: theme.text }}
          onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = theme.accent)}
          onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = theme.text)}
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}
