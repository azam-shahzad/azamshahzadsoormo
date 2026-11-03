export type BodyType = 'Coach' | 'City bus' | 'Intercity' | 'Minibus' | 'Double-decker';
export type Fuel = 'Diesel' | 'Electric' | 'Hybrid' | 'CNG' | 'Hydrogen';
export type Emission = 'Euro 6e' | 'Euro 6' | 'Euro 5' | 'Zero emission';
export type Gearbox = 'Automatic' | 'Automated manual' | 'Manual';
export type Condition = 'New' | 'Ex-demo' | 'Used';

export type Seller = {
  id: string;
  name: string;
  type: 'Dealer' | 'Operator' | 'Manufacturer';
  city: string;
  country: string;
  rating: number;
  reviews: number;
  responseHours: number;
  memberSince: number;
  verified: boolean;
  initials: string;
};

export type Bus = {
  id: string;
  make: string;
  model: string;
  variant: string;
  body: BodyType;
  fuel: Fuel;
  emission: Emission;
  condition: Condition;
  year: number;
  firstRegistration: string;
  mileageKm: number;
  seats: number;
  standing: number;
  lengthM: number;
  powerKw: number;
  gearbox: Gearbox;
  wheelchair: boolean;
  /** Net price in EUR, excluding VAT. */
  priceNet: number;
  vatDeductible: boolean;
  country: string;
  countryCode: string;
  city: string;
  sellerId: string;
  /** Livery colour for the illustration. */
  livery: string;
  featured?: boolean;
  listedDaysAgo: number;
  views: number;
  batteryKwh?: number;
  rangeKm?: number;
  features: string[];
  description: string;
};

export const sellers: Seller[] = [
  { id: 'rheinbus', name: 'Rhein Bus & Coach GmbH', type: 'Dealer', city: 'Düsseldorf', country: 'Germany', rating: 4.9, reviews: 212, responseHours: 2, memberSince: 2014, verified: true, initials: 'RB' },
  { id: 'nordfleet', name: 'NordFleet Trading AB', type: 'Dealer', city: 'Gothenburg', country: 'Sweden', rating: 4.8, reviews: 138, responseHours: 3, memberSince: 2016, verified: true, initials: 'NF' },
  { id: 'polcoach', name: 'PolCoach Sp. z o.o.', type: 'Dealer', city: 'Poznań', country: 'Poland', rating: 4.7, reviews: 96, responseHours: 4, memberSince: 2018, verified: true, initials: 'PC' },
  { id: 'lowlands', name: 'Lowlands Transit B.V.', type: 'Operator', city: 'Utrecht', country: 'Netherlands', rating: 4.6, reviews: 41, responseHours: 6, memberSince: 2019, verified: true, initials: 'LT' },
  { id: 'alpine', name: 'Alpine Reisebus Handel', type: 'Dealer', city: 'Salzburg', country: 'Austria', rating: 4.9, reviews: 74, responseHours: 2, memberSince: 2015, verified: true, initials: 'AR' },
  { id: 'iberia', name: 'Iberia Autocares S.L.', type: 'Operator', city: 'Valencia', country: 'Spain', rating: 4.5, reviews: 28, responseHours: 8, memberSince: 2021, verified: false, initials: 'IA' },
  { id: 'lyonnaise', name: 'Lyonnaise Véhicules Collectifs', type: 'Dealer', city: 'Lyon', country: 'France', rating: 4.7, reviews: 63, responseHours: 5, memberSince: 2017, verified: true, initials: 'LV' },
];

const b = (bus: Bus) => bus;

export const buses: Bus[] = [
  b({ id: 'FM-24871', make: 'Setra', model: 'S 516 HD', variant: 'TopClass edition', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6e', condition: 'Ex-demo', year: 2024, firstRegistration: '03/2024', mileageKm: 18400, seats: 51, standing: 0, lengthM: 12.5, powerKw: 335, gearbox: 'Automated manual', wheelchair: true, priceNet: 389000, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#1f2a44', featured: true, listedDaysAgo: 2, views: 1840, features: ['Active Brake Assist 6', 'Sideguard Assist', 'Rear lounge', 'Galley with coffee machine', 'Onboard WC', 'USB-C at every seat', '3-point seat belts', 'Climate control'], description: 'Factory demonstrator in TopClass trim, maintained exclusively at an authorised workshop. Full service history, remaining manufacturer warranty until 03/2026, ready for immediate registration across the EU.' }),
  b({ id: 'FM-24790', make: 'Mercedes-Benz', model: 'Tourismo', variant: 'RHD 15', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2019, firstRegistration: '05/2019', mileageKm: 412000, seats: 49, standing: 0, lengthM: 12.1, powerKw: 315, gearbox: 'Automated manual', wheelchair: false, priceNet: 164500, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#e8e6df', featured: true, listedDaysAgo: 5, views: 2210, features: ['Retarder', 'Fridge', 'Onboard WC', 'Cruise control', 'Tachograph DTCO 4.0', 'Reclining seats'], description: 'Fleet-maintained touring coach from a single operator. New tyres on all axles, fresh TÜV inspection and documented gearbox service at 400,000 km.' }),
  b({ id: 'FM-24755', make: 'Solaris', model: 'Urbino 12', variant: 'electric', body: 'City bus', fuel: 'Electric', emission: 'Zero emission', condition: 'Used', year: 2021, firstRegistration: '09/2021', mileageKm: 96500, seats: 31, standing: 54, lengthM: 12, powerKw: 250, gearbox: 'Automatic', wheelchair: true, priceNet: 312000, vatDeductible: true, country: 'Poland', countryCode: 'PL', city: 'Poznań', sellerId: 'polcoach', livery: '#2f7d6d', featured: true, listedDaysAgo: 1, views: 3120, batteryKwh: 470, rangeKm: 280, features: ['Pantograph charging', 'CCS plug-in', 'Heat pump HVAC', 'Passenger counting', 'Kneeling', 'CCTV 6 cameras'], description: 'Battery state of health certified at 94%. Supplied with depot charger integration documents and full telematics export. Ideal for low-emission zone tenders.' }),
  b({ id: 'FM-24702', make: 'MAN', model: "Lion's Coach", variant: 'C 13.8 m', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2018, firstRegistration: '02/2018', mileageKm: 538000, seats: 57, standing: 0, lengthM: 13.4, powerKw: 338, gearbox: 'Automated manual', wheelchair: false, priceNet: 128900, vatDeductible: true, country: 'Austria', countryCode: 'AT', city: 'Salzburg', sellerId: 'alpine', livery: '#7a1f2b', listedDaysAgo: 9, views: 980, features: ['TipMatic', 'Lane Guard', 'Onboard WC', 'Kitchenette', 'Panorama glass'], description: 'Three-axle long-distance coach from an Alpine tour operator. Interior refurbished in 2023 with new upholstery and LED lighting.' }),
  b({ id: 'FM-24688', make: 'Mercedes-Benz', model: 'eCitaro', variant: 'G articulated', body: 'City bus', fuel: 'Electric', emission: 'Zero emission', condition: 'New', year: 2025, firstRegistration: '—', mileageKm: 120, seats: 46, standing: 99, lengthM: 18.1, powerKw: 320, gearbox: 'Automatic', wheelchair: true, priceNet: 659000, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#d9dee6', featured: true, listedDaysAgo: 3, views: 1430, batteryKwh: 588, rangeKm: 320, features: ['Solid-state battery', 'Preventive Brake Assist', 'Sideguard Assist', 'Four doors', 'Dynamic route display'], description: 'Brand-new articulated eCitaro from stock, available for delivery within 6 weeks. Manufacturer warranty and battery warranty included.' }),
  b({ id: 'FM-24650', make: 'Iveco', model: 'Crossway', variant: 'Line 12', body: 'Intercity', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2017, firstRegistration: '07/2017', mileageKm: 486000, seats: 53, standing: 28, lengthM: 12, powerKw: 265, gearbox: 'Automatic', wheelchair: true, priceNet: 69500, vatDeductible: true, country: 'France', countryCode: 'FR', city: 'Lyon', sellerId: 'lyonnaise', livery: '#f3f1ec', listedDaysAgo: 12, views: 760, features: ['Wheelchair lift', 'Ticket machine prep', 'Air conditioning', 'Retarder'], description: 'School and regional line vehicle, full maintenance records. Ten units of the same specification available — fleet discount on request.' }),
  b({ id: 'FM-24611', make: 'Volvo', model: '7900', variant: 'Electric', body: 'City bus', fuel: 'Electric', emission: 'Zero emission', condition: 'Used', year: 2020, firstRegistration: '11/2020', mileageKm: 142000, seats: 34, standing: 56, lengthM: 12, powerKw: 200, gearbox: 'Automatic', wheelchair: true, priceNet: 238000, vatDeductible: true, country: 'Sweden', countryCode: 'SE', city: 'Gothenburg', sellerId: 'nordfleet', livery: '#24497a', listedDaysAgo: 4, views: 1290, batteryKwh: 396, rangeKm: 250, features: ['OppCharge', 'Zone Management', 'Low floor', 'Electric heating', 'USB charging'], description: 'Operated in Nordic winter conditions with documented battery performance. Includes spare parts package and driver training materials.' }),
  b({ id: 'FM-24598', make: 'VDL', model: 'Futura', variant: 'FHD2-129', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2016, firstRegistration: '04/2016', mileageKm: 601000, seats: 53, standing: 0, lengthM: 12.9, powerKw: 375, gearbox: 'Automated manual', wheelchair: false, priceNet: 98000, vatDeductible: true, country: 'Netherlands', countryCode: 'NL', city: 'Utrecht', sellerId: 'lowlands', livery: '#111827', listedDaysAgo: 16, views: 640, features: ['ZF Intarder', 'Onboard WC', 'Fridge', 'DVD system', 'Adaptive cruise'], description: 'Well-kept FHD2 from a Dutch charter operator. Engine overhauled in 2022, invoices available.' }),
  b({ id: 'FM-24577', make: 'Mercedes-Benz', model: 'Sprinter', variant: '516 City 35', body: 'Minibus', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2021, firstRegistration: '06/2021', mileageKm: 124000, seats: 19, standing: 13, lengthM: 7.4, powerKw: 120, gearbox: 'Automatic', wheelchair: true, priceNet: 67900, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#f4f4f2', listedDaysAgo: 7, views: 1510, features: ['Ramp', 'Low entry', 'Air conditioning', 'Destination display'], description: 'Low-entry city minibus, ideal for on-demand and community transport. One owner, dealer-serviced.' }),
  b({ id: 'FM-24533', make: 'Irizar', model: 'i6', variant: 'Integral 13.2', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2019, firstRegistration: '03/2019', mileageKm: 389000, seats: 55, standing: 0, lengthM: 13.2, powerKw: 338, gearbox: 'Automated manual', wheelchair: false, priceNet: 172000, vatDeductible: true, country: 'Spain', countryCode: 'ES', city: 'Valencia', sellerId: 'iberia', livery: '#c8c2b4', listedDaysAgo: 6, views: 870, features: ['Onboard WC', 'Wi-Fi router', 'Reclining seats', 'Fridge', 'Driver fatigue monitor'], description: 'Premium touring coach with Wi-Fi and full entertainment package. Recently inspected, Spanish ITV valid until 2026.' }),
  b({ id: 'FM-24501', make: 'Neoplan', model: 'Skyliner', variant: 'P06', body: 'Double-decker', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2017, firstRegistration: '08/2017', mileageKm: 512000, seats: 83, standing: 0, lengthM: 14, powerKw: 375, gearbox: 'Automated manual', wheelchair: false, priceNet: 249000, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#3b3f46', featured: true, listedDaysAgo: 8, views: 1980, features: ['Two staircases', 'Onboard WC', 'Kitchen', 'Panorama roof', 'Lounge'], description: 'Iconic double-deck coach in executive configuration. Perfect for long-distance scheduled services or premium tourism.' }),
  b({ id: 'FM-24477', make: 'Scania', model: 'Touring', variant: 'HD 13.7', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2017, firstRegistration: '01/2017', mileageKm: 574000, seats: 59, standing: 0, lengthM: 13.7, powerKw: 302, gearbox: 'Automated manual', wheelchair: false, priceNet: 92500, vatDeductible: true, country: 'Sweden', countryCode: 'SE', city: 'Gothenburg', sellerId: 'nordfleet', livery: '#9a6b2f', listedDaysAgo: 18, views: 520, features: ['Opticruise', 'Onboard WC', 'Fridge', 'Retarder', 'Heated windscreen'], description: 'Three-axle Touring with a strong maintenance record and Nordic winter package.' }),
  b({ id: 'FM-24452', make: 'Ebusco', model: '2.2', variant: 'LF 12', body: 'City bus', fuel: 'Electric', emission: 'Zero emission', condition: 'Used', year: 2021, firstRegistration: '02/2021', mileageKm: 118000, seats: 36, standing: 52, lengthM: 12, powerKw: 250, gearbox: 'Automatic', wheelchair: true, priceNet: 276000, vatDeductible: true, country: 'Netherlands', countryCode: 'NL', city: 'Utrecht', sellerId: 'lowlands', livery: '#3d8bd9', listedDaysAgo: 3, views: 1170, batteryKwh: 363, rangeKm: 300, features: ['Plug-in charging', 'Lightweight composite body', 'Low floor', 'Real-time info'], description: 'Zero-emission city bus from a regional concession. Battery health report and charger compatibility list included.' }),
  b({ id: 'FM-24430', make: 'MAN', model: "Lion's City", variant: '18 G hybrid', body: 'City bus', fuel: 'Hybrid', emission: 'Euro 6', condition: 'Used', year: 2019, firstRegistration: '10/2019', mileageKm: 301000, seats: 45, standing: 105, lengthM: 18, powerKw: 265, gearbox: 'Automatic', wheelchair: true, priceNet: 139000, vatDeductible: true, country: 'Austria', countryCode: 'AT', city: 'Salzburg', sellerId: 'alpine', livery: '#c0392b', listedDaysAgo: 11, views: 690, features: ['EfficientHybrid', 'Four doors', 'Air conditioning', 'Passenger counting'], description: 'Articulated mild-hybrid city bus, fuel savings documented by operator telematics.' }),
  b({ id: 'FM-24418', make: 'Iveco', model: 'Urbanway', variant: '12 CNG', body: 'City bus', fuel: 'CNG', emission: 'Euro 6', condition: 'Used', year: 2018, firstRegistration: '05/2018', mileageKm: 352000, seats: 29, standing: 70, lengthM: 12, powerKw: 213, gearbox: 'Automatic', wheelchair: true, priceNet: 74000, vatDeductible: true, country: 'France', countryCode: 'FR', city: 'Lyon', sellerId: 'lyonnaise', livery: '#6b8e23', listedDaysAgo: 14, views: 410, features: ['Roof-mounted CNG tanks', 'Low floor', 'Ramp', 'Air conditioning'], description: 'CNG city bus with recent tank certification (valid until 2028).' }),
  b({ id: 'FM-24396', make: 'Volvo', model: '9700', variant: 'DD', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2018, firstRegistration: '06/2018', mileageKm: 455000, seats: 53, standing: 0, lengthM: 13.1, powerKw: 338, gearbox: 'Automated manual', wheelchair: false, priceNet: 154000, vatDeductible: true, country: 'Sweden', countryCode: 'SE', city: 'Gothenburg', sellerId: 'nordfleet', livery: '#e3e1db', listedDaysAgo: 10, views: 830, features: ['I-Shift', 'Onboard WC', 'Wi-Fi', 'USB charging', 'Fridge'], description: 'Comfortable 9700 with low running costs; complete Volvo dealer history.' }),
  b({ id: 'FM-24371', make: 'Otokar', model: 'Navigo', variant: 'T', body: 'Minibus', fuel: 'Diesel', emission: 'Euro 6', condition: 'Ex-demo', year: 2023, firstRegistration: '04/2023', mileageKm: 21000, seats: 31, standing: 0, lengthM: 8.6, powerKw: 140, gearbox: 'Automatic', wheelchair: false, priceNet: 118000, vatDeductible: true, country: 'Poland', countryCode: 'PL', city: 'Poznań', sellerId: 'polcoach', livery: '#f0ede6', listedDaysAgo: 5, views: 560, features: ['Reclining seats', 'Luggage racks', 'Air conditioning', 'Reversing camera'], description: 'Compact midi coach for school, shuttle and small group tours. Demonstrator with remaining warranty.' }),
  b({ id: 'FM-24350', make: 'Setra', model: 'S 431 DT', variant: 'TopClass', body: 'Double-decker', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2016, firstRegistration: '09/2016', mileageKm: 628000, seats: 79, standing: 0, lengthM: 14, powerKw: 375, gearbox: 'Automated manual', wheelchair: false, priceNet: 189000, vatDeductible: true, country: 'Austria', countryCode: 'AT', city: 'Salzburg', sellerId: 'alpine', livery: '#2c3e50', listedDaysAgo: 21, views: 720, features: ['Onboard WC', 'Kitchen', 'Two staircases', 'Seat belts'], description: 'Double-deck TopClass in good mechanical condition, interior upgraded in 2021.' }),
  b({ id: 'FM-24322', make: 'Solaris', model: 'Urbino 12', variant: 'hydrogen', body: 'City bus', fuel: 'Hydrogen', emission: 'Zero emission', condition: 'Ex-demo', year: 2023, firstRegistration: '06/2023', mileageKm: 34000, seats: 33, standing: 54, lengthM: 12, powerKw: 250, gearbox: 'Automatic', wheelchair: true, priceNet: 548000, vatDeductible: true, country: 'Poland', countryCode: 'PL', city: 'Poznań', sellerId: 'polcoach', livery: '#2a9d8f', featured: true, listedDaysAgo: 2, views: 2050, rangeKm: 350, features: ['70 kW fuel cell', '37.5 kg H₂ storage', 'Heat pump', 'Low floor', 'CCTV'], description: 'Hydrogen fuel-cell demonstrator, eligible for EU clean-vehicle funding schemes. Tank inspection valid until 2033.' }),
  b({ id: 'FM-24301', make: 'Mercedes-Benz', model: 'Intouro', variant: 'M', body: 'Intercity', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2020, firstRegistration: '08/2020', mileageKm: 268000, seats: 57, standing: 30, lengthM: 12.8, powerKw: 260, gearbox: 'Automatic', wheelchair: true, priceNet: 121000, vatDeductible: true, country: 'Germany', countryCode: 'DE', city: 'Düsseldorf', sellerId: 'rheinbus', livery: '#f2c14e', listedDaysAgo: 6, views: 940, features: ['Lift at door 2', 'Ticket machine prep', 'Air conditioning', 'Retarder'], description: 'Versatile intercity bus for regional lines and school transport, complete service history.' }),
  b({ id: 'FM-24288', make: 'Temsa', model: 'HD 13', variant: '', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2019, firstRegistration: '02/2019', mileageKm: 344000, seats: 57, standing: 0, lengthM: 13, powerKw: 360, gearbox: 'Automated manual', wheelchair: false, priceNet: 119500, vatDeductible: true, country: 'Spain', countryCode: 'ES', city: 'Valencia', sellerId: 'iberia', livery: '#8e9aaf', listedDaysAgo: 13, views: 450, features: ['Onboard WC', 'Fridge', 'Reclining seats', 'Retarder'], description: 'Excellent value three-axle coach with low fuel consumption, ITV recently passed.' }),
  b({ id: 'FM-24265', make: 'Van Hool', model: 'TX16', variant: 'Astron', body: 'Coach', fuel: 'Diesel', emission: 'Euro 6', condition: 'Used', year: 2015, firstRegistration: '05/2015', mileageKm: 702000, seats: 57, standing: 0, lengthM: 13.1, powerKw: 375, gearbox: 'Automated manual', wheelchair: false, priceNet: 74900, vatDeductible: false, country: 'Netherlands', countryCode: 'NL', city: 'Utrecht', sellerId: 'lowlands', livery: '#5b2a86', listedDaysAgo: 26, views: 390, features: ['Onboard WC', 'Kitchen', 'Retarder', 'Seat belts'], description: 'High-deck Astron, sold under the margin scheme (VAT not deductible).' }),
  b({ id: 'FM-24240', make: 'Iveco', model: 'Daily', variant: 'Line 22+1', body: 'Minibus', fuel: 'Diesel', emission: 'Euro 6e', condition: 'New', year: 2025, firstRegistration: '—', mileageKm: 15, seats: 22, standing: 0, lengthM: 7.1, powerKw: 132, gearbox: 'Automatic', wheelchair: false, priceNet: 96500, vatDeductible: true, country: 'France', countryCode: 'FR', city: 'Lyon', sellerId: 'lyonnaise', livery: '#ffffff', listedDaysAgo: 1, views: 310, features: ['Hi-Matic gearbox', 'Reclining seats', 'Air conditioning', 'USB-C sockets'], description: 'New 22-seat minibus from stock, configurable livery and seat fabric before delivery.' }),
  b({ id: 'FM-24219', make: 'VDL', model: 'Citea', variant: 'LLE-120 electric', body: 'City bus', fuel: 'Electric', emission: 'Zero emission', condition: 'Used', year: 2019, firstRegistration: '12/2019', mileageKm: 201000, seats: 37, standing: 48, lengthM: 12, powerKw: 210, gearbox: 'Automatic', wheelchair: true, priceNet: 189000, vatDeductible: true, country: 'Netherlands', countryCode: 'NL', city: 'Utrecht', sellerId: 'lowlands', livery: '#e76f51', listedDaysAgo: 9, views: 880, batteryKwh: 315, rangeKm: 220, features: ['Pantograph', 'Low entry', 'Air conditioning', 'Real-time info'], description: 'Electric low-entry bus from the Dutch concession market; battery SoH 89%.' }),
];

export const sellerById = (id: string) => sellers.find((s) => s.id === id)!;
export const busById = (id: string) => buses.find((x) => x.id === id);

export const bodyTypes: BodyType[] = ['Coach', 'City bus', 'Intercity', 'Minibus', 'Double-decker'];
export const fuels: Fuel[] = ['Diesel', 'Electric', 'Hybrid', 'CNG', 'Hydrogen'];
export const emissions: Emission[] = ['Zero emission', 'Euro 6e', 'Euro 6', 'Euro 5'];
export const makes = Array.from(new Set(buses.map((x) => x.make))).sort();
export const countries = Array.from(new Set(buses.map((x) => x.country))).sort();

export const busTitle = (bus: Bus) => `${bus.make} ${bus.model}${bus.variant ? ` ${bus.variant}` : ''}`;
