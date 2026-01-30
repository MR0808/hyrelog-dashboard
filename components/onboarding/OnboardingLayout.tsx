import Image from 'next/image';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-subtle">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logoDark.png"
            alt="HyreLog"
            width={160}
            height={48}
            className="dark:block hidden"
          />
          <Image
            src="/images/logoLight.png"
            alt="HyreLog"
            width={160}
            height={48}
            className="dark:hidden block"
          />
        </div>

        {children}
      </div>
    </div>
  );
}
