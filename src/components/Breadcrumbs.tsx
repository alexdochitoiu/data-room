'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useDocumentViewStore } from '@/stores/documentViewStore';

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const router = useRouter();
  const { breadcrumbs, currentFolderId, setCurrentFolderId, loadBreadcrumbs } =
    useDocumentViewStore();

  // Load breadcrumbs when current folder changes
  useEffect(() => {
    loadBreadcrumbs(currentFolderId);
  }, [currentFolderId, loadBreadcrumbs]);

  const handleBreadcrumbNavigate = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    // Stay on the current page, just update or remove the folder parameter
    const currentPath = window.location.pathname;
    const url = folderId ? `${currentPath}?folder=${folderId}` : currentPath;
    router.push(url);
  };

  // Don't render anything if there are no breadcrumbs (at root level)
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={e => {
                e.preventDefault();
                handleBreadcrumbNavigate(null);
              }}
              className="flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handleBreadcrumbNavigate(item.id);
                    }}
                  >
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
