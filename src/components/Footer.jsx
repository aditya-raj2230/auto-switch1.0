import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-start text-center md:text-left">
        <div className="flex-1 mb-4 md:mb-0">
          <h3 className="text-lg md:text-xl font-bold">Auto Switch</h3>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            © 2024 Auto Connect. All rights reserved.
          </p>
        </div>
        <div className="flex flex-row justify-center gap-20">
          <div className="flex-1 mb-4 md:mb-0">
            <h4 className="font-semibold text-md md:text-lg mb-2">Company</h4>
            <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:underline">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex-1 mb-4 md:mb-0">
            <h4 className="font-semibold text-md md:text-lg mb-2">Support</h4>
            <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:underline">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex-1 mb-4 md:mb-0">
            <h4 className="font-semibold text-md md:text-lg mb-2">Legal</h4>
            <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
