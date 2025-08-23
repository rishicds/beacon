
import { Button } from "@/components/ui/button";
import GuardianMailLogo from "@/components/icons/logo";
import Link from "next/link";
import Image from "next/image";

export default function HeroPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <GuardianMailLogo className="h-6 w-6" />
          <span className="ml-2 text-lg font-semibold">GuardianMail</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure, Trackable Communication for Your Entire Organization
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    GuardianMail provides unparalleled security for your sensitive documents and communications with PIN-protected links and real-time access monitoring.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">
                      Protect Your Data
                    </Link>
                  </Button>
                </div>
              </div>
               <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="data security illustration"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
