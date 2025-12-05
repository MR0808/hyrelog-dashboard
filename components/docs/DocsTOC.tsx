'use client';

import { useEffect, useState } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface DocsTOCProps {
    content: string;
}

export function DocsTOC({ content }: DocsTOCProps) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Extract headings from markdown content
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches: Heading[] = [];
        const idCounts = new Map<string, number>();
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            let baseId = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            // Handle duplicate IDs by appending a counter
            const count = idCounts.get(baseId) || 0;
            idCounts.set(baseId, count + 1);
            const id = count > 0 ? `${baseId}-${count}` : baseId;

            matches.push({ id, text, level });
        }

        setHeadings(matches);
    }, [content]);

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0% -35% 0%',
                threshold: 0
            }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            headings.forEach((heading) => {
                const element = document.getElementById(heading.id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                Table of Contents
            </h3>
            <nav className="space-y-1">
                {headings.map((heading, index) => (
                    <button
                        key={`${heading.id}-${index}`}
                        onClick={() => handleClick(heading.id)}
                        className={`cursor-pointer block w-full text-left text-sm transition-colors ${
                            heading.level === 1
                                ? 'pl-0 font-medium'
                                : heading.level === 2
                                  ? 'pl-4'
                                  : 'pl-8 text-xs'
                        } ${
                            activeId === heading.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        {heading.text}
                    </button>
                ))}
            </nav>
        </div>
    );
}
