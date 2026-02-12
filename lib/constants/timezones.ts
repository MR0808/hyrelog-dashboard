/**
 * Full IANA timezone list grouped by region.
 * Uses Intl.supportedValuesOf('timeZone') when available, with static fallback.
 * Zones include display label with code and GMT offset.
 */

export type TimezoneZone = {
  value: string;
  label: string;
  /** e.g. "EST", "GMT" */
  code: string;
  /** e.g. "GMT-5", "GMT+5:30" */
  offset: string;
  /** "Label (CODE, GMT±N)" or "Label (GMT±N)" */
  displayLabel: string;
};

export type TimezoneGroup = {
  regionLabel: string;
  zones: TimezoneZone[];
};

function getTimezoneOffset(value: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: value,
      timeZoneName: 'longOffset'
    }).formatToParts(new Date());
    const part = parts.find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
}

function getTimezoneAbbreviation(value: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: value,
      timeZoneName: 'short'
    }).formatToParts(new Date());
    const part = parts.find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
}

const REGION_LABELS: Record<string, string> = {
  Africa: 'Africa',
  America: 'Americas',
  Antarctica: 'Antarctica',
  Arctic: 'Arctic',
  Asia: 'Asia',
  Atlantic: 'Atlantic',
  Australia: 'Australia',
  Europe: 'Europe',
  Indian: 'Indian Ocean',
  Pacific: 'Pacific',
  Etc: 'UTC & Other'
};

const REGION_ORDER = [
  'Etc',
  'America',
  'Atlantic',
  'Europe',
  'Africa',
  'Asia',
  'Indian',
  'Australia',
  'Pacific',
  'Antarctica',
  'Arctic'
];

function formatZoneLabel(value: string): string {
  const parts = value.split('/');
  if (parts.length === 1) return value;
  return parts
    .slice(1)
    .join(' / ')
    .replace(/_/g, ' ');
}

function enrichZone(value: string, label: string): TimezoneZone {
  const code = getTimezoneAbbreviation(value);
  const offset = getTimezoneOffset(value);
  const displayLabel =
    code && offset
      ? `${label} (${code}, ${offset})`
      : offset
        ? `${label} (${offset})`
        : code
          ? `${label} (${code})`
          : label;
  return { value, label, code, offset, displayLabel };
}

function getTimezoneGroupsFromIntl(): TimezoneGroup[] {
  if (typeof Intl === 'undefined' || !('supportedValuesOf' in Intl)) return [];
  try {
    const zones = (Intl as unknown as { supportedValuesOf(key: string): string[] }).supportedValuesOf('timeZone');
    const byRegion: Record<string, TimezoneZone[]> = {};
    for (const value of zones) {
      const [region] = value.split('/');
      const key = region || 'Etc';
      if (!byRegion[key]) byRegion[key] = [];
      byRegion[key].push(enrichZone(value, formatZoneLabel(value)));
    }
    for (const key of Object.keys(byRegion)) {
      byRegion[key].sort((a, b) => a.label.localeCompare(b.label));
    }
    const order = [...REGION_ORDER];
    const rest = Object.keys(byRegion).filter((k) => !order.includes(k));
    const sortedRegions = [...order.filter((k) => byRegion[k]?.length), ...rest.sort()];
    return sortedRegions.map((region) => ({
      regionLabel: REGION_LABELS[region] ?? region,
      zones: byRegion[region] ?? []
    }));
  } catch {
    return [];
  }
}

/** Static fallback: comprehensive IANA timezones grouped (used when Intl.supportedValuesOf is unavailable). */
function getTimezoneGroupsStatic(): TimezoneGroup[] {
  const raw: { r: string; z: string[] }[] = [
    { r: 'Etc', z: ['Etc/UTC', 'Etc/GMT', 'Etc/GMT+1', 'Etc/GMT+10', 'Etc/GMT+11', 'Etc/GMT+12', 'Etc/GMT+2', 'Etc/GMT+3', 'Etc/GMT+4', 'Etc/GMT+5', 'Etc/GMT+6', 'Etc/GMT+7', 'Etc/GMT+8', 'Etc/GMT+9', 'Etc/GMT-1', 'Etc/GMT-10', 'Etc/GMT-11', 'Etc/GMT-12', 'Etc/GMT-2', 'Etc/GMT-3', 'Etc/GMT-4', 'Etc/GMT-5', 'Etc/GMT-6', 'Etc/GMT-7', 'Etc/GMT-8', 'Etc/GMT-9'] },
    {
      r: 'America',
      z: [
        'Adak', 'Anchorage', 'Araguaina', 'Buenos_Aires', 'Catamarca', 'Cordoba', 'Jujuy', 'La_Rioja', 'Mendoza', 'Rio_Gallegos', 'Salta', 'San_Juan', 'San_Luis', 'Tucuman', 'Ushuaia',
        'Atikokan', 'Bahia', 'Bahia_Banderas', 'Barbados', 'Belem', 'Belize', 'Blanc-Sablon', 'Boa_Vista', 'Bogota', 'Boise', 'Cambridge_Bay', 'Campo_Grande', 'Cancun', 'Caracas',
        'Cayenne', 'Cayman', 'Chicago', 'Chihuahua', 'Costa_Rica', 'Creston', 'Cuiaba', 'Curacao', 'Danmarkshavn', 'Dawson', 'Dawson_Creek', 'Denver', 'Detroit', 'Dominica', 'Edmonton',
        'Eirunepe', 'El_Salvador', 'Fortaleza', 'Fort_Nelson', 'Glace_Bay', 'Godthab', 'Goose_Bay', 'Grand_Turk', 'Grenada', 'Guadeloupe', 'Guatemala', 'Guayaquil', 'Guyana', 'Halifax',
        'Havana', 'Hermosillo', 'Indiana/Indianapolis', 'Indiana/Knox', 'Indiana/Marengo', 'Indiana/Petersburg', 'Indiana/Tell_City', 'Indiana/Vevay', 'Indiana/Vincennes', 'Indiana/Winamac',
        'Inuvik', 'Iqaluit', 'Jamaica', 'Juneau', 'Kentucky/Louisville', 'Kentucky/Monticello', 'Kralendijk', 'La_Paz', 'Lima', 'Los_Angeles', 'Lower_Princes', 'Maceio', 'Managua',
        'Manaus', 'Marigot', 'Martinique', 'Matamoros', 'Mazatlan', 'Menominee', 'Merida', 'Metlakatla', 'Mexico_City', 'Miquelon', 'Moncton', 'Monterrey', 'Montevideo', 'Montreal',
        'Montserrat', 'Nassau', 'New_York', 'Nipigon', 'Nome', 'Noronha', 'North_Dakota/Beulah', 'North_Dakota/Center', 'North_Dakota/New_Salem', 'Ojinaga', 'Panama', 'Pangnirtung',
        'Paramaribo', 'Phoenix', 'Port-au-Prince', 'Port_of_Spain', 'Porto_Velho', 'Puerto_Rico', 'Rainy_River', 'Rankin_Inlet', 'Recife', 'Regina', 'Resolute', 'Rio_Branco', 'Santa_Isabel',
        'Santarem', 'Santiago', 'Santo_Domingo', 'Sao_Paulo', 'Scoresbysund', 'Shiprock', 'Sitka', 'St_Barthelemy', 'St_Johns', 'St_Kitts', 'St_Lucia', 'St_Thomas', 'St_Vincent',
        'Swift_Current', 'Tegucigalpa', 'Thule', 'Thunder_Bay', 'Tijuana', 'Toronto', 'Tortola', 'Vancouver', 'Whitehorse', 'Winnipeg', 'Yakutat', 'Yellowknife'
      ]
    },
    { r: 'Atlantic', z: ['Azores', 'Bermuda', 'Canary', 'Cape_Verde', 'Faroe', 'Madeira', 'Reykjavik', 'South_Georgia', 'St_Helena', 'Stanley'] },
    {
      r: 'Europe',
      z: [
        'Amsterdam', 'Andorra', 'Astrakhan', 'Athens', 'Belgrade', 'Berlin', 'Bratislava', 'Brussels', 'Bucharest', 'Budapest', 'Busingen', 'Chisinau', 'Copenhagen', 'Dublin',
        'Gibraltar', 'Guernsey', 'Helsinki', 'Isle_of_Man', 'Istanbul', 'Jersey', 'Kaliningrad', 'Kiev', 'Kirov', 'Lisbon', 'Ljubljana', 'London', 'Luxembourg', 'Madrid', 'Malta',
        'Mariehamn', 'Minsk', 'Monaco', 'Moscow', 'Oslo', 'Paris', 'Podgorica', 'Prague', 'Riga', 'Rome', 'Samara', 'San_Marino', 'Sarajevo', 'Saratov', 'Simferopol', 'Skopje',
        'Sofia', 'Stockholm', 'Tallinn', 'Tirane', 'Ulyanovsk', 'Uzhgorod', 'Vaduz', 'Vatican', 'Vienna', 'Vilnius', 'Volgograd', 'Warsaw', 'Zagreb', 'Zaporozhye', 'Zurich'
      ]
    },
    {
      r: 'Africa',
      z: [
        'Abidjan', 'Accra', 'Addis_Ababa', 'Algiers', 'Asmara', 'Bamako', 'Bangui', 'Banjul', 'Bissau', 'Blantyre', 'Brazzaville', 'Bujumbura', 'Cairo', 'Casablanca', 'Ceuta',
        'Conakry', 'Dakar', 'Dar_es_Salaam', 'Djibouti', 'Douala', 'El_Aaiun', 'Freetown', 'Gaborone', 'Harare', 'Johannesburg', 'Juba', 'Kampala', 'Khartoum', 'Kigali', 'Kinshasa',
        'Lagos', 'Libreville', 'Lome', 'Luanda', 'Lubumbashi', 'Lusaka', 'Malabo', 'Maputo', 'Maseru', 'Mbabane', 'Mogadishu', 'Monrovia', 'Nairobi', 'Ndjamena', 'Niamey',
        'Nouakchott', 'Ouagadougou', 'Porto-Novo', 'Sao_Tome', 'Tripoli', 'Tunis', 'Windhoek'
      ]
    },
    {
      r: 'Asia',
      z: [
        'Almaty', 'Amman', 'Anadyr', 'Aqtau', 'Aqtobe', 'Ashgabat', 'Atyrau', 'Baghdad', 'Bahrain', 'Baku', 'Bangkok', 'Barnaul', 'Beirut', 'Bishkek', 'Brunei', 'Chita', 'Choibalsan',
        'Colombo', 'Damascus', 'Dhaka', 'Dili', 'Dubai', 'Dushanbe', 'Famagusta', 'Gaza', 'Harbin', 'Hebron', 'Ho_Chi_Minh', 'Hong_Kong', 'Hovd', 'Irkutsk', 'Jakarta', 'Jayapura',
        'Jerusalem', 'Kabul', 'Kamchatka', 'Karachi', 'Kashgar', 'Kathmandu', 'Khandyga', 'Kolkata', 'Krasnoyarsk', 'Kuala_Lumpur', 'Kuching', 'Kuwait', 'Macau', 'Magadan', 'Makassar',
        'Manila', 'Muscat', 'Nicosia', 'Novokuznetsk', 'Novosibirsk', 'Omsk', 'Oral', 'Phnom_Penh', 'Pontianak', 'Pyongyang', 'Qatar', 'Qyzylorda', 'Rangoon', 'Riyadh', 'Sakhalin',
        'Samarkand', 'Seoul', 'Shanghai', 'Singapore', 'Srednekolymsk', 'Taipei', 'Tashkent', 'Tbilisi', 'Tehran', 'Thimphu', 'Tokyo', 'Tomsk', 'Ulaanbaatar', 'Urumqi', 'Ust-Nera',
        'Vientiane', 'Vladivostok', 'Yakutsk', 'Yekaterinburg', 'Yerevan'
      ]
    },
    { r: 'Indian', z: ['Antananarivo', 'Chagos', 'Christmas', 'Cocos', 'Comoro', 'Kerguelen', 'Mahe', 'Maldives', 'Mauritius', 'Mayotte', 'Reunion'] },
    {
      r: 'Australia',
      z: ['Adelaide', 'Brisbane', 'Broken_Hill', 'Currie', 'Darwin', 'Eucla', 'Hobart', 'Lindeman', 'Lord_Howe', 'Melbourne', 'Perth', 'Sydney']
      },
    {
      r: 'Pacific',
      z: [
        'Apia', 'Auckland', 'Chatham', 'Chuuk', 'Easter', 'Efate', 'Enderbury', 'Fakaofo', 'Fiji', 'Funafuti', 'Galapagos', 'Gambier', 'Guadalcanal', 'Guam', 'Honolulu', 'Kiritimati',
        'Kosrae', 'Kwajalein', 'Majuro', 'Marquesas', 'Midway', 'Nauru', 'Niue', 'Norfolk', 'Noumea', 'Pago_Pago', 'Palau', 'Pitcairn', 'Pohnpei', 'Port_Moresby', 'Rarotonga', 'Saipan',
        'Samoa', 'Tahiti', 'Tarawa', 'Tongatapu', 'Wake', 'Wallis'
      ]
    },
    { r: 'Antarctica', z: ['Casey', 'Davis', 'DumontDUrville', 'Macquarie', 'Mawson', 'McMurdo', 'Palmer', 'Rothera', 'South_Pole', 'Syowa', 'Troll', 'Vostok'] },
    { r: 'Arctic', z: ['Longyearbyen'] }
  ];
  return raw.map(({ r, z }) => ({
    regionLabel: REGION_LABELS[r] ?? r,
    zones: z
      .map((s) => {
        const value = r === 'Etc' ? s : `${r}/${s}`;
        return enrichZone(value, formatZoneLabel(value));
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }));
}

let cached: TimezoneGroup[] | null = null;

/** Returns timezone groups (region label + zones). Uses Intl when available, else static list. */
export function getTimezoneGroups(): TimezoneGroup[] {
  if (cached) return cached;
  cached = getTimezoneGroupsFromIntl();
  if (cached.length === 0) cached = getTimezoneGroupsStatic();
  return cached;
}
