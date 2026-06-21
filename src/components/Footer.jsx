export default function Footer() {
  return (
    <footer className="bg-surface dark:bg-background w-full border-t border-outline-variant/20 mt-auto">
      <div className="w-full px-margin-x py-stack-lg flex flex-col items-center gap-stack-md max-w-container-max mx-auto">
        <div className="font-headline-md text-headline-md text-primary font-bold">
          AquaGuard AI
        </div>
        <div className="flex gap-4">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-all duration-300" href="#">SDG 6 Info</a>
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant text-sm mt-4 text-center">
          © 2024 AquaGuard AI. Ensuring Clean Water for All.
        </div>
      </div>
    </footer>
  );
}
