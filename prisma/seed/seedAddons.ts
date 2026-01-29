import { AddOnBillingType } from '../../generated/prisma/client';

export const HYRELOG_ADDONS = [
  {
    code: 'ADDON_EXTRA_EVENTS',
    name: 'Extra Events (Metered)',
    description: 'Metered overage for events beyond your plan allowance.',
    billingType: AddOnBillingType.METERED,
    isActive: true,
    entitlementDelta: {
      limits: { eventsPerMonth: 1_000_000 }, // interpret as +1,000,000 per “unit”
      features: {}
    }
  },
  {
    code: 'ADDON_RETENTION_EXTENDED',
    name: 'Extended Retention',
    description: 'Adds additional retention days beyond the base plan.',
    billingType: AddOnBillingType.RECURRING,
    isActive: true,
    entitlementDelta: {
      limits: { retentionDays: 180 }, // interpret as +180 days
      features: {}
    }
  },
  {
    code: 'ADDON_EXTRA_SEATS',
    name: 'Extra Seats',
    description: 'Adds additional seats beyond the base plan.',
    billingType: AddOnBillingType.RECURRING,
    isActive: true,
    entitlementDelta: {
      limits: { seats: 5 }, // interpret as +5 seats per unit
      features: {}
    }
  },
  {
    code: 'ADDON_SSO',
    name: 'SSO / SAML',
    description: 'Unlocks SSO / SAML authentication.',
    billingType: AddOnBillingType.RECURRING,
    isActive: true,
    entitlementDelta: {
      limits: {},
      features: { ssoSaml: true }
    }
  },
  {
    code: 'ADDON_ADDITIONAL_REGION',
    name: 'Additional Data Region',
    description: 'Unlocks an additional data residency region for the tenant.',
    billingType: AddOnBillingType.RECURRING,
    isActive: true,
    entitlementDelta: {
      data: { addAllowedRegions: ['US'] } // your merge logic can support this custom verb
    }
  }
] as const;
