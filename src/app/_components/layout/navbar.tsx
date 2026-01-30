import ThemeSwitch from "./theme-switch"
import LanguageToggle from "../providers/language-toggle"
import { useExtracted } from "next-intl";
import Slyv from "../../../../public/slyv";
import Link from "next/link";
import { AuthButton } from "../auth/auth-button";

export default function Navbar() {
    const t = useExtracted('navbar');
    return (
        <div className="flex w-full h-20 p-5 items-center justify-around text-sm">
            <div className="flex gap-5 items-center">
                <Link href={'/'} className="px-5">
                    <Slyv className="size-15"/>
                </Link>
                <Link className="hover:underline hover:text-accent-color" href={'/'}>{t('./Home')}</Link>
                <Link className="hover:underline hover:text-accent-color" href={'/style'}>{t('./Link1')}</Link>
                <Link className="hover:underline hover:text-accent-color" href={'/create'}>{t('./Link2')}</Link>
                <Link className="hover:underline hover:text-accent-color" href={'/about'}>{t('./Link3')}</Link>
            </div>

            <div className="flex gap-5 items-center">
                <ThemeSwitch />
                <LanguageToggle />
                <AuthButton />
            </div>
        </div>
    )
}