'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EventDetailDialogProps {
    event: {
        id: string;
        action: string;
        category: string | null;
        actorId: string | null;
        actorEmail: string | null;
        actorName: string | null;
        targetId: string | null;
        targetType: string | null;
        payload: any;
        metadata: any;
        changes: any;
        hash: string | null;
        traceId: string | null;
        createdAt: Date;
        workspace: {
            name: string;
            slug: string;
        } | null;
        project: {
            name: string;
            slug: string;
        } | null;
    };
    trigger: React.ReactNode;
}

export function EventDetailDialog({ event, trigger }: EventDetailDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Event Details</DialogTitle>
                    <DialogDescription>
                        {new Date(event.createdAt).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Action:
                                </span>
                                <div className="font-medium">
                                    {event.action}
                                </div>
                            </div>
                            {event.category && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Category:
                                    </span>
                                    <div className="font-medium">
                                        {event.category}
                                    </div>
                                </div>
                            )}
                            {event.workspace && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Workspace:
                                    </span>
                                    <div className="font-medium">
                                        {event.workspace.name}
                                    </div>
                                </div>
                            )}
                            {event.project && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Project:
                                    </span>
                                    <div className="font-medium">
                                        {event.project.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Actor Information */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Actor</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {event.actorEmail && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Email:
                                    </span>
                                    <div className="font-medium">
                                        {event.actorEmail}
                                    </div>
                                </div>
                            )}
                            {event.actorName && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>
                                    <div className="font-medium">
                                        {event.actorName}
                                    </div>
                                </div>
                            )}
                            {event.actorId && (
                                <div>
                                    <span className="text-muted-foreground">
                                        ID:
                                    </span>
                                    <div className="font-mono text-xs">
                                        {event.actorId}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {event.targetId && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">
                                    Target
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            ID:
                                        </span>
                                        <div className="font-mono text-xs">
                                            {event.targetId}
                                        </div>
                                    </div>
                                    {event.targetType && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Type:
                                            </span>
                                            <div className="font-medium">
                                                {event.targetType}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Payload */}
                    {event.payload && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">
                                    Payload
                                </h3>
                                <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
                                    {JSON.stringify(event.payload, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}

                    {/* Metadata */}
                    {event.metadata && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">
                                    Metadata
                                </h3>
                                <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
                                    {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}

                    {/* Changes */}
                    {event.changes && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">
                                    Changes
                                </h3>
                                <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto">
                                    {JSON.stringify(event.changes, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}

                    {/* Technical Details */}
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            Technical Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {event.hash && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Hash:
                                    </span>
                                    <div className="font-mono text-xs break-all">
                                        {event.hash}
                                    </div>
                                </div>
                            )}
                            {event.traceId && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Trace ID:
                                    </span>
                                    <div className="font-mono text-xs">
                                        {event.traceId}
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground">
                                    Event ID:
                                </span>
                                <div className="font-mono text-xs">
                                    {event.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
