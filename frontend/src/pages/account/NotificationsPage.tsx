import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCheck,
  CreditCard,
  Megaphone,
  Star,
  Ticket,
  Trash2,
  Undo2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useClearNotificationsMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/features/notifications/notificationsApi';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Seo } from '@/components/common/Seo';
import { useToast } from '@/hooks/useToast';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/api';

const ICONS: Record<NotificationType, typeof Bell> = {
  BOOKING_CONFIRMED: Ticket,
  BOOKING_CANCELLED: XCircle,
  PAYMENT_RECEIVED: CreditCard,
  REFUND_PROCESSED: Undo2,
  TRIP_REMINDER: CalendarClock,
  REVIEW_APPROVED: Star,
  PROMOTION: Megaphone,
  SYSTEM: Bell,
};

const ACCENTS: Record<NotificationType, string> = {
  BOOKING_CONFIRMED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  BOOKING_CANCELLED: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  PAYMENT_RECEIVED: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300',
  REFUND_PROCESSED: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  TRIP_REMINDER: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300',
  REVIEW_APPROVED: 'bg-sand-100 text-sand-500 dark:bg-sand-500/15 dark:text-sand-400',
  PROMOTION: 'bg-gold-500/15 text-gold-700 dark:text-gold-300',
  SYSTEM: 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
};

export default function NotificationsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading } = useNotificationsQuery({ unreadOnly, page, size: 15 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAll, { isLoading: isClearing }] = useClearNotificationsMutation();

  return (
    <>
      <Seo title="Notifications" noIndex />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Notifications</h2>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={unreadOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setUnreadOnly((only) => !only);
              setPage(0);
            }}
          >
            {unreadOnly ? 'Showing unread' : 'Show unread only'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            loading={isMarkingAll}
            onClick={async () => {
              try {
                await markAllRead().unwrap();
                toast.success('All caught up');
              } catch (error) {
                toast.apiError(error);
              }
            }}
            leftIcon={<CheckCheck className="size-4" />}
          >
            Mark all read
          </Button>

          <Button
            variant="ghost"
            size="sm"
            loading={isClearing}
            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            onClick={async () => {
              try {
                await clearAll().unwrap();
                toast.success('Notifications cleared');
              } catch (error) {
                toast.apiError(error);
              }
            }}
            leftIcon={<Trash2 className="size-4" />}
          >
            Clear all
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          description="Booking confirmations, payment receipts and trip reminders will land here."
        />
      ) : (
        <>
          <ul className="space-y-3">
            {data.content.map((notification) => {
              const Icon = ICONS[notification.type] ?? Bell;

              const body = (
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl',
                      ACCENTS[notification.type],
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          'text-sm',
                          notification.read ? 'font-medium' : 'font-bold',
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-rose-600"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-muted mt-1 text-sm">{notification.message}</p>
                    <p className="text-muted mt-1.5 text-xs">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={notification.id}>
                  <Card
                    className={cn(
                      'transition-colors',
                      !notification.read && 'border-brand-300 dark:border-brand-800',
                    )}
                  >
                    <CardBody className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        {notification.link ? (
                          <Link
                            to={notification.link}
                            onClick={() => {
                              if (!notification.read) void markRead(notification.id);
                            }}
                            className="block"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="block w-full text-left"
                            onClick={() => {
                              if (!notification.read) void markRead(notification.id);
                            }}
                          >
                            {body}
                          </button>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete notification"
                        className="text-muted shrink-0 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </>
  );
}
