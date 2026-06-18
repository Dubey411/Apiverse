export interface BillingIntervalPrice {
  monthly: number;
  yearly: number;
}

export type BillingCycle = 'monthly' | 'yearly';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  yearlyDiscountLabel: string;
  includedUsage: string;
  support: string;
  price: BillingIntervalPrice;
}

export function normalizeBillingCategory(category: string) {
  if (category === 'AI / ML') {
    return 'AI';
  }

  return category;
}

export function getApiBillingPlans(category: string): BillingPlan[] {
  const normalizedCategory = normalizeBillingCategory(category);

  if (normalizedCategory === 'Government' || normalizedCategory === 'Identity') {
    return [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For single-team onboarding and low-volume verification.',
        yearlyDiscountLabel: 'Save 18%',
        includedUsage: '25,000 checks / month',
        support: 'Email support',
        price: { monthly: 49, yearly: 482 },
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For business verification, KYC, and compliance operations.',
        yearlyDiscountLabel: 'Save 20%',
        includedUsage: '150,000 checks / month',
        support: 'Priority support',
        price: { monthly: 149, yearly: 1430 },
      },
      {
        id: 'scale',
        name: 'Scale',
        description: 'For regulated teams with audit and reporting needs.',
        yearlyDiscountLabel: 'Custom annual contract',
        includedUsage: 'Custom volume',
        support: 'Dedicated onboarding',
        price: { monthly: 399, yearly: 4309 },
      },
    ];
  }

  if (normalizedCategory === 'Payments' || normalizedCategory === 'Fintech') {
    return [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For test mode, pilots, and low-traffic checkout flows.',
        yearlyDiscountLabel: 'Save 15%',
        includedUsage: '50,000 transactions / month',
        support: 'Email support',
        price: { monthly: 79, yearly: 806 },
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For production payment lanes and merchant operations.',
        yearlyDiscountLabel: 'Save 20%',
        includedUsage: '300,000 transactions / month',
        support: 'Priority operations support',
        price: { monthly: 229, yearly: 2198 },
      },
      {
        id: 'scale',
        name: 'Scale',
        description: 'For settlement-heavy teams and contract pricing.',
        yearlyDiscountLabel: 'Custom annual contract',
        includedUsage: 'Custom volume',
        support: 'Dedicated success manager',
        price: { monthly: 599, yearly: 6469 },
      },
    ];
  }

  if (normalizedCategory === 'AI') {
    return [
      {
        id: 'starter',
        name: 'Starter',
        description: 'For prototypes, copilots, and early product testing.',
        yearlyDiscountLabel: 'Save 18%',
        includedUsage: '2M tokens / month',
        support: 'Email support',
        price: { monthly: 59, yearly: 581 },
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'For production AI features and team workspaces.',
        yearlyDiscountLabel: 'Save 20%',
        includedUsage: '12M tokens / month',
        support: 'Priority support',
        price: { monthly: 179, yearly: 1718 },
      },
      {
        id: 'scale',
        name: 'Scale',
        description: 'For heavy inference, multilingual ops, and custom throughput.',
        yearlyDiscountLabel: 'Custom annual contract',
        includedUsage: 'Custom throughput',
        support: 'Dedicated solutions engineer',
        price: { monthly: 449, yearly: 4849 },
      },
    ];
  }

  return [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For sandbox evaluation and first production launch.',
      yearlyDiscountLabel: 'Save 15%',
      includedUsage: '10,000 requests / month',
      support: 'Email support',
      price: { monthly: 39, yearly: 398 },
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For growing products with consistent traffic.',
      yearlyDiscountLabel: 'Save 20%',
      includedUsage: '100,000 requests / month',
      support: 'Priority support',
      price: { monthly: 119, yearly: 1142 },
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'For advanced teams that need higher limits and support.',
      yearlyDiscountLabel: 'Custom annual contract',
      includedUsage: 'Custom volume',
      support: 'Dedicated onboarding',
      price: { monthly: 299, yearly: 3229 },
    },
  ];
}

export function getPlanPrice(plan: BillingPlan, cycle: BillingCycle) {
  return plan.price[cycle];
}

export const workspacePlans = [
  {
    name: 'Field',
    note: 'For exploration and early integration work.',
    monthly: 0,
    yearly: 0,
    points: ['10,000 calls per month', 'Sandbox keys', 'Reference docs and examples'],
  },
  {
    name: 'Studio',
    note: 'For shipping customer-facing workflows with more control.',
    monthly: 79,
    yearly: 758,
    points: ['500,000 calls per month', 'Team workspace access', 'Quota alerts and usage reports'],
    featured: true,
  },
  {
    name: 'Signal',
    note: 'For high-volume or regulated teams that need support depth.',
    monthly: 249,
    yearly: 2390,
    points: ['Custom rate limits', 'Review-friendly audit posture', 'Dedicated onboarding and migration help'],
  },
];
