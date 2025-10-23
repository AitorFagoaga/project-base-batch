"use client";

interface SharedPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function SharedPageLayout({ children, title, description }: SharedPageLayoutProps) {
  return (
    <div className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
      <section className="mb-10 rounded-3xl bg-white px-8 py-12 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.45)] ring-1 ring-gray-100">
        <h2 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-4xl text-lg text-gray-500">
          {description}
        </p>
      </section>
      <main className="space-y-12">{children}</main>
    </div>
  );
}
