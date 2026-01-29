import type { PrismaClient } from '../../generated/prisma/client';
import { Country } from 'country-state-city';

export const countries = [
  {
    name: 'Afghanistan',
    iso2: 'AF',
    iso3: 'AFG',
    phonePrefix: '+93',
    currencyCode: 'AFN',
    continent: 'Asia'
  },
  {
    name: 'Albania',
    iso2: 'AL',
    iso3: 'ALB',
    phonePrefix: '+355',
    currencyCode: 'ALL',
    continent: 'Europe'
  },
  {
    name: 'Algeria',
    iso2: 'DZ',
    iso3: 'DZA',
    phonePrefix: '+213',
    currencyCode: 'DZD',
    continent: 'Africa'
  },
  {
    name: 'American Samoa',
    iso2: 'AS',
    iso3: 'ASM',
    phonePrefix: '+1684',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Andorra',
    iso2: 'AD',
    iso3: 'AND',
    phonePrefix: '+376',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Angola',
    iso2: 'AO',
    iso3: 'AGO',
    phonePrefix: '+244',
    currencyCode: 'AOA',
    continent: 'Africa'
  },
  {
    name: 'Anguilla',
    iso2: 'AI',
    iso3: 'AIA',
    phonePrefix: '+1264',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Antarctica',
    iso2: 'AQ',
    iso3: 'ATA',
    phonePrefix: '+672',
    currencyCode: 'USD',
    continent: 'Antarctica'
  },
  {
    name: 'Antigua and Barbuda',
    iso2: 'AG',
    iso3: 'ATG',
    phonePrefix: '+1268',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Argentina',
    iso2: 'AR',
    iso3: 'ARG',
    phonePrefix: '+54',
    currencyCode: 'ARS',
    continent: 'South America'
  },
  {
    name: 'Armenia',
    iso2: 'AM',
    iso3: 'ARM',
    phonePrefix: '+374',
    currencyCode: 'AMD',
    continent: 'Asia'
  },
  {
    name: 'Aruba',
    iso2: 'AW',
    iso3: 'ABW',
    phonePrefix: '+297',
    currencyCode: 'AWG',
    continent: 'North America'
  },
  {
    name: 'Australia',
    iso2: 'AU',
    iso3: 'AUS',
    phonePrefix: '+61',
    currencyCode: 'AUD',
    continent: 'Oceania'
  },
  {
    name: 'Austria',
    iso2: 'AT',
    iso3: 'AUT',
    phonePrefix: '+43',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Azerbaijan',
    iso2: 'AZ',
    iso3: 'AZE',
    phonePrefix: '+994',
    currencyCode: 'AZN',
    continent: 'Asia'
  },
  {
    name: 'Bahamas',
    iso2: 'BS',
    iso3: 'BHS',
    phonePrefix: '+1242',
    currencyCode: 'BSD',
    continent: 'North America'
  },
  {
    name: 'Bahrain',
    iso2: 'BH',
    iso3: 'BHR',
    phonePrefix: '+973',
    currencyCode: 'BHD',
    continent: 'Asia'
  },
  {
    name: 'Bangladesh',
    iso2: 'BD',
    iso3: 'BGD',
    phonePrefix: '+880',
    currencyCode: 'BDT',
    continent: 'Asia'
  },
  {
    name: 'Barbados',
    iso2: 'BB',
    iso3: 'BRB',
    phonePrefix: '+1246',
    currencyCode: 'BBD',
    continent: 'North America'
  },
  {
    name: 'Belarus',
    iso2: 'BY',
    iso3: 'BLR',
    phonePrefix: '+375',
    currencyCode: 'BYN',
    continent: 'Europe'
  },
  {
    name: 'Belgium',
    iso2: 'BE',
    iso3: 'BEL',
    phonePrefix: '+32',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Belize',
    iso2: 'BZ',
    iso3: 'BLZ',
    phonePrefix: '+501',
    currencyCode: 'BZD',
    continent: 'North America'
  },
  {
    name: 'Benin',
    iso2: 'BJ',
    iso3: 'BEN',
    phonePrefix: '+229',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Bermuda',
    iso2: 'BM',
    iso3: 'BMU',
    phonePrefix: '+1441',
    currencyCode: 'BMD',
    continent: 'North America'
  },
  {
    name: 'Bhutan',
    iso2: 'BT',
    iso3: 'BTN',
    phonePrefix: '+975',
    currencyCode: 'BTN',
    continent: 'Asia'
  },
  {
    name: 'Bolivia',
    iso2: 'BO',
    iso3: 'BOL',
    phonePrefix: '+591',
    currencyCode: 'BOB',
    continent: 'South America'
  },
  {
    name: 'Bosnia and Herzegovina',
    iso2: 'BA',
    iso3: 'BIH',
    phonePrefix: '+387',
    currencyCode: 'BAM',
    continent: 'Europe'
  },
  {
    name: 'Botswana',
    iso2: 'BW',
    iso3: 'BWA',
    phonePrefix: '+267',
    currencyCode: 'BWP',
    continent: 'Africa'
  },
  {
    name: 'Bouvet Island',
    iso2: 'BV',
    iso3: 'BVT',
    phonePrefix: '+47',
    currencyCode: 'NOK',
    continent: 'Antarctica'
  },
  {
    name: 'Brazil',
    iso2: 'BR',
    iso3: 'BRA',
    phonePrefix: '+55',
    currencyCode: 'BRL',
    continent: 'South America'
  },
  {
    name: 'British Indian Ocean Territory',
    iso2: 'IO',
    iso3: 'IOT',
    phonePrefix: '+246',
    currencyCode: 'USD',
    continent: 'Asia'
  },
  {
    name: 'Brunei',
    iso2: 'BN',
    iso3: 'BRN',
    phonePrefix: '+673',
    currencyCode: 'BND',
    continent: 'Asia'
  },
  {
    name: 'Bulgaria',
    iso2: 'BG',
    iso3: 'BGR',
    phonePrefix: '+359',
    currencyCode: 'BGN',
    continent: 'Europe'
  },
  {
    name: 'Burkina Faso',
    iso2: 'BF',
    iso3: 'BFA',
    phonePrefix: '+226',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Burundi',
    iso2: 'BI',
    iso3: 'BDI',
    phonePrefix: '+257',
    currencyCode: 'BIF',
    continent: 'Africa'
  },
  {
    name: 'Cambodia',
    iso2: 'KH',
    iso3: 'KHM',
    phonePrefix: '+855',
    currencyCode: 'KHR',
    continent: 'Asia'
  },
  {
    name: 'Cameroon',
    iso2: 'CM',
    iso3: 'CMR',
    phonePrefix: '+237',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Canada',
    iso2: 'CA',
    iso3: 'CAN',
    phonePrefix: '+1',
    currencyCode: 'CAD',
    continent: 'North America'
  },
  {
    name: 'Cape Verde',
    iso2: 'CV',
    iso3: 'CPV',
    phonePrefix: '+238',
    currencyCode: 'CVE',
    continent: 'Africa'
  },
  {
    name: 'Cayman Islands',
    iso2: 'KY',
    iso3: 'CYM',
    phonePrefix: '+1345',
    currencyCode: 'KYD',
    continent: 'North America'
  },
  {
    name: 'Central African Republic',
    iso2: 'CF',
    iso3: 'CAF',
    phonePrefix: '+236',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Chad',
    iso2: 'TD',
    iso3: 'TCD',
    phonePrefix: '+235',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Chile',
    iso2: 'CL',
    iso3: 'CHL',
    phonePrefix: '+56',
    currencyCode: 'CLP',
    continent: 'South America'
  },
  {
    name: 'China',
    iso2: 'CN',
    iso3: 'CHN',
    phonePrefix: '+86',
    currencyCode: 'CNY',
    continent: 'Asia'
  },
  {
    name: 'Christmas Island',
    iso2: 'CX',
    iso3: 'CXR',
    phonePrefix: '+61',
    currencyCode: 'AUD',
    continent: 'Asia'
  },
  {
    name: 'Cocos Islands',
    iso2: 'CC',
    iso3: 'CCK',
    phonePrefix: '+61',
    currencyCode: 'AUD',
    continent: 'Asia'
  },
  {
    name: 'Colombia',
    iso2: 'CO',
    iso3: 'COL',
    phonePrefix: '+57',
    currencyCode: 'COP',
    continent: 'South America'
  },
  {
    name: 'Comoros',
    iso2: 'KM',
    iso3: 'COM',
    phonePrefix: '+269',
    currencyCode: 'KMF',
    continent: 'Africa'
  },
  {
    name: 'Congo',
    iso2: 'CG',
    iso3: 'COG',
    phonePrefix: '+242',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Democratic Republic of the Congo',
    iso2: 'CD',
    iso3: 'COD',
    phonePrefix: '+243',
    currencyCode: 'CDF',
    continent: 'Africa'
  },
  {
    name: 'Cook Islands',
    iso2: 'CK',
    iso3: 'COK',
    phonePrefix: '+682',
    currencyCode: 'NZD',
    continent: 'Oceania'
  },
  {
    name: 'Costa Rica',
    iso2: 'CR',
    iso3: 'CRI',
    phonePrefix: '+506',
    currencyCode: 'CRC',
    continent: 'North America'
  },
  {
    name: "Côte d'Ivoire",
    iso2: 'CI',
    iso3: 'CIV',
    phonePrefix: '+225',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Croatia',
    iso2: 'HR',
    iso3: 'HRV',
    phonePrefix: '+385',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Cuba',
    iso2: 'CU',
    iso3: 'CUB',
    phonePrefix: '+53',
    currencyCode: 'CUP',
    continent: 'North America'
  },
  {
    name: 'Curaçao',
    iso2: 'CW',
    iso3: 'CUW',
    phonePrefix: '+599',
    currencyCode: 'ANG',
    continent: 'North America'
  },
  {
    name: 'Cyprus',
    iso2: 'CY',
    iso3: 'CYP',
    phonePrefix: '+357',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Czech Republic',
    iso2: 'CZ',
    iso3: 'CZE',
    phonePrefix: '+420',
    currencyCode: 'CZK',
    continent: 'Europe'
  },
  {
    name: 'Denmark',
    iso2: 'DK',
    iso3: 'DNK',
    phonePrefix: '+45',
    currencyCode: 'DKK',
    continent: 'Europe'
  },
  {
    name: 'Djibouti',
    iso2: 'DJ',
    iso3: 'DJI',
    phonePrefix: '+253',
    currencyCode: 'DJF',
    continent: 'Africa'
  },
  {
    name: 'Dominica',
    iso2: 'DM',
    iso3: 'DMA',
    phonePrefix: '+1767',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Dominican Republic',
    iso2: 'DO',
    iso3: 'DOM',
    phonePrefix: '+1809',
    currencyCode: 'DOP',
    continent: 'North America'
  },
  {
    name: 'Ecuador',
    iso2: 'EC',
    iso3: 'ECU',
    phonePrefix: '+593',
    currencyCode: 'USD',
    continent: 'South America'
  },
  {
    name: 'Egypt',
    iso2: 'EG',
    iso3: 'EGY',
    phonePrefix: '+20',
    currencyCode: 'EGP',
    continent: 'Africa'
  },
  {
    name: 'El Salvador',
    iso2: 'SV',
    iso3: 'SLV',
    phonePrefix: '+503',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'Equatorial Guinea',
    iso2: 'GQ',
    iso3: 'GNQ',
    phonePrefix: '+240',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Eritrea',
    iso2: 'ER',
    iso3: 'ERI',
    phonePrefix: '+291',
    currencyCode: 'ERN',
    continent: 'Africa'
  },
  {
    name: 'Estonia',
    iso2: 'EE',
    iso3: 'EST',
    phonePrefix: '+372',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Eswatini',
    iso2: 'SZ',
    iso3: 'SWZ',
    phonePrefix: '+268',
    currencyCode: 'SZL',
    continent: 'Africa'
  },
  {
    name: 'Ethiopia',
    iso2: 'ET',
    iso3: 'ETH',
    phonePrefix: '+251',
    currencyCode: 'ETB',
    continent: 'Africa'
  },
  {
    name: 'Falkland Islands',
    iso2: 'FK',
    iso3: 'FLK',
    phonePrefix: '+500',
    currencyCode: 'FKP',
    continent: 'South America'
  },
  {
    name: 'Faroe Islands',
    iso2: 'FO',
    iso3: 'FRO',
    phonePrefix: '+298',
    currencyCode: 'DKK',
    continent: 'Europe'
  },
  {
    name: 'Fiji',
    iso2: 'FJ',
    iso3: 'FJI',
    phonePrefix: '+679',
    currencyCode: 'FJD',
    continent: 'Oceania'
  },
  {
    name: 'Finland',
    iso2: 'FI',
    iso3: 'FIN',
    phonePrefix: '+358',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',
    phonePrefix: '+33',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'French Guiana',
    iso2: 'GF',
    iso3: 'GUF',
    phonePrefix: '+594',
    currencyCode: 'EUR',
    continent: 'South America'
  },
  {
    name: 'French Polynesia',
    iso2: 'PF',
    iso3: 'PYF',
    phonePrefix: '+689',
    currencyCode: 'XPF',
    continent: 'Oceania'
  },
  {
    name: 'French Southern Territories',
    iso2: 'TF',
    iso3: 'ATF',
    phonePrefix: '+262',
    currencyCode: 'EUR',
    continent: 'Antarctica'
  },
  {
    name: 'Gabon',
    iso2: 'GA',
    iso3: 'GAB',
    phonePrefix: '+241',
    currencyCode: 'XAF',
    continent: 'Africa'
  },
  {
    name: 'Gambia',
    iso2: 'GM',
    iso3: 'GMB',
    phonePrefix: '+220',
    currencyCode: 'GMD',
    continent: 'Africa'
  },
  {
    name: 'Georgia',
    iso2: 'GE',
    iso3: 'GEO',
    phonePrefix: '+995',
    currencyCode: 'GEL',
    continent: 'Asia'
  },
  {
    name: 'Germany',
    iso2: 'DE',
    iso3: 'DEU',
    phonePrefix: '+49',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Ghana',
    iso2: 'GH',
    iso3: 'GHA',
    phonePrefix: '+233',
    currencyCode: 'GHS',
    continent: 'Africa'
  },
  {
    name: 'Gibraltar',
    iso2: 'GI',
    iso3: 'GIB',
    phonePrefix: '+350',
    currencyCode: 'GIP',
    continent: 'Europe'
  },
  {
    name: 'Greece',
    iso2: 'GR',
    iso3: 'GRC',
    phonePrefix: '+30',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Greenland',
    iso2: 'GL',
    iso3: 'GRL',
    phonePrefix: '+299',
    currencyCode: 'DKK',
    continent: 'North America'
  },
  {
    name: 'Grenada',
    iso2: 'GD',
    iso3: 'GRD',
    phonePrefix: '+1473',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Guadeloupe',
    iso2: 'GP',
    iso3: 'GLP',
    phonePrefix: '+590',
    currencyCode: 'EUR',
    continent: 'North America'
  },
  {
    name: 'Guam',
    iso2: 'GU',
    iso3: 'GUM',
    phonePrefix: '+1671',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Guatemala',
    iso2: 'GT',
    iso3: 'GTM',
    phonePrefix: '+502',
    currencyCode: 'GTQ',
    continent: 'North America'
  },
  {
    name: 'Guernsey',
    iso2: 'GG',
    iso3: 'GGY',
    phonePrefix: '+44',
    currencyCode: 'GBP',
    continent: 'Europe'
  },
  {
    name: 'Guinea',
    iso2: 'GN',
    iso3: 'GIN',
    phonePrefix: '+224',
    currencyCode: 'GNF',
    continent: 'Africa'
  },
  {
    name: 'Guinea-Bissau',
    iso2: 'GW',
    iso3: 'GNB',
    phonePrefix: '+245',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Guyana',
    iso2: 'GY',
    iso3: 'GUY',
    phonePrefix: '+592',
    currencyCode: 'GYD',
    continent: 'South America'
  },
  {
    name: 'Haiti',
    iso2: 'HT',
    iso3: 'HTI',
    phonePrefix: '+509',
    currencyCode: 'HTG',
    continent: 'North America'
  },
  {
    name: 'Heard Island and McDonald Islands',
    iso2: 'HM',
    iso3: 'HMD',
    phonePrefix: '+672',
    currencyCode: 'AUD',
    continent: 'Antarctica'
  },
  {
    name: 'Vatican City',
    iso2: 'VA',
    iso3: 'VAT',
    phonePrefix: '+379',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Honduras',
    iso2: 'HN',
    iso3: 'HND',
    phonePrefix: '+504',
    currencyCode: 'HNL',
    continent: 'North America'
  },
  {
    name: 'Hong Kong',
    iso2: 'HK',
    iso3: 'HKG',
    phonePrefix: '+852',
    currencyCode: 'HKD',
    continent: 'Asia'
  },
  {
    name: 'Hungary',
    iso2: 'HU',
    iso3: 'HUN',
    phonePrefix: '+36',
    currencyCode: 'HUF',
    continent: 'Europe'
  },
  {
    name: 'Iceland',
    iso2: 'IS',
    iso3: 'ISL',
    phonePrefix: '+354',
    currencyCode: 'ISK',
    continent: 'Europe'
  },
  {
    name: 'India',
    iso2: 'IN',
    iso3: 'IND',
    phonePrefix: '+91',
    currencyCode: 'INR',
    continent: 'Asia'
  },
  {
    name: 'Indonesia',
    iso2: 'ID',
    iso3: 'IDN',
    phonePrefix: '+62',
    currencyCode: 'IDR',
    continent: 'Asia'
  },
  {
    name: 'Iran',
    iso2: 'IR',
    iso3: 'IRN',
    phonePrefix: '+98',
    currencyCode: 'IRR',
    continent: 'Asia'
  },
  {
    name: 'Iraq',
    iso2: 'IQ',
    iso3: 'IRQ',
    phonePrefix: '+964',
    currencyCode: 'IQD',
    continent: 'Asia'
  },
  {
    name: 'Ireland',
    iso2: 'IE',
    iso3: 'IRL',
    phonePrefix: '+353',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Isle of Man',
    iso2: 'IM',
    iso3: 'IMN',
    phonePrefix: '+44',
    currencyCode: 'GBP',
    continent: 'Europe'
  },
  {
    name: 'Israel',
    iso2: 'IL',
    iso3: 'ISR',
    phonePrefix: '+972',
    currencyCode: 'ILS',
    continent: 'Asia'
  },
  {
    name: 'Italy',
    iso2: 'IT',
    iso3: 'ITA',
    phonePrefix: '+39',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Jamaica',
    iso2: 'JM',
    iso3: 'JAM',
    phonePrefix: '+1876',
    currencyCode: 'JMD',
    continent: 'North America'
  },
  {
    name: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    phonePrefix: '+81',
    currencyCode: 'JPY',
    continent: 'Asia'
  },
  {
    name: 'Jersey',
    iso2: 'JE',
    iso3: 'JEY',
    phonePrefix: '+44',
    currencyCode: 'GBP',
    continent: 'Europe'
  },
  {
    name: 'Jordan',
    iso2: 'JO',
    iso3: 'JOR',
    phonePrefix: '+962',
    currencyCode: 'JOD',
    continent: 'Asia'
  },
  {
    name: 'Kazakhstan',
    iso2: 'KZ',
    iso3: 'KAZ',
    phonePrefix: '+7',
    currencyCode: 'KZT',
    continent: 'Asia'
  },
  {
    name: 'Kenya',
    iso2: 'KE',
    iso3: 'KEN',
    phonePrefix: '+254',
    currencyCode: 'KES',
    continent: 'Africa'
  },
  {
    name: 'Kiribati',
    iso2: 'KI',
    iso3: 'KIR',
    phonePrefix: '+686',
    currencyCode: 'AUD',
    continent: 'Oceania'
  },
  {
    name: 'North Korea',
    iso2: 'KP',
    iso3: 'PRK',
    phonePrefix: '+850',
    currencyCode: 'KPW',
    continent: 'Asia'
  },
  {
    name: 'South Korea',
    iso2: 'KR',
    iso3: 'KOR',
    phonePrefix: '+82',
    currencyCode: 'KRW',
    continent: 'Asia'
  },
  {
    name: 'Kuwait',
    iso2: 'KW',
    iso3: 'KWT',
    phonePrefix: '+965',
    currencyCode: 'KWD',
    continent: 'Asia'
  },
  {
    name: 'Kyrgyzstan',
    iso2: 'KG',
    iso3: 'KGZ',
    phonePrefix: '+996',
    currencyCode: 'KGS',
    continent: 'Asia'
  },
  {
    name: 'Laos',
    iso2: 'LA',
    iso3: 'LAO',
    phonePrefix: '+856',
    currencyCode: 'LAK',
    continent: 'Asia'
  },
  {
    name: 'Latvia',
    iso2: 'LV',
    iso3: 'LVA',
    phonePrefix: '+371',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Lebanon',
    iso2: 'LB',
    iso3: 'LBN',
    phonePrefix: '+961',
    currencyCode: 'LBP',
    continent: 'Asia'
  },
  {
    name: 'Lesotho',
    iso2: 'LS',
    iso3: 'LSO',
    phonePrefix: '+266',
    currencyCode: 'LSL',
    continent: 'Africa'
  },
  {
    name: 'Liberia',
    iso2: 'LR',
    iso3: 'LBR',
    phonePrefix: '+231',
    currencyCode: 'LRD',
    continent: 'Africa'
  },
  {
    name: 'Libya',
    iso2: 'LY',
    iso3: 'LBY',
    phonePrefix: '+218',
    currencyCode: 'LYD',
    continent: 'Africa'
  },
  {
    name: 'Liechtenstein',
    iso2: 'LI',
    iso3: 'LIE',
    phonePrefix: '+423',
    currencyCode: 'CHF',
    continent: 'Europe'
  },
  {
    name: 'Lithuania',
    iso2: 'LT',
    iso3: 'LTU',
    phonePrefix: '+370',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Luxembourg',
    iso2: 'LU',
    iso3: 'LUX',
    phonePrefix: '+352',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Macao',
    iso2: 'MO',
    iso3: 'MAC',
    phonePrefix: '+853',
    currencyCode: 'MOP',
    continent: 'Asia'
  },
  {
    name: 'Madagascar',
    iso2: 'MG',
    iso3: 'MDG',
    phonePrefix: '+261',
    currencyCode: 'MGA',
    continent: 'Africa'
  },
  {
    name: 'Malawi',
    iso2: 'MW',
    iso3: 'MWI',
    phonePrefix: '+265',
    currencyCode: 'MWK',
    continent: 'Africa'
  },
  {
    name: 'Malaysia',
    iso2: 'MY',
    iso3: 'MYS',
    phonePrefix: '+60',
    currencyCode: 'MYR',
    continent: 'Asia'
  },
  {
    name: 'Maldives',
    iso2: 'MV',
    iso3: 'MDV',
    phonePrefix: '+960',
    currencyCode: 'MVR',
    continent: 'Asia'
  },
  {
    name: 'Mali',
    iso2: 'ML',
    iso3: 'MLI',
    phonePrefix: '+223',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Malta',
    iso2: 'MT',
    iso3: 'MLT',
    phonePrefix: '+356',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Marshall Islands',
    iso2: 'MH',
    iso3: 'MHL',
    phonePrefix: '+692',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Martinique',
    iso2: 'MQ',
    iso3: 'MTQ',
    phonePrefix: '+596',
    currencyCode: 'EUR',
    continent: 'North America'
  },
  {
    name: 'Mauritania',
    iso2: 'MR',
    iso3: 'MRT',
    phonePrefix: '+222',
    currencyCode: 'MRU',
    continent: 'Africa'
  },
  {
    name: 'Mauritius',
    iso2: 'MU',
    iso3: 'MUS',
    phonePrefix: '+230',
    currencyCode: 'MUR',
    continent: 'Africa'
  },
  {
    name: 'Mayotte',
    iso2: 'YT',
    iso3: 'MYT',
    phonePrefix: '+262',
    currencyCode: 'EUR',
    continent: 'Africa'
  },
  {
    name: 'Mexico',
    iso2: 'MX',
    iso3: 'MEX',
    phonePrefix: '+52',
    currencyCode: 'MXN',
    continent: 'North America'
  },
  {
    name: 'Micronesia',
    iso2: 'FM',
    iso3: 'FSM',
    phonePrefix: '+691',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Moldova',
    iso2: 'MD',
    iso3: 'MDA',
    phonePrefix: '+373',
    currencyCode: 'MDL',
    continent: 'Europe'
  },
  {
    name: 'Monaco',
    iso2: 'MC',
    iso3: 'MCO',
    phonePrefix: '+377',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Mongolia',
    iso2: 'MN',
    iso3: 'MNG',
    phonePrefix: '+976',
    currencyCode: 'MNT',
    continent: 'Asia'
  },
  {
    name: 'Montenegro',
    iso2: 'ME',
    iso3: 'MNE',
    phonePrefix: '+382',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Montserrat',
    iso2: 'MS',
    iso3: 'MSR',
    phonePrefix: '+1664',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Morocco',
    iso2: 'MA',
    iso3: 'MAR',
    phonePrefix: '+212',
    currencyCode: 'MAD',
    continent: 'Africa'
  },
  {
    name: 'Mozambique',
    iso2: 'MZ',
    iso3: 'MOZ',
    phonePrefix: '+258',
    currencyCode: 'MZN',
    continent: 'Africa'
  },
  {
    name: 'Myanmar',
    iso2: 'MM',
    iso3: 'MMR',
    phonePrefix: '+95',
    currencyCode: 'MMK',
    continent: 'Asia'
  },
  {
    name: 'Namibia',
    iso2: 'NA',
    iso3: 'NAM',
    phonePrefix: '+264',
    currencyCode: 'NAD',
    continent: 'Africa'
  },
  {
    name: 'Nauru',
    iso2: 'NR',
    iso3: 'NRU',
    phonePrefix: '+674',
    currencyCode: 'AUD',
    continent: 'Oceania'
  },
  {
    name: 'Nepal',
    iso2: 'NP',
    iso3: 'NPL',
    phonePrefix: '+977',
    currencyCode: 'NPR',
    continent: 'Asia'
  },
  {
    name: 'Netherlands',
    iso2: 'NL',
    iso3: 'NLD',
    phonePrefix: '+31',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'New Caledonia',
    iso2: 'NC',
    iso3: 'NCL',
    phonePrefix: '+687',
    currencyCode: 'XPF',
    continent: 'Oceania'
  },
  {
    name: 'New Zealand',
    iso2: 'NZ',
    iso3: 'NZL',
    phonePrefix: '+64',
    currencyCode: 'NZD',
    continent: 'Oceania'
  },
  {
    name: 'Nicaragua',
    iso2: 'NI',
    iso3: 'NIC',
    phonePrefix: '+505',
    currencyCode: 'NIO',
    continent: 'North America'
  },
  {
    name: 'Niger',
    iso2: 'NE',
    iso3: 'NER',
    phonePrefix: '+227',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Nigeria',
    iso2: 'NG',
    iso3: 'NGA',
    phonePrefix: '+234',
    currencyCode: 'NGN',
    continent: 'Africa'
  },
  {
    name: 'Niue',
    iso2: 'NU',
    iso3: 'NIU',
    phonePrefix: '+683',
    currencyCode: 'NZD',
    continent: 'Oceania'
  },
  {
    name: 'Norfolk Island',
    iso2: 'NF',
    iso3: 'NFK',
    phonePrefix: '+672',
    currencyCode: 'AUD',
    continent: 'Oceania'
  },
  {
    name: 'North Macedonia',
    iso2: 'MK',
    iso3: 'MKD',
    phonePrefix: '+389',
    currencyCode: 'MKD',
    continent: 'Europe'
  },
  {
    name: 'Northern Mariana Islands',
    iso2: 'MP',
    iso3: 'MNP',
    phonePrefix: '+1670',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Norway',
    iso2: 'NO',
    iso3: 'NOR',
    phonePrefix: '+47',
    currencyCode: 'NOK',
    continent: 'Europe'
  },
  {
    name: 'Oman',
    iso2: 'OM',
    iso3: 'OMN',
    phonePrefix: '+968',
    currencyCode: 'OMR',
    continent: 'Asia'
  },
  {
    name: 'Pakistan',
    iso2: 'PK',
    iso3: 'PAK',
    phonePrefix: '+92',
    currencyCode: 'PKR',
    continent: 'Asia'
  },
  {
    name: 'Palau',
    iso2: 'PW',
    iso3: 'PLW',
    phonePrefix: '+680',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Palestine',
    iso2: 'PS',
    iso3: 'PSE',
    phonePrefix: '+970',
    currencyCode: 'ILS',
    continent: 'Asia'
  },
  {
    name: 'Panama',
    iso2: 'PA',
    iso3: 'PAN',
    phonePrefix: '+507',
    currencyCode: 'PAB',
    continent: 'North America'
  },
  {
    name: 'Papua New Guinea',
    iso2: 'PG',
    iso3: 'PNG',
    phonePrefix: '+675',
    currencyCode: 'PGK',
    continent: 'Oceania'
  },
  {
    name: 'Paraguay',
    iso2: 'PY',
    iso3: 'PRY',
    phonePrefix: '+595',
    currencyCode: 'PYG',
    continent: 'South America'
  },
  {
    name: 'Peru',
    iso2: 'PE',
    iso3: 'PER',
    phonePrefix: '+51',
    currencyCode: 'PEN',
    continent: 'South America'
  },
  {
    name: 'Philippines',
    iso2: 'PH',
    iso3: 'PHL',
    phonePrefix: '+63',
    currencyCode: 'PHP',
    continent: 'Asia'
  },
  {
    name: 'Pitcairn',
    iso2: 'PN',
    iso3: 'PCN',
    phonePrefix: '+64',
    currencyCode: 'NZD',
    continent: 'Oceania'
  },
  {
    name: 'Poland',
    iso2: 'PL',
    iso3: 'POL',
    phonePrefix: '+48',
    currencyCode: 'PLN',
    continent: 'Europe'
  },
  {
    name: 'Portugal',
    iso2: 'PT',
    iso3: 'PRT',
    phonePrefix: '+351',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Puerto Rico',
    iso2: 'PR',
    iso3: 'PRI',
    phonePrefix: '+1787',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'Qatar',
    iso2: 'QA',
    iso3: 'QAT',
    phonePrefix: '+974',
    currencyCode: 'QAR',
    continent: 'Asia'
  },
  {
    name: 'Réunion',
    iso2: 'RE',
    iso3: 'REU',
    phonePrefix: '+262',
    currencyCode: 'EUR',
    continent: 'Africa'
  },
  {
    name: 'Romania',
    iso2: 'RO',
    iso3: 'ROU',
    phonePrefix: '+40',
    currencyCode: 'RON',
    continent: 'Europe'
  },
  {
    name: 'Russia',
    iso2: 'RU',
    iso3: 'RUS',
    phonePrefix: '+7',
    currencyCode: 'RUB',
    continent: 'Europe'
  },
  {
    name: 'Rwanda',
    iso2: 'RW',
    iso3: 'RWA',
    phonePrefix: '+250',
    currencyCode: 'RWF',
    continent: 'Africa'
  },
  {
    name: 'Saint Barthélemy',
    iso2: 'BL',
    iso3: 'BLM',
    phonePrefix: '+590',
    currencyCode: 'EUR',
    continent: 'North America'
  },
  {
    name: 'Saint Helena',
    iso2: 'SH',
    iso3: 'SHN',
    phonePrefix: '+290',
    currencyCode: 'SHP',
    continent: 'Africa'
  },
  {
    name: 'Saint Kitts and Nevis',
    iso2: 'KN',
    iso3: 'KNA',
    phonePrefix: '+1869',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Saint Lucia',
    iso2: 'LC',
    iso3: 'LCA',
    phonePrefix: '+1758',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Saint Martin',
    iso2: 'MF',
    iso3: 'MAF',
    phonePrefix: '+590',
    currencyCode: 'EUR',
    continent: 'North America'
  },
  {
    name: 'Saint Pierre and Miquelon',
    iso2: 'PM',
    iso3: 'SPM',
    phonePrefix: '+508',
    currencyCode: 'EUR',
    continent: 'North America'
  },
  {
    name: 'Saint Vincent and the Grenadines',
    iso2: 'VC',
    iso3: 'VCT',
    phonePrefix: '+1784',
    currencyCode: 'XCD',
    continent: 'North America'
  },
  {
    name: 'Samoa',
    iso2: 'WS',
    iso3: 'WSM',
    phonePrefix: '+685',
    currencyCode: 'WST',
    continent: 'Oceania'
  },
  {
    name: 'San Marino',
    iso2: 'SM',
    iso3: 'SMR',
    phonePrefix: '+378',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'São Tomé and Príncipe',
    iso2: 'ST',
    iso3: 'STP',
    phonePrefix: '+239',
    currencyCode: 'STN',
    continent: 'Africa'
  },
  {
    name: 'Saudi Arabia',
    iso2: 'SA',
    iso3: 'SAU',
    phonePrefix: '+966',
    currencyCode: 'SAR',
    continent: 'Asia'
  },
  {
    name: 'Senegal',
    iso2: 'SN',
    iso3: 'SEN',
    phonePrefix: '+221',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Serbia',
    iso2: 'RS',
    iso3: 'SRB',
    phonePrefix: '+381',
    currencyCode: 'RSD',
    continent: 'Europe'
  },
  {
    name: 'Seychelles',
    iso2: 'SC',
    iso3: 'SYC',
    phonePrefix: '+248',
    currencyCode: 'SCR',
    continent: 'Africa'
  },
  {
    name: 'Sierra Leone',
    iso2: 'SL',
    iso3: 'SLE',
    phonePrefix: '+232',
    currencyCode: 'SLE',
    continent: 'Africa'
  },
  {
    name: 'Singapore',
    iso2: 'SG',
    iso3: 'SGP',
    phonePrefix: '+65',
    currencyCode: 'SGD',
    continent: 'Asia'
  },
  {
    name: 'Sint Maarten',
    iso2: 'SX',
    iso3: 'SXM',
    phonePrefix: '+1721',
    currencyCode: 'ANG',
    continent: 'North America'
  },
  {
    name: 'Slovakia',
    iso2: 'SK',
    iso3: 'SVK',
    phonePrefix: '+421',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Slovenia',
    iso2: 'SI',
    iso3: 'SVN',
    phonePrefix: '+386',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Solomon Islands',
    iso2: 'SB',
    iso3: 'SLB',
    phonePrefix: '+677',
    currencyCode: 'SBD',
    continent: 'Oceania'
  },
  {
    name: 'Somalia',
    iso2: 'SO',
    iso3: 'SOM',
    phonePrefix: '+252',
    currencyCode: 'SOS',
    continent: 'Africa'
  },
  {
    name: 'South Africa',
    iso2: 'ZA',
    iso3: 'ZAF',
    phonePrefix: '+27',
    currencyCode: 'ZAR',
    continent: 'Africa'
  },
  {
    name: 'South Georgia and the South Sandwich Islands',
    iso2: 'GS',
    iso3: 'SGS',
    phonePrefix: '+500',
    currencyCode: 'GBP',
    continent: 'Antarctica'
  },
  {
    name: 'South Sudan',
    iso2: 'SS',
    iso3: 'SSD',
    phonePrefix: '+211',
    currencyCode: 'SSP',
    continent: 'Africa'
  },
  {
    name: 'Spain',
    iso2: 'ES',
    iso3: 'ESP',
    phonePrefix: '+34',
    currencyCode: 'EUR',
    continent: 'Europe'
  },
  {
    name: 'Sri Lanka',
    iso2: 'LK',
    iso3: 'LKA',
    phonePrefix: '+94',
    currencyCode: 'LKR',
    continent: 'Asia'
  },
  {
    name: 'Sudan',
    iso2: 'SD',
    iso3: 'SDN',
    phonePrefix: '+249',
    currencyCode: 'SDG',
    continent: 'Africa'
  },
  {
    name: 'Suriname',
    iso2: 'SR',
    iso3: 'SUR',
    phonePrefix: '+597',
    currencyCode: 'SRD',
    continent: 'South America'
  },
  {
    name: 'Svalbard and Jan Mayen',
    iso2: 'SJ',
    iso3: 'SJM',
    phonePrefix: '+47',
    currencyCode: 'NOK',
    continent: 'Europe'
  },
  {
    name: 'Sweden',
    iso2: 'SE',
    iso3: 'SWE',
    phonePrefix: '+46',
    currencyCode: 'SEK',
    continent: 'Europe'
  },
  {
    name: 'Switzerland',
    iso2: 'CH',
    iso3: 'CHE',
    phonePrefix: '+41',
    currencyCode: 'CHF',
    continent: 'Europe'
  },
  {
    name: 'Syria',
    iso2: 'SY',
    iso3: 'SYR',
    phonePrefix: '+963',
    currencyCode: 'SYP',
    continent: 'Asia'
  },
  {
    name: 'Taiwan',
    iso2: 'TW',
    iso3: 'TWN',
    phonePrefix: '+886',
    currencyCode: 'TWD',
    continent: 'Asia'
  },
  {
    name: 'Tajikistan',
    iso2: 'TJ',
    iso3: 'TJK',
    phonePrefix: '+992',
    currencyCode: 'TJS',
    continent: 'Asia'
  },
  {
    name: 'Tanzania',
    iso2: 'TZ',
    iso3: 'TZA',
    phonePrefix: '+255',
    currencyCode: 'TZS',
    continent: 'Africa'
  },
  {
    name: 'Thailand',
    iso2: 'TH',
    iso3: 'THA',
    phonePrefix: '+66',
    currencyCode: 'THB',
    continent: 'Asia'
  },
  {
    name: 'Timor-Leste',
    iso2: 'TL',
    iso3: 'TLS',
    phonePrefix: '+670',
    currencyCode: 'USD',
    continent: 'Asia'
  },
  {
    name: 'Togo',
    iso2: 'TG',
    iso3: 'TGO',
    phonePrefix: '+228',
    currencyCode: 'XOF',
    continent: 'Africa'
  },
  {
    name: 'Tokelau',
    iso2: 'TK',
    iso3: 'TKL',
    phonePrefix: '+690',
    currencyCode: 'NZD',
    continent: 'Oceania'
  },
  {
    name: 'Tonga',
    iso2: 'TO',
    iso3: 'TON',
    phonePrefix: '+676',
    currencyCode: 'TOP',
    continent: 'Oceania'
  },
  {
    name: 'Trinidad and Tobago',
    iso2: 'TT',
    iso3: 'TTO',
    phonePrefix: '+1868',
    currencyCode: 'TTD',
    continent: 'North America'
  },
  {
    name: 'Tunisia',
    iso2: 'TN',
    iso3: 'TUN',
    phonePrefix: '+216',
    currencyCode: 'TND',
    continent: 'Africa'
  },
  {
    name: 'Turkey',
    iso2: 'TR',
    iso3: 'TUR',
    phonePrefix: '+90',
    currencyCode: 'TRY',
    continent: 'Asia'
  },
  {
    name: 'Turkmenistan',
    iso2: 'TM',
    iso3: 'TKM',
    phonePrefix: '+993',
    currencyCode: 'TMT',
    continent: 'Asia'
  },
  {
    name: 'Turks and Caicos Islands',
    iso2: 'TC',
    iso3: 'TCA',
    phonePrefix: '+1649',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'Tuvalu',
    iso2: 'TV',
    iso3: 'TUV',
    phonePrefix: '+688',
    currencyCode: 'AUD',
    continent: 'Oceania'
  },
  {
    name: 'Uganda',
    iso2: 'UG',
    iso3: 'UGA',
    phonePrefix: '+256',
    currencyCode: 'UGX',
    continent: 'Africa'
  },
  {
    name: 'Ukraine',
    iso2: 'UA',
    iso3: 'UKR',
    phonePrefix: '+380',
    currencyCode: 'UAH',
    continent: 'Europe'
  },
  {
    name: 'United Arab Emirates',
    iso2: 'AE',
    iso3: 'ARE',
    phonePrefix: '+971',
    currencyCode: 'AED',
    continent: 'Asia'
  },
  {
    name: 'United Kingdom',
    iso2: 'GB',
    iso3: 'GBR',
    phonePrefix: '+44',
    currencyCode: 'GBP',
    continent: 'Europe'
  },
  {
    name: 'United States',
    iso2: 'US',
    iso3: 'USA',
    phonePrefix: '+1',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'United States Minor Outlying Islands',
    iso2: 'UM',
    iso3: 'UMI',
    phonePrefix: '+1',
    currencyCode: 'USD',
    continent: 'Oceania'
  },
  {
    name: 'Uruguay',
    iso2: 'UY',
    iso3: 'URY',
    phonePrefix: '+598',
    currencyCode: 'UYU',
    continent: 'South America'
  },
  {
    name: 'Uzbekistan',
    iso2: 'UZ',
    iso3: 'UZB',
    phonePrefix: '+998',
    currencyCode: 'UZS',
    continent: 'Asia'
  },
  {
    name: 'Vanuatu',
    iso2: 'VU',
    iso3: 'VUT',
    phonePrefix: '+678',
    currencyCode: 'VUV',
    continent: 'Oceania'
  },
  {
    name: 'Venezuela',
    iso2: 'VE',
    iso3: 'VEN',
    phonePrefix: '+58',
    currencyCode: 'VED',
    continent: 'South America'
  },
  {
    name: 'Vietnam',
    iso2: 'VN',
    iso3: 'VNM',
    phonePrefix: '+84',
    currencyCode: 'VND',
    continent: 'Asia'
  },
  {
    name: 'British Virgin Islands',
    iso2: 'VG',
    iso3: 'VGB',
    phonePrefix: '+1284',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'U.S. Virgin Islands',
    iso2: 'VI',
    iso3: 'VIR',
    phonePrefix: '+1340',
    currencyCode: 'USD',
    continent: 'North America'
  },
  {
    name: 'Wallis and Futuna',
    iso2: 'WF',
    iso3: 'WLF',
    phonePrefix: '+681',
    currencyCode: 'XPF',
    continent: 'Oceania'
  },
  {
    name: 'Western Sahara',
    iso2: 'EH',
    iso3: 'ESH',
    phonePrefix: '+212',
    currencyCode: 'MAD',
    continent: 'Africa'
  },
  {
    name: 'Yemen',
    iso2: 'YE',
    iso3: 'YEM',
    phonePrefix: '+967',
    currencyCode: 'YER',
    continent: 'Asia'
  },
  {
    name: 'Zambia',
    iso2: 'ZM',
    iso3: 'ZMB',
    phonePrefix: '+260',
    currencyCode: 'ZMW',
    continent: 'Africa'
  },
  {
    name: 'Zimbabwe',
    iso2: 'ZW',
    iso3: 'ZWE',
    phonePrefix: '+263',
    currencyCode: 'USD',
    continent: 'Africa'
  }
];

export async function seedCountries(prisma: PrismaClient) {
  const totalCountries = countries.length;
  let count = 0;
  try {
    console.log('🌎 Seeding countries...');
    for (const country of countries) {
      const extraCountry = Country.getCountryByCode(country.iso2);
      if (extraCountry) {
        await prisma.country.create({
          data: {
            name: country.name,
            isoCode: country.iso2,
            isoCode3: country.iso3,
            phonePrefix: extraCountry.phonecode,
            flag: extraCountry.flag,
            latitude: parseFloat(extraCountry.latitude),
            longitude: parseFloat(extraCountry.longitude),
            currency: {
              connect: { code: country.currencyCode } // Connect by unique 'code'
            },
            continent: {
              connect: { name: country.continent } // Connect by unique 'name'
            }
          }
        });
      } else {
        console.log(`${country.iso2} not found`);
      }
      count++;
      console.log(`Seeded ${count} / ${totalCountries} countries`);
    }
    console.log(`✅ Seeded ${countries.length} countries`);

    console.log('🎉 Comprehensive global seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
