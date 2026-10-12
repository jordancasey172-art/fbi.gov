export type WantedPerson = {
  id: string;
  name: string;
  alias: string[];
  category: "ten" | "terror" | "cyber" | "white-collar" | "violent" | "missing";
  crime: string;
  reward: string;
  rewardValue: number;
  dob: string;
  pob: string;
  height: string;
  weight: string;
  hair: string;
  eyes: string;
  image: string;
  description: string;
  warning: string;
  fieldOffice: string;
  posterDate: string;
  status: string;
};

export const HERO_IMAGE =
  "https://images.pexels.com/photos/7453790/pexels-photo-7453790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const HQ_IMAGE =
  "https://images.pexels.com/photos/9567234/pexels-photo-9567234.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const EVIDENCE_IMAGE =
  "https://images.pexels.com/photos/8369512/pexels-photo-8369512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const INTERROGATION_IMAGE =
  "https://images.pexels.com/photos/6069240/pexels-photo-6069240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const FINGERPRINT_IMAGE =
  "https://images.pexels.com/photos/8369513/pexels-photo-8369513.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const BOARD_IMAGE =
  "https://images.pexels.com/photos/8371702/pexels-photo-8371702.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const DOCS_IMAGE =
  "https://images.pexels.com/photos/6069510/pexels-photo-6069510.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const FORENSIC_IMAGE =
  "https://images.pexels.com/photos/6065129/pexels-photo-6065129.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

/* ---------- OFFICIAL REPORTING CHANNELS ---------- */

export const IC3 = {
  name: "Internet Crime Complaint Center",
  short: "IC3",
  url: "https://internetcrimecomplaintcenter.vercel.app",
  host: "internetcrimecomplaintcenter.vercel.app",
  tagline: "The nation's central hub for reporting internet-enabled crime.",
  since: 2000,
  stats: [
    { value: "8.6M+", label: "Complaints Received" },
    { value: "$16.6B", label: "Reported Losses (2023)" },
    { value: "24/7", label: "Intake Availability" },
    { value: "18K+", label: "Partner Agencies" },
  ],
};

export const AGENT_LINE = {
  display: "+1 561-973-0575",
  tel: "+15619730575",
  sms: "+15619730575",
  label: "Special Agent Direct Line",
  hours: "Voice & SMS • Immediate response channel",
};

export const REPORT_TIMELINE = [
  {
    step: "01",
    title: "You File",
    desc: "Submit through the IC3 portal or call/text the Special Agent direct line. Keep transaction IDs, wallet addresses, and screenshots.",
    accent: "#B22234",
  },
  {
    step: "02",
    title: "Intake & Reference",
    desc: "Your complaint is validated, assigned a tracking reference, and screened for immediate-threat indicators such as sextortion or ransomware.",
    accent: "#C49A3C",
  },
  {
    step: "03",
    title: "Analysis & Fusion",
    desc: "IC3 analysts link your report to related complaints, tracing funds across exchanges and identifying common infrastructure.",
    accent: "#12325B",
  },
  {
    step: "04",
    title: "Referral to Field Division",
    desc: "The case is referred to the responsible FBI field office, local law enforcement, or a federal partner for investigative action.",
    accent: "#0B1F3A",
  },
];

export const WANTED: WantedPerson[] = [
  {
    id: "marcus-hale",
    name: "MARCUS DEAN HALE",
    alias: ["Ghost", "M. Holloway", "Dean Mercer"],
    category: "ten",
    crime: "Armed Bank Robbery; Murder of a Federal Witness",
    reward: "Up to $250,000",
    rewardValue: 250000,
    dob: "March 14, 1981",
    pob: "Gary, Indiana",
    height: "6'1\"",
    weight: "195 pounds",
    hair: "Brown",
    eyes: "Hazel",
    image:
      "https://images.pexels.com/photos/25473793/pexels-photo-25473793.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Hale is wanted for his alleged involvement in a 2023 armored car robbery in Chicago, Illinois, during which a federal witness was fatally shot. He is considered extremely dangerous and is believed to be traveling with altered identification through the Midwest and Southwest.",
    warning: "CONSIDERED ARMED AND EXTREMELY DANGEROUS",
    fieldOffice: "Chicago",
    posterDate: "June 11, 2024",
    status: "Fugitive",
  },
  {
    id: "victor-kessler",
    name: "VIKTOR ANTON KESSLER",
    alias: ["V. Kessler", "Anton Volkov"],
    category: "ten",
    crime: "Cyber Intrusion; Ransomware Extortion — Critical Infrastructure",
    reward: "Up to $500,000",
    rewardValue: 500000,
    dob: "November 2, 1988",
    pob: "Riga, Latvia",
    height: "5'11\"",
    weight: "175 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/13429585/pexels-photo-13429585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Kessler allegedly led the 'BlackLedger' ransomware affiliate that encrypted hospital systems across 14 states in 2025, demanding $12M in cryptocurrency. A federal grand jury indicted him on 18 counts of computer fraud, extortion, and money laundering.",
    warning: "CYBER FUGITIVE — MAY BE ABROAD",
    fieldOffice: "Pittsburgh",
    posterDate: "February 3, 2025",
    status: "Fugitive",
  },
  {
    id: "samuel-okafor",
    name: "SAMUEL EZE OKAFOR",
    alias: ["Sam Okafor", "Big Sam", "E. Johnson"],
    category: "ten",
    crime: "Wire Fraud; Business Email Compromise ($46M Scheme)",
    reward: "Up to $100,000",
    rewardValue: 100000,
    dob: "July 19, 1979",
    pob: "Lagos, Nigeria",
    height: "6'2\"",
    weight: "210 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/36403514/pexels-photo-36403514.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Okafor allegedly orchestrated a transnational business email compromise ring targeting school districts and construction firms. Losses exceed $46 million. He fled the U.S. in 2022 and was last seen in Houston, Texas.",
    warning: "FLED TO AVOID PROSECUTION",
    fieldOffice: "Houston",
    posterDate: "September 27, 2023",
    status: "Fugitive",
  },
  {
    id: "elena-vasquez",
    name: "ELENA MARISOL VASQUEZ",
    alias: ["La Contadora", "Elena Mora"],
    category: "ten",
    crime: "Drug Trafficking Conspiracy; Money Laundering",
    reward: "Up to $150,000",
    rewardValue: 150000,
    dob: "April 30, 1986",
    pob: "Culiacán, Mexico",
    height: "5'5\"",
    weight: "135 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/36378236/pexels-photo-36378236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Vasquez allegedly served as chief money launderer for a cartel cell operating in Phoenix and Tucson, moving over $80M through shell real estate companies. She is fluent in English and Spanish and may wear wigs to alter her appearance.",
    warning: "SHOULD BE CONSIDERED DANGEROUS",
    fieldOffice: "Phoenix",
    posterDate: "January 15, 2025",
    status: "Fugitive",
  },
  {
    id: "james-corrigan",
    name: "JAMES PATRICK CORRIGAN",
    alias: ["Jim Corrigan", "Pat Doyle"],
    category: "violent",
    crime: "First Degree Murder; Unlawful Flight to Avoid Prosecution",
    reward: "Up to $50,000",
    rewardValue: 50000,
    dob: "December 8, 1969",
    pob: "Boston, Massachusetts",
    height: "5'10\"",
    weight: "200 pounds",
    hair: "Gray",
    eyes: "Blue",
    image:
      "https://images.pexels.com/photos/35466969/pexels-photo-35466969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Corrigan is wanted for the 2019 shooting deaths of two business partners in South Boston. He abandoned his vehicle near Logan Airport and has ties to Ireland and Canada. He is an avid fisherman and may be working on commercial vessels.",
    warning: "CONSIDERED ARMED AND DANGEROUS",
    fieldOffice: "Boston",
    posterDate: "May 2, 2023",
    status: "Fugitive",
  },
  {
    id: "darius-cole",
    name: "DARIUS LAMONT COLE",
    alias: ["D. Cole", "Little D"],
    category: "violent",
    crime: "Kidnapping; Interstate Transportation for Criminal Activity",
    reward: "Up to $75,000",
    rewardValue: 75000,
    dob: "February 22, 1992",
    pob: "Atlanta, Georgia",
    height: "6'0\"",
    weight: "185 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/30124372/pexels-photo-30124372.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Cole allegedly abducted a business owner for ransom in Atlanta in 2024 and transported the victim across state lines. He has a tattoo of a crown on his right forearm and a scar above his left eyebrow.",
    warning: "CONSIDERED DANGEROUS — DO NOT APPROACH",
    fieldOffice: "Atlanta",
    posterDate: "August 19, 2024",
    status: "Fugitive",
  },
  {
    id: "thomas-reyes",
    name: "THOMAS ALEXANDER REYES",
    alias: ["Tommy Reyes", "Alex Rios"],
    category: "white-collar",
    crime: "Securities Fraud; Ponzi Scheme ($210M Investor Losses)",
    reward: "Up to $100,000",
    rewardValue: 100000,
    dob: "October 5, 1975",
    pob: "Miami, Florida",
    height: "5'9\"",
    weight: "170 pounds",
    hair: "Brown",
    eyes: "Green",
    image:
      "https://images.pexels.com/photos/14090509/pexels-photo-14090509.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Reyes allegedly ran 'SunVista Capital,' a fraudulent real estate fund that promised 18% returns. Over 900 retirees lost savings totaling $210M. He fled on a private vessel and may be in the Caribbean or Central America.",
    warning: "FLED TO AVOID PROSECUTION",
    fieldOffice: "Miami",
    posterDate: "November 12, 2024",
    status: "Fugitive",
  },
  {
    id: "nathan-blackwood",
    name: "NATHANIEL J. BLACKWOOD",
    alias: ["Nate Black", "J. Winters"],
    category: "terror",
    crime: "Material Support to a Foreign Terrorist Organization",
    reward: "Up to $200,000",
    rewardValue: 200000,
    dob: "June 17, 1990",
    pob: "Minneapolis, Minnesota",
    height: "6'3\"",
    weight: "190 pounds",
    hair: "Brown",
    eyes: "Blue",
    image:
      "https://images.pexels.com/photos/11805711/pexels-photo-11805711.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Blackwood allegedly attempted to travel overseas to join a designated terrorist organization and recruited others online. He has military training and expertise in encrypted communications. If seen, do not approach — call 911 immediately.",
    warning: "TERRORISM — DO NOT APPROACH, CALL 911",
    fieldOffice: "Minneapolis",
    posterDate: "March 4, 2025",
    status: "Fugitive",
  },
  {
    id: "sarah-lindqvist",
    name: "SARAH ANN LINDQVIST",
    alias: ["Sarah Miller", "Ann Larsen"],
    category: "cyber",
    crime: "Theft of Trade Secrets; Economic Espionage",
    reward: "Up to $75,000",
    rewardValue: 75000,
    dob: "September 9, 1984",
    pob: "Seattle, Washington",
    height: "5'7\"",
    weight: "140 pounds",
    hair: "Blonde",
    eyes: "Blue",
    image:
      "https://images.pexels.com/photos/8076183/pexels-photo-8076183.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Lindqvist, a former aerospace engineer, allegedly stole proprietary propulsion designs and attempted to sell them to a foreign government. She was last seen in San Francisco and is highly educated in physics and Mandarin.",
    warning: "FUGITIVE — ECONOMIC ESPIONAGE",
    fieldOffice: "Seattle",
    posterDate: "July 22, 2025",
    status: "Fugitive",
  },
  {
    id: "robert-delaney",
    name: "ROBERT SEAN DELANEY",
    alias: ["Bobby D", "Sean Roberts"],
    category: "missing",
    crime: "Parental Kidnapping; International Child Abduction",
    reward: "Up to $25,000",
    rewardValue: 25000,
    dob: "May 25, 1982",
    pob: "Denver, Colorado",
    height: "5'11\"",
    weight: "180 pounds",
    hair: "Reddish Brown",
    eyes: "Hazel",
    image:
      "https://images.pexels.com/photos/7597466/pexels-photo-7597466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Delaney allegedly abducted his two minor children in violation of a custody order and fled the country in 2024. The children, ages 6 and 8, are believed to be with him and in good health. He may be working as an English teacher abroad.",
    warning: "SEEKING INFORMATION — CHILDREN MAY BE WITH SUBJECT",
    fieldOffice: "Denver",
    posterDate: "April 8, 2025",
    status: "Fugitive",
  },
  {
    id: "maria-santos",
    name: "MARIA TERESA SANTOS",
    alias: ["Teresa Cruz", "M. Delgado"],
    category: "white-collar",
    crime: "Health Care Fraud; $38M Medicare Scheme",
    reward: "Up to $50,000",
    rewardValue: 50000,
    dob: "January 12, 1972",
    pob: "San Juan, Puerto Rico",
    height: "5'4\"",
    weight: "150 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/8727507/pexels-photo-8727507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Santos allegedly billed Medicare for durable medical equipment never provided through 14 shell clinics in Florida and Texas. She fled after a co-conspirator's arrest and is believed to be in the Dominican Republic.",
    warning: "FLED TO AVOID PROSECUTION",
    fieldOffice: "Tampa",
    posterDate: "October 1, 2025",
    status: "Fugitive",
  },
  {
    id: "david-chen",
    name: "DAVID WEI CHEN",
    alias: ["Wei Chen", "D. Chow"],
    category: "cyber",
    crime: "Cryptocurrency Investment Fraud; Pig Butchering Network",
    reward: "Up to $125,000",
    rewardValue: 125000,
    dob: "August 3, 1991",
    pob: "Flushing, New York",
    height: "5'8\"",
    weight: "160 pounds",
    hair: "Black",
    eyes: "Brown",
    image:
      "https://images.pexels.com/photos/3234369/pexels-photo-3234369.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description:
      "Chen allegedly operated call centers that defrauded U.S. victims of over $90M through fake crypto platforms advertised on social media. Victims were groomed for months before funds were stolen. He favors luxury vehicles and high-rise condos.",
    warning: "TRANSNATIONAL FRAUD — MAY BE TRAVELING",
    fieldOffice: "New York",
    posterDate: "September 15, 2025",
    status: "Fugitive",
  },
];

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  office: string;
  image: string;
  readTime: string;
  featured?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "FBI and Partners Dismantle Major Ransomware Network in Operation Silent Ledger",
    excerpt:
      "A coordinated international operation seized 42 servers and $8.7 million in cryptocurrency, disrupting a ransomware affiliate responsible for attacks on hospitals, schools, and local governments.",
    category: "National Press Release",
    date: "October 8, 2026",
    office: "FBI Headquarters",
    image:
      "https://images.pexels.com/photos/6069240/pexels-photo-6069240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "4 min read",
    featured: true,
  },
  {
    id: "n2",
    title: "Ten Most Wanted Fugitive Added After $46 Million Business Email Compromise Scheme",
    excerpt:
      "The FBI has added a new fugitive to its Ten Most Wanted list in connection with a transnational fraud ring that targeted school districts across the Midwest.",
    category: "Most Wanted",
    date: "October 6, 2026",
    office: "Houston",
    image:
      "https://images.pexels.com/photos/8369512/pexels-photo-8369512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "3 min read",
  },
  {
    id: "n3",
    title: "Hate Crime Statistics 2025: FBI Releases Annual Report via Crime Data Explorer",
    excerpt:
      "The latest Uniform Crime Reporting data shows trends in bias-motivated incidents reported by more than 18,000 law enforcement agencies nationwide.",
    category: "Reports",
    date: "October 2, 2026",
    office: "CJIS Division",
    image:
      "https://images.pexels.com/photos/8370967/pexels-photo-8370967.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "6 min read",
  },
  {
    id: "n4",
    title: "FBI Warns of Surge in Elder Fraud: Losses Top $3.4 Billion in Latest IC3 Report",
    excerpt:
      "Criminals are increasingly using AI voice cloning and romance scams to target Americans over 60. The FBI shares red flags and how to report.",
    category: "Scams & Safety",
    date: "September 28, 2026",
    office: "IC3",
    image:
      "https://images.pexels.com/photos/8382083/pexels-photo-8382083.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "5 min read",
  },
  {
    id: "n5",
    title: "Joint Task Force Recovers 37 Missing Children in Operation Safe Haven",
    excerpt:
      "Over a two-week operation spanning five states, FBI Child Exploitation Task Forces located missing juveniles and made 12 arrests.",
    category: "Violent Crime",
    date: "September 24, 2026",
    office: "Atlanta",
    image:
      "https://images.pexels.com/photos/6069510/pexels-photo-6069510.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "4 min read",
  },
  {
    id: "n6",
    title: "Director's Remarks at the International Association of Chiefs of Police Conference",
    excerpt:
      "Read the Director's full remarks on partnerships, technology, and the FBI's commitment to protecting civil liberties while keeping communities safe.",
    category: "Speeches",
    date: "September 18, 2026",
    office: "FBI Headquarters",
    image:
      "https://images.pexels.com/photos/9567234/pexels-photo-9567234.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "8 min read",
  },
  {
    id: "n7",
    title: "FBI Laboratory Marks 94 Years of Forensic Leadership",
    excerpt:
      "From the first crime lab to rapid DNA and digital forensics, a look inside Quantico's cutting-edge science supporting 18,000 agencies.",
    category: "Inside the FBI",
    date: "September 12, 2026",
    office: "Quantico",
    image:
      "https://images.pexels.com/photos/6065129/pexels-photo-6065129.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "7 min read",
  },
  {
    id: "n8",
    title: "Seeking Information: Suspect in Series of Armored Car Robberies Across Three States",
    excerpt:
      "The FBI is asking for the public's help identifying an individual believed responsible for five robberies in Ohio, Indiana, and Kentucky.",
    category: "Seeking Info",
    date: "September 8, 2026",
    office: "Cincinnati",
    image:
      "https://images.pexels.com/photos/8369208/pexels-photo-8369208.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    readTime: "2 min read",
  },
];

export type FieldOffice = {
  city: string;
  state: string;
  stateCode: string;
  phone: string;
  address: string;
  region: string;
  residentAgencies: number;
  covers: string;
};

export const FIELD_OFFICES: FieldOffice[] = [
  { city: "Albany", state: "New York", stateCode: "NY", phone: "(518) 555-0101", address: "200 McCarty Ave, Albany, NY 12209", region: "Northeast", residentAgencies: 6, covers: "Northeastern NY & Vermont border counties" },
  { city: "Anchorage", state: "Alaska", stateCode: "AK", phone: "(907) 555-0102", address: "101 East 6th Ave, Anchorage, AK 99501", region: "West", residentAgencies: 3, covers: "Entire state of Alaska" },
  { city: "Atlanta", state: "Georgia", stateCode: "GA", phone: "(404) 555-0103", address: "2635 Century Pkwy NE, Atlanta, GA 30345", region: "Southeast", residentAgencies: 11, covers: "Northern & Central Georgia" },
  { city: "Baltimore", state: "Maryland", stateCode: "MD", phone: "(410) 555-0104", address: "2600 Lord Baltimore Dr, Baltimore, MD 21244", region: "Northeast", residentAgencies: 6, covers: "Maryland & Delaware" },
  { city: "Birmingham", state: "Alabama", stateCode: "AL", phone: "(205) 555-0105", address: "1000 18th St N, Birmingham, AL 35203", region: "Southeast", residentAgencies: 7, covers: "Northern Alabama" },
  { city: "Boston", state: "Massachusetts", stateCode: "MA", phone: "(857) 555-0106", address: "201 Maple St, Chelsea, MA 02150", region: "Northeast", residentAgencies: 9, covers: "MA, ME, NH, RI" },
  { city: "Buffalo", state: "New York", stateCode: "NY", phone: "(716) 555-0107", address: "68481 Main St, Buffalo, NY 14221", region: "Northeast", residentAgencies: 5, covers: "Western New York" },
  { city: "Charlotte", state: "North Carolina", stateCode: "NC", phone: "(704) 555-0108", address: "7910 Crescent Executive Dr, Charlotte, NC 28217", region: "Southeast", residentAgencies: 8, covers: "Western & Central NC" },
  { city: "Chicago", state: "Illinois", stateCode: "IL", phone: "(312) 555-0109", address: "2111 W Roosevelt Rd, Chicago, IL 60608", region: "Midwest", residentAgencies: 12, covers: "Northern Illinois & NW Indiana" },
  { city: "Dallas", state: "Texas", stateCode: "TX", phone: "(972) 555-0110", address: "1801 N Lamar St, Dallas, TX 75202", region: "South Central", residentAgencies: 10, covers: "North Texas" },
  { city: "Denver", state: "Colorado", stateCode: "CO", phone: "(303) 555-0111", address: "8000 E Maplewood Ave, Greenwood Village, CO 80111", region: "West", residentAgencies: 8, covers: "Colorado & Wyoming" },
  { city: "Detroit", state: "Michigan", stateCode: "MI", phone: "(313) 555-0112", address: "26 Federal Plaza, Detroit, MI 48226", region: "Midwest", residentAgencies: 9, covers: "Michigan" },
  { city: "Honolulu", state: "Hawaii", stateCode: "HI", phone: "(808) 555-0113", address: "91-1300 Enterprise St, Kapolei, HI 96707", region: "West", residentAgencies: 3, covers: "HI, Guam, American Samoa" },
  { city: "Houston", state: "Texas", stateCode: "TX", phone: "(713) 555-0114", address: "1 Justice Park Dr, Houston, TX 77092", region: "South Central", residentAgencies: 9, covers: "Southeast Texas" },
  { city: "Los Angeles", state: "California", stateCode: "CA", phone: "(310) 555-0115", address: "11000 Wilshire Blvd, Los Angeles, CA 90024", region: "West", residentAgencies: 14, covers: "Central & Southern CA coast" },
  { city: "Miami", state: "Florida", stateCode: "FL", phone: "(754) 555-0116", address: "2030 SW 145th Ave, Miramar, FL 33027", region: "Southeast", residentAgencies: 11, covers: "South Florida" },
  { city: "Minneapolis", state: "Minnesota", stateCode: "MN", phone: "(612) 555-0117", address: "1501 Freeway Blvd, Brooklyn Center, MN 55430", region: "Midwest", residentAgencies: 7, covers: "MN, ND, SD" },
  { city: "New York", state: "New York", stateCode: "NY", phone: "(212) 555-0118", address: "26 Federal Plaza, New York, NY 10278", region: "Northeast", residentAgencies: 15, covers: "NYC metro & Hudson Valley" },
  { city: "Philadelphia", state: "Pennsylvania", stateCode: "PA", phone: "(215) 555-0119", address: "600 Arch St, Philadelphia, PA 19106", region: "Northeast", residentAgencies: 8, covers: "Eastern PA & Southern NJ" },
  { city: "Phoenix", state: "Arizona", stateCode: "AZ", phone: "(623) 555-0120", address: "21711 N 7th St, Phoenix, AZ 85027", region: "West", residentAgencies: 7, covers: "Arizona" },
  { city: "San Francisco", state: "California", stateCode: "CA", phone: "(415) 555-0121", address: "450 Golden Gate Ave, San Francisco, CA 94102", region: "West", residentAgencies: 10, covers: "Northern California" },
  { city: "Seattle", state: "Washington", stateCode: "WA", phone: "(206) 555-0122", address: "1110 3rd Ave, Seattle, WA 98101", region: "West", residentAgencies: 8, covers: "Washington" },
  { city: "Tampa", state: "Florida", stateCode: "FL", phone: "(813) 555-0123", address: "5525 W Gray St, Tampa, FL 33609", region: "Southeast", residentAgencies: 7, covers: "Central & Southwest FL" },
  { city: "Washington", state: "District of Columbia", stateCode: "DC", phone: "(202) 555-0124", address: "601 4th St NW, Washington, DC 20535", region: "Headquarters", residentAgencies: 5, covers: "DC & Northern Virginia" },
];

export const CRIME_STATS = [
  { label: "Violent Crime Clearance", value: "49.2%", change: "+2.1%", up: true },
  { label: "IC3 Complaints (2025)", value: "880K+", change: "+12.4%", up: false },
  { label: "Active Investigations", value: "34,800", change: "+4.0%", up: true },
  { label: "Missing Children Recovered", value: "2,418", change: "+18.2%", up: true },
];

export const CRIME_BARS = [
  { year: "2019", violent: 82, property: 68 },
  { year: "2020", violent: 88, property: 71 },
  { year: "2021", violent: 91, property: 73 },
  { year: "2022", violent: 86, property: 70 },
  { year: "2023", violent: 79, property: 66 },
  { year: "2024", violent: 74, property: 61 },
  { year: "2025", violent: 69, property: 58 },
];

export const SCAMS = [
  {
    title: "Pig Butchering / Crypto Investment Fraud",
    level: "Critical",
    desc: "Scammers build trust over weeks on social apps, then lure victims to fake crypto platforms. Never send crypto to strangers. Losses topped $4.5B last year.",
    icon: "bitcoin",
  },
  {
    title: "Elder Fraud & Tech Support Scams",
    level: "High",
    desc: "Pop-ups claiming your computer is infected, then callers demanding gift cards or remote access. The FBI will never ask for payment by phone.",
    icon: "shield",
  },
  {
    title: "Ransomware Targeting Small Business",
    level: "High",
    desc: "Phishing emails encrypt networks and demand ransom. Back up offline, patch systems, and report to IC3 immediately — do not pay.",
    icon: "lock",
  },
  {
    title: "Sextortion of Minors",
    level: "Critical",
    desc: "Predators coerce minors into sharing images, then extort them. Tell kids to stop contact, save evidence, and report to 1-800-CALL-FBI.",
    icon: "alert",
  },
];
