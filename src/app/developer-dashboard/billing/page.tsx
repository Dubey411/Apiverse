import { CreditCard, Receipt, Wallet } from 'lucide-react';
import {
  DashboardActionLink,
  DashboardMetricCard,
  DashboardPageFrame,
  DashboardPanel,
} from '@/app/developer-dashboard/DashboardSectionComponents';

const invoices = [
  { name: 'APIverse workspace plan', due: 'Apr 19', amount: '$79', status: 'Upcoming' },
  { name: 'Additional teammate seats', due: 'Apr 19', amount: '$24', status: 'Scheduled' },
  { name: 'Usage insight export add-on', due: 'May 02', amount: '$12', status: 'Scheduled' },
];

export default function DeveloperDashboardBillingPage() {
  return (
    <DashboardPageFrame
      eyebrow="Commercial controls"
      title="Billing should feel like a workspace surface too."
      description="Billing now focuses on APIverse workspace costs only. Third-party provider pricing can still inform decisions, but it should not look like APIverse is selling those APIs directly."
      actions={<DashboardActionLink href="/pricing" label="Review plan pricing" />}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard label="Workspace plan" value="Scale" note="The main APIverse plan for this team." />
        <DashboardMetricCard label="Seats" value="4 operators" note="All current teammates are covered in the workspace." />
        <DashboardMetricCard label="This cycle" value="$115" note="APIverse-only charges before tax." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel
          eyebrow="Billing board"
          title="Workspace charges"
          description="This screen tracks APIverse plan charges and team-level add-ons. Provider-side spend can be reviewed elsewhere as informational context, not as an APIverse invoice."
        >
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.name} className="rounded-[24px] border border-stone-300/70 bg-white/68 p-5 dark:border-white/8 dark:bg-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{invoice.name}</p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Due {invoice.due}</p>
                  </div>
                  <span className="rounded-full bg-[#fff0df] px-3 py-1 text-[11px] font-semibold text-[#b8573f] dark:bg-[#2a1815] dark:text-[#efb28f]">
                    {invoice.status}
                  </span>
                </div>
                <p className="mt-4 font-display text-3xl text-stone-950 dark:text-stone-50">{invoice.amount}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          eyebrow="Recommendations"
          title="Where billing stays clean"
          description="Keep APIverse billing separate from provider evaluation so the product model stays honest."
        >
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <Wallet size={18} className="text-[#2b8a7d]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Use this page for APIverse costs only.</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">Workspace charges, teammate seats, and APIverse add-ons belong here because they are actually billed by your product.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <CreditCard size={18} className="text-[#d85f43]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Keep provider pricing informational.</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">OpenAI, Stripe, Sarvam, and government provider costs should guide compare decisions, but they should not appear here as if APIverse sells them directly.</p>
            </div>
            <div className="rounded-[24px] border border-stone-300/70 bg-[#fffaf3] p-5 dark:border-white/8 dark:bg-black/10">
              <Receipt size={18} className="text-[#d68d2e]" />
              <p className="mt-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Keep provider reminders lightweight.</p>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">A small note about a provider pricing or access change is enough. The workspace should never turn into a fake reseller billing console.</p>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </DashboardPageFrame>
  );
}
