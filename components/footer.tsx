"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="relative z-20 mt-14 border-t border-border/50 bg-card/70 text-foreground backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-wide">
              Ethio<span className="text-primary">Green</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Premium Ethiopian green coffee beans sourced directly from farmers
              and cooperatives across Ethiopia.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/product" className="transition-colors hover:text-primary">
                  All Coffee
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Origins
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Quality Grades
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Wholesale
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                Bahir Dar, Ethiopia
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />{" "}
                <Link href="tel:+251961064370">+251 96 106 43 70</Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <Link href="mailto:birhanugezahegn099@gmail.com">
                  birhanugezahegn099@gmail.com
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/beeki.birhanu"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 transition-colors hover:text-primary" />
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/birhanugezahegn099?igsh=YzljYTk1ODg3Zg=="
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 transition-colors hover:text-primary" />
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 transition-colors hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/70" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} EthioGreen Coffee. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
