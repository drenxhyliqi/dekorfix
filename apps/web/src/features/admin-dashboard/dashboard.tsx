import type { DashboardStats } from "@dekorfix/shared";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Inbox,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { productCategories } from "@/config/navigation";
import { adminRoutes } from "@/config/routes";
import { getProduct, products } from "@/content/products";
import sq from "@/i18n/dictionaries/sq";
import { cn } from "@/lib/utils";

import { ActivityChart } from "./activity-chart";
import { PERIODS, type Period } from "./data";
import { ago, delta, greeting, longDate, number } from "./format";
import { Sparkline } from "./sparkline";

const RED = "#e41e25";
const INK = "#1d1d1b";
/** Colours for the message topics, in the order of TOPICS. */
const TOPIC_COLORS = [RED, INK, "#c9a66b", "#8a8f98", "#f3a5a8"];

const TOPICS: Array<{ key: keyof DashboardStats["messages_by_topic"]; label: string }> = [
  { key: "products", label: "Produkte" },
  { key: "project", label: "Projekt" },
  { key: "order", label: "Porosi" },
  { key: "export", label: "Eksport" },
  { key: "other", label: "Tjetër" },
];

const ORDER_STATUS: Record<keyof DashboardStats["orders_by_status"], { label: string; tone: string }> = {
  new: { label: "E re", tone: "db-badge--new" },
  confirmed: { label: "E konfirmuar", tone: "db-badge--confirmed" },
  completed: { label: "E përfunduar", tone: "db-badge--done" },
  cancelled: { label: "E anuluar", tone: "db-badge--cancelled" },
};

const MESSAGE_STATUS: Record<DashboardStats["recent_messages"][number]["status"], { label: string; tone: string }> = {
  new: { label: "I ri", tone: "db-badge--new" },
  answered: { label: "U përgjigj", tone: "db-badge--done" },
  closed: { label: "I mbyllur", tone: "db-badge--cancelled" },
};

const PERIOD_LABEL: Record<Period, string> = { 7: "7 ditë", 30: "30 ditë", 90: "90 ditë" };

/** The admin dashboard: greeting, key figures, activity, what is asked about and ordered, and the latest requests. */
export function Dashboard({ stats, name }: { stats: DashboardStats; name: string | null }) {
  const period = stats.period_days;
  const ordersDelta = delta(stats.orders.total, stats.orders.previous_total);
  const messagesDelta = delta(stats.messages.total, stats.messages.previous_total);
  const waiting = stats.orders.new_count + stats.messages.new_count;
  const categoryCounts = productCategories.map((category) => ({
    key: category.key,
    label: sq.productCategories[category.key].name,
    count: products.filter((product) => product.category === category.key).length,
  }));
  const maxCategory = Math.max(1, ...categoryCounts.map((category) => category.count));

  return (
    <div className="db">
      {/* Greeting and period */}
      <header className="db-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between" style={{ "--i": 0 } as CSSProperties}>
        <div>
          <p className="text-small text-text-tertiary">{longDate(stats.generated_at)}</p>
          <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] font-semibold leading-tight tracking-[-0.035em] text-text">
            {greeting(stats.generated_at)}
            {name ? `, ${name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1.5 text-body text-text-secondary">
            Ja si po ecën Dekorfix në {PERIOD_LABEL[period]} e fundit.
          </p>
        </div>
        <nav aria-label="Periudha" className="db-segment">
          {PERIODS.map((days) => (
            <Link
              key={days}
              href={`${adminRoutes.dashboard}?days=${days}`}
              aria-current={days === period ? "page" : undefined}
              className={cn("db-segment-item", days === period && "db-segment-item--on")}
              scroll={false}
            >
              {PERIOD_LABEL[days]}
            </Link>
          ))}
        </nav>
      </header>

      {/* Key figures */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          index={1}
          icon={ShoppingBag}
          label="Porositë"
          value={stats.orders.total}
          change={ordersDelta}
          footnote={`${number.format(stats.orders.all_time)} gjithsej`}
          spark={<Sparkline id="db-spark-orders" values={trend(stats.orders.series)} color={RED} />}
          href={adminRoutes.orders}
        />
        <Kpi
          index={2}
          icon={Mail}
          label="Mesazhet"
          value={stats.messages.total}
          change={messagesDelta}
          footnote={`${number.format(stats.messages.all_time)} gjithsej`}
          spark={<Sparkline id="db-spark-messages" values={trend(stats.messages.series)} color={INK} />}
          href={adminRoutes.contacts}
        />
        <Kpi
          index={3}
          icon={Bell}
          label="Presin përgjigje"
          value={waiting}
          accent
          footnote={`${number.format(stats.orders.new_count)} porosi · ${number.format(stats.messages.new_count)} mesazhe`}
          spark={
            <div className="db-meter" aria-hidden>
              <span style={{ width: `${(stats.orders.new_count / Math.max(1, waiting)) * 100}%`, background: RED }} />
              <span style={{ width: `${(stats.messages.new_count / Math.max(1, waiting)) * 100}%`, background: INK }} />
            </div>
          }
        />
        <Kpi
          index={4}
          icon={Package}
          label="Produkte në katalog"
          value={products.length}
          footnote={`në ${categoryCounts.length} kategori`}
          href={adminRoutes.products}
          spark={
            <div className="db-minibars" aria-hidden>
              {categoryCounts.map((category) => (
                <span key={category.key} title={`${category.label}: ${category.count}`} style={{ height: `${(category.count / maxCategory) * 100}%` }} />
              ))}
            </div>
          }
        />
      </div>

      {/* Activity and topics */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card index={5} className="xl:col-span-2" title="Aktiviteti" subtitle="Porositë dhe mesazhet me kalimin e kohës">
          <ActivityChart
            emptyLabel="Ende pa aktivitet në këtë periudhë."
            series={[
              { key: "orders", label: "Porositë", color: RED, total: stats.orders.total, values: stats.orders.series },
              { key: "messages", label: "Mesazhet", color: INK, total: stats.messages.total, values: stats.messages.series },
            ]}
          />
        </Card>
        <Card index={6} title="Për çfarë na shkruajnë" subtitle="Mesazhet sipas temës">
          <TopicDonut stats={stats} />
        </Card>
      </div>

      {/* Products and orders */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card index={7} className="xl:col-span-2" title="Produktet më të porositura" subtitle="Sasia e porositur në këtë periudhë" action={<CardLink href={adminRoutes.products}>Katalogu</CardLink>}>
          <TopProducts stats={stats} />
        </Card>
        <Card index={8} title="Porositë" subtitle="Statusi dhe mënyra e marrjes">
          <OrderBreakdown stats={stats} />
        </Card>
      </div>

      {/* Latest requests */}
      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <Card index={9} className="xl:col-span-3" title="Porositë e fundit" action={<CardLink href={adminRoutes.orders}>Të gjitha</CardLink>}>
          <RecentOrders stats={stats} />
        </Card>
        <Card index={10} className="xl:col-span-2" title="Mesazhet e fundit" action={<CardLink href={adminRoutes.contacts}>Të gjitha</CardLink>}>
          <RecentMessages stats={stats} />
        </Card>
      </div>
    </div>
  );
}

/** Daily counts for a sparkline, summed per week for long periods so the line stays calm. */
function trend(series: DashboardStats["orders"]["series"]): number[] {
  const counts = series.map((day) => day.count);
  if (counts.length <= 45) return counts;
  const weeks: number[] = [];
  for (let end = counts.length; end > 0; end -= 7) weeks.unshift(counts.slice(Math.max(0, end - 7), end).reduce((a, b) => a + b, 0));
  return weeks;
}

/* ---- Pieces ---------------------------------------------------------------------- */

function Kpi({
  index,
  icon: Icon,
  label,
  value,
  change,
  footnote,
  spark,
  href,
  accent = false,
}: {
  index: number;
  icon: LucideIcon;
  label: string;
  value: number;
  change?: number | null;
  footnote: string;
  spark: ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-small font-medium text-text-secondary">
          <span aria-hidden className={cn("db-kpi-icon", accent && "db-kpi-icon--accent")}>
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          {label}
        </span>
        {change !== undefined && <Change value={change} />}
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="db-kpi-value">{number.format(value)}</p>
          <p className="mt-1.5 text-caption text-text-tertiary">{footnote}</p>
        </div>
        <div className="db-kpi-visual">{spark}</div>
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="db-card db-kpi db-rise" style={{ "--i": index } as CSSProperties}>
      {body}
    </Link>
  ) : (
    <div className="db-card db-kpi db-rise" style={{ "--i": index } as CSSProperties}>
      {body}
    </div>
  );
}

/** Change against the previous period: green up, red down, grey flat or new. */
function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="db-change db-change--flat">e re</span>;
  const up = value > 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("db-change", value === 0 ? "db-change--flat" : up ? "db-change--up" : "db-change--down")} title="Krahasuar me periudhën e mëparshme">
      {value !== 0 && <Arrow aria-hidden className="size-3.5" strokeWidth={2.25} />}
      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

function Card({
  index,
  title,
  subtitle,
  action,
  className,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("db-card db-rise min-w-0 p-5 md:p-6", className)} style={{ "--i": index } as CSSProperties}>
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-text">{title}</h2>
          {subtitle && <p className="mt-0.5 text-small text-text-tertiary">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group/card inline-flex shrink-0 items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text">
      {children}
      <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover/card:translate-x-0.5" strokeWidth={2} />
    </Link>
  );
}

/** Messages by topic as a ring, the total in the middle. */
function TopicDonut({ stats }: { stats: DashboardStats }) {
  const total = TOPICS.reduce((sum, topic) => sum + stats.messages_by_topic[topic.key], 0);
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" role="img" aria-label={`${total} mesazhe sipas temës`}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-surface-muted)" strokeWidth="16" />
          {total > 0 &&
            TOPICS.map((topic, index) => {
              const share = stats.messages_by_topic[topic.key] / total;
              const dash = Math.max(0, share * C - (share > 0 && share < 1 ? 2 : 0));
              const segment = (
                <circle
                  key={topic.key}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={TOPIC_COLORS[index]}
                  strokeWidth="16"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  className="db-donut-segment"
                  style={{ "--i": index } as CSSProperties}
                />
              );
              offset += share * C;
              return segment;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-text tabular-nums">{number.format(total)}</span>
          <span className="mt-1 text-caption text-text-tertiary">mesazhe</span>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {TOPICS.map((topic, index) => {
          const count = stats.messages_by_topic[topic.key];
          return (
            <li key={topic.key} className="flex items-center gap-3 text-small">
              <span aria-hidden className="db-legend-dot" style={{ background: TOPIC_COLORS[index] }} />
              <span className="flex-1 text-text-secondary">{topic.label}</span>
              <span className="tabular-nums font-medium text-text">{number.format(count)}</span>
              <span className="w-10 text-right tabular-nums text-text-tertiary">{total ? Math.round((count / total) * 100) : 0}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The most-ordered products, with their packshots and a bar for the quantity. */
function TopProducts({ stats }: { stats: DashboardStats }) {
  if (!stats.top_products.length) return <Empty icon={Package} text="Ende pa porosi në këtë periudhë." />;
  const max = Math.max(...stats.top_products.map((product) => product.quantity));
  return (
    <ol className="space-y-3">
      {stats.top_products.map((product, index) => {
        const image = getProduct(product.slug)?.image;
        return (
          <li key={product.slug} className="db-bar-row db-rise" style={{ "--i": 8 + index } as CSSProperties}>
            <span className="w-5 text-caption tabular-nums text-text-tertiary">{index + 1}</span>
            <span className="db-thumb">{image && <Image src={image} alt="" fill sizes="40px" className="object-contain p-1" />}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-small font-medium text-text">{product.name}</span>
                <span className="shrink-0 text-small tabular-nums text-text">
                  <span className="font-semibold">{number.format(product.quantity)}</span>
                  <span className="text-text-tertiary"> copë · {product.orders} porosi</span>
                </span>
              </div>
              <div className="db-bar mt-2">
                <span style={{ width: `${(product.quantity / max) * 100}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Orders by status (one stacked bar) and by delivery method. */
function OrderBreakdown({ stats }: { stats: DashboardStats }) {
  const statuses = Object.entries(ORDER_STATUS) as Array<[keyof typeof ORDER_STATUS, (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]]>;
  const total = statuses.reduce((sum, [key]) => sum + stats.orders_by_status[key], 0);
  const delivery = stats.orders_by_delivery.delivery;
  const pickup = stats.orders_by_delivery.pickup;
  const colors = { new: RED, confirmed: "#f08c3c", completed: "#1f9d55", cancelled: "#b9b6af" };
  if (!total) return <Empty icon={ShoppingBag} text="Ende pa porosi në këtë periudhë." />;
  return (
    <div>
      <div className="db-stack" role="img" aria-label="Porositë sipas statusit">
        {statuses.map(([key]) =>
          stats.orders_by_status[key] ? (
            <span key={key} style={{ width: `${(stats.orders_by_status[key] / total) * 100}%`, background: colors[key] }} />
          ) : null,
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {statuses.map(([key, status]) => (
          <li key={key} className="flex items-center gap-2 text-small">
            <span aria-hidden className="db-legend-dot" style={{ background: colors[key] }} />
            <span className="flex-1 text-text-secondary">{status.label}</span>
            <span className="tabular-nums font-medium text-text">{stats.orders_by_status[key]}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5">
        <Method icon={Truck} label="Dërgesë" value={delivery} share={delivery / Math.max(1, delivery + pickup)} />
        <Method icon={Store} label="Marrje në fabrikë" value={pickup} share={pickup / Math.max(1, delivery + pickup)} />
      </div>
    </div>
  );
}

function Method({ icon: Icon, label, value, share }: { icon: LucideIcon; label: string; value: number; share: number }) {
  return (
    <div className="rounded-md bg-surface-muted p-3.5">
      <Icon aria-hidden className="size-4 text-text-tertiary" strokeWidth={1.75} />
      <p className="mt-3 text-[1.375rem] font-semibold leading-none tracking-[-0.02em] tabular-nums text-text">{number.format(value)}</p>
      <p className="mt-1 text-caption text-text-tertiary">
        {label} · {Math.round(share * 100)}%
      </p>
    </div>
  );
}

function RecentOrders({ stats }: { stats: DashboardStats }) {
  if (!stats.recent_orders.length) return <Empty icon={Inbox} text="Porositë nga shitorja do të shfaqen këtu." />;
  return (
    <div className="-mx-5 overflow-x-auto md:-mx-6">
      <table className="db-table">
        <thead>
          <tr>
            <th>Porosia</th>
            <th>Klienti</th>
            <th className="hidden md:table-cell">Marrja</th>
            <th className="text-right">Sasia</th>
            <th>Statusi</th>
            <th className="text-right">Kur</th>
          </tr>
        </thead>
        <tbody>
          {stats.recent_orders.map((order) => (
            <tr key={order.reference}>
              <td className="font-mono text-caption font-medium tracking-wide text-text">{order.reference}</td>
              <td>
                <span className="block max-w-[11rem] truncate font-medium text-text">{order.customer_name}</span>
              </td>
              <td className="hidden md:table-cell">
                <span className="inline-flex items-center gap-1.5 text-text-secondary">
                  {order.delivery_method === "pickup" ? <Store aria-hidden className="size-3.5" strokeWidth={1.75} /> : <MapPin aria-hidden className="size-3.5" strokeWidth={1.75} />}
                  {order.delivery_method === "pickup" ? "Fabrika" : (order.city ?? "—")}
                </span>
              </td>
              <td className="text-right tabular-nums text-text-secondary">
                {order.quantity} <span className="text-text-tertiary">({order.items})</span>
              </td>
              <td>
                <span className={cn("db-badge", ORDER_STATUS[order.status].tone)}>{ORDER_STATUS[order.status].label}</span>
              </td>
              <td className="whitespace-nowrap text-right text-text-tertiary">{ago(order.created_at, stats.generated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentMessages({ stats }: { stats: DashboardStats }) {
  if (!stats.recent_messages.length) return <Empty icon={Mail} text="Mesazhet nga formulari i kontaktit do të shfaqen këtu." />;
  return (
    <ul className="-my-2 divide-y divide-border">
      {stats.recent_messages.map((message) => {
        const topic = TOPICS.find((entry) => entry.key === message.topic);
        const initials = message.name
          .split(/\s+/)
          .map((part) => part[0] ?? "")
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <li key={message.reference} className="flex gap-3 py-3">
            <span aria-hidden className="db-avatar">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-small font-medium text-text">{message.name}</span>
                <span className="shrink-0 text-caption text-text-tertiary">{ago(message.created_at, stats.generated_at)}</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-small text-text-secondary">{message.message}</p>
              <div className="mt-1.5 flex items-center gap-2">
                {topic && <span className="db-chip">{topic.label}</span>}
                <span className={cn("db-badge", MESSAGE_STATUS[message.status].tone)}>{MESSAGE_STATUS[message.status].label}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span aria-hidden className="db-kpi-icon">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <p className="max-w-xs text-small text-text-tertiary">{text}</p>
    </div>
  );
}

/** Placeholder with the dashboard's shape while the numbers load. */
export function DashboardSkeleton() {
  return (
    <div className="db" aria-busy>
      <div className="db-skeleton h-16 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="db-skeleton h-36" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="db-skeleton h-96 xl:col-span-2" />
        <div className="db-skeleton h-96" />
      </div>
    </div>
  );
}
