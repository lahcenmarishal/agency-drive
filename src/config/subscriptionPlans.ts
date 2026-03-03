// Stripe product and price IDs for each plan
// Monthly and yearly pricing for Basic, Pro, Enterprise

export interface PlanConfig {
  name: string;
  productId: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxVehicles: number;
  maxUsers: number;
  maxAgencies: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  basic: {
    name: "Basic",
    productId: "prod_U56EfSGZpZHXTR",
    monthlyPriceId: "price_1T6w2AQqkdOaxcZv6Cx6oQPL",
    yearlyPriceId: "price_1T6w3oQqkdOaxcZvWRHt51F2",
    monthlyPrice: 29,
    yearlyPrice: 290,
    maxVehicles: 10,
    maxUsers: 3,
    maxAgencies: 1,
    features: [
      "Up to 10 vehicles",
      "Up to 3 users",
      "1 agency",
      "Basic reporting",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    productId: "prod_U56Ff0HFvg7ZY4",
    monthlyPriceId: "price_1T6w2eQqkdOaxcZvlvoA0tqZ",
    yearlyPriceId: "price_1T6w4KQqkdOaxcZvkQbaBpTG",
    monthlyPrice: 59,
    yearlyPrice: 590,
    maxVehicles: 50,
    maxUsers: 10,
    maxAgencies: 3,
    features: [
      "Up to 50 vehicles",
      "Up to 10 users",
      "Up to 3 agencies",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
  },
  enterprise: {
    name: "Enterprise",
    productId: "prod_U56FUtvxzuCJwd",
    monthlyPriceId: "price_1T6w39QqkdOaxcZvhYflgH79",
    yearlyPriceId: "price_1T6w4aQqkdOaxcZvFjWSyTAG",
    monthlyPrice: 99,
    yearlyPrice: 990,
    maxVehicles: -1, // unlimited
    maxUsers: -1,
    maxAgencies: -1,
    features: [
      "Unlimited vehicles",
      "Unlimited users",
      "Unlimited agencies",
      "Full analytics suite",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
};

export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find(
    (p) => p.monthlyPriceId === priceId || p.yearlyPriceId === priceId
  );
}

export function getPlanByProductId(productId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.productId === productId);
}

export function getPlanKey(plan: PlanConfig): string {
  return Object.entries(PLANS).find(([, v]) => v.productId === plan.productId)?.[0] || "basic";
}
