'use client';

interface Event {
  id: string;
  action: string;
  category: string;
  actorEmail: string | null;
  actorId: string | null;
  createdAt: Date;
  workspace: {
    name: string;
  };
}

export function TimelineViewClient({ events }: { events: Event[] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <div className="flex-1 space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.action}</p>
                  <p className="text-sm text-muted-foreground">{event.category}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Actor:</span>{' '}
                {event.actorEmail || event.actorId || 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Workspace:</span> {event.workspace.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
