import {
  SchoolInfo,
  Notice,
  SchoolEvent,
  GalleryItem,
  FacultyMember,
  AdmissionEnquiry,
  ContactEnquiry,
  DownloadItem,
  ActivityItem,
} from '../types';

export const initialSchoolInfo: SchoolInfo = {
  name: 'Vidya Vikas EM School',
  tagline: 'Nurturing Knowledge, Character & Discipline',
  affiliationNotice: 'English Medium School (Pre-Primary to Class X)',
  location: 'Kotauratla, Anakapalle District',
  mandal: 'Kotauratla Mandal',
  district: 'Anakapalle District',
  state: 'Andhra Pradesh',
  pinCode: '531085',
  phone: '9441971531',
  email: 'vidyavikasschool.kotauratla@gmail.com',
  address: 'Main Road, Kotauratla, Anakapalle District, Andhra Pradesh - 531085, India',
  officeHours: 'Monday to Saturday: 8:30 AM – 4:30 PM',
  principalName: 'Principal Office',
  establishedYear: '2008',
  welcomeMessage:
    'Welcome to Vidya Vikas EM School, located in Kotauratla, Anakapalle District, Andhra Pradesh. We are committed to providing quality English medium education, character building, and supportive foundational learning for every student.',
  principalMessage:
    'Education is the stepping stone for personal growth and community development. At Vidya Vikas EM School, our focus is on structured classroom instruction, discipline, and building core English literacy and mathematical skills. We warmly welcome parents to collaborate with us in guiding their children’s learning journey.',
  vision:
    'To provide accessible, high-quality English medium school education in Kotauratla and surrounding areas, empowering children with knowledge, confidence, and civic values.',
  mission:
    'To foster a supportive, disciplined learning atmosphere through dedicated teachers, interactive classroom teaching, sports activities, and close parent-school partnership.',
  values: [
    'Academic Diligence & Honesty',
    'Discipline and Mutual Respect',
    'Care and Inclusivity',
    'Moral Values & Civic Duty',
    'Continuous Parent Communication',
  ],
};

export const initialNotices: Notice[] = [
  {
    id: 'not-001',
    title: 'Admissions Open for Academic Year 2026–27 (LKG to Class IX)',
    category: 'admission',
    date: '2026-03-10',
    isPinned: true,
    isPublished: true,
    isDemo: true,
    summary:
      'Applications are invited for fresh admissions into Pre-Primary and Primary/High School sections. Limited seats per class.',
    content:
      'Vidya Vikas EM School, Kotauratla announces the commencement of registration for the upcoming academic session 2026–27. Parents seeking admission can collect registration forms directly from the school administrative office or submit the online enquiry form on this portal.',
    attachmentName: 'Admission_Guidelines_2026-27.pdf',
    attachmentSize: '420 KB',
    postedBy: 'Administrative Office',
    createdAt: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'not-002',
    title: 'Formative Assessment & Class Revision Timetable',
    category: 'exam',
    date: '2026-03-15',
    isPinned: true,
    isPublished: true,
    isDemo: true,
    summary:
      'Examination timetable and revision guidelines for upcoming formative assessments have been scheduled.',
    content:
      'All students and parents are notified that term examinations and syllabus revision sessions will be conducted. Daily morning revision will focus on mathematics and language practice. Regular attendance is strictly requested.',
    attachmentName: 'Assessment_Timetable.pdf',
    attachmentSize: '310 KB',
    postedBy: 'Academic Coordinator',
    createdAt: '2026-03-15T10:30:00.000Z',
  },
  {
    id: 'not-003',
    title: 'Parent-Teacher Interaction Meeting Notice',
    category: 'general',
    date: '2026-03-18',
    isPinned: false,
    isPublished: true,
    isDemo: true,
    summary:
      'Parent-Teacher interaction meeting will be held on Saturday between 9:30 AM and 1:00 PM.',
    content:
      'We request all parents to attend the upcoming parent-teacher meeting at the school campus to discuss student academic progress, attendance, and preparation guidelines.',
    attachmentName: 'PTM_Circular.pdf',
    attachmentSize: '245 KB',
    postedBy: 'Principal Office',
    createdAt: '2026-03-18T11:00:00.000Z',
  },
  {
    id: 'not-004',
    title: 'Annual Vacation & Holiday Guidelines',
    category: 'holiday',
    date: '2026-03-20',
    isPinned: false,
    isPublished: true,
    isDemo: true,
    summary:
      'School vacation schedule and holiday assignment project notification.',
    content:
      'The holiday schedule following annual assessments has been declared. Vacation project books and reading worksheets will be distributed before the break. Reopening dates will be notified accordingly.',
    attachmentName: 'Holiday_Notice.pdf',
    attachmentSize: '280 KB',
    postedBy: 'Administrative Office',
    createdAt: '2026-03-20T08:30:00.000Z',
  },
];

export const initialEvents: SchoolEvent[] = [
  {
    id: 'evt-001',
    title: 'Annual Inter-House Sports & Athletics Meet',
    category: 'sports',
    date: '2026-04-04',
    time: '9:00 AM – 4:00 PM',
    venue: 'School Grounds, Kotauratla',
    description:
      'Annual sports competition featuring track events, kho-kho, kabaddi, and team sports across school houses.',
    isUpcoming: true,
    isPublished: true,
    isDemo: true,
    highlights: [
      'Inter-house track and relay events',
      'Traditional team games (Kabaddi & Kho-Kho)',
      'Prize and recognition distribution',
    ],
  },
  {
    id: 'evt-002',
    title: 'National Science Day Project Showcase',
    category: 'academic',
    date: '2026-02-28',
    time: '10:00 AM – 2:00 PM',
    venue: 'Campus Hall, Kotauratla',
    description:
      'Exhibition where students demonstrate science projects, working models, and mathematical charts to visiting parents.',
    isUpcoming: false,
    isPublished: true,
    isDemo: true,
    highlights: [
      'Student working science models',
      'Environmental conservation displays',
      'Mathematics puzzle demonstrations',
    ],
  },
  {
    id: 'evt-003',
    title: 'Republic Day Flag Hoisting & Assembly',
    category: 'national',
    date: '2026-01-26',
    time: '8:00 AM – 10:30 AM',
    venue: 'School Courtyard, Kotauratla',
    description:
      'Tricolor flag unfurling, National Anthem, student speeches in Telugu and English, and patriotic group songs.',
    isUpcoming: false,
    isPublished: true,
    isDemo: true,
    highlights: [
      'Flag unfurling and National Anthem',
      'Student elocution in English and Telugu',
      'March past and cultural presentation',
    ],
  },
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-001',
    title: 'Classroom & Instructional Setup',
    category: 'classroom',
    imageUrl: '/hero-classroom.jpg',
    caption:
      'Classroom setup equipped with individual student desks, teacher podium, and visual teaching aids.',
    date: '2026-02-15',
    isPublished: true,
    isDemo: true,
  },
  {
    id: 'gal-002',
    title: 'School Campus & Courtyard',
    category: 'campus',
    imageUrl: '/school-campus.jpg',
    caption:
      'Vidya Vikas EM School campus building in Kotauratla with open assembly courtyard.',
    date: '2026-01-20',
    isPublished: true,
    isDemo: true,
  },
  {
    id: 'gal-003',
    title: 'Practical Science & Learning Demonstrations',
    category: 'science',
    imageUrl: '/hero-classroom.jpg',
    caption:
      'Students actively participating in science apparatus and model observations.',
    date: '2026-02-28',
    isPublished: true,
    isDemo: true,
  },
  {
    id: 'gal-004',
    title: 'School Sports & Morning Assembly Ground',
    category: 'sports',
    imageUrl: '/school-campus.jpg',
    caption:
      'Outdoor physical education and assembly ground utilized for student drills and sports practice.',
    date: '2026-01-10',
    isPublished: true,
    isDemo: true,
  },
];

export const initialFaculty: FacultyMember[] = [
  {
    id: 'fac-001',
    name: 'Head of Institution',
    designation: 'Principal & Academic Head',
    subject: 'Administration & Mathematics',
    department: 'School Leadership',
    qualification: 'M.Sc., B.Ed.',
    experience: '15+ Years in Education',
    shortProfile:
      'Oversees daily school administration, curriculum alignment, student discipline, and parent communication.',
    displayOrder: 1,
    isActive: true,
    isLeadership: true,
    isDemo: true,
  },
  {
    id: 'fac-002',
    name: 'Senior Mathematics Faculty',
    designation: 'Mathematics Teacher',
    subject: 'Mathematics',
    department: 'Mathematics Wing',
    qualification: 'B.Sc. (Maths), B.Ed.',
    experience: '10 Years Teaching',
    shortProfile:
      'Focuses on building step-by-step arithmetic fundamentals, geometric proofs, and problem-solving confidence.',
    displayOrder: 2,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
  {
    id: 'fac-003',
    name: 'Physical Sciences Faculty',
    designation: 'Science Teacher',
    subject: 'Physics & Chemistry',
    department: 'Science Wing',
    qualification: 'M.Sc. (Physics), B.Ed.',
    experience: '9 Years Teaching',
    shortProfile:
      'Guides students through physical sciences using everyday practical examples and experimental demonstrations.',
    displayOrder: 3,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
  {
    id: 'fac-004',
    name: 'English Language Faculty',
    designation: 'English Teacher',
    subject: 'English Language & Grammar',
    department: 'Languages Wing',
    qualification: 'M.A. (English), B.Ed.',
    experience: '8 Years Teaching',
    shortProfile:
      'Emphasizes spoken English fluency, reading comprehension, vocabulary development, and expressive writing.',
    displayOrder: 4,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
  {
    id: 'fac-005',
    name: 'Telugu Language Educator',
    designation: 'Telugu Pandit',
    subject: 'Telugu Language & Literature',
    department: 'Languages Wing',
    qualification: 'M.A. (Telugu), T.P.T.',
    experience: '12 Years Teaching',
    shortProfile:
      'Dedicated to regional language instruction, classical Telugu poetry recitation, and grammar foundations.',
    displayOrder: 5,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
  {
    id: 'fac-006',
    name: 'Social Studies Faculty',
    designation: 'Social Studies Teacher',
    subject: 'Social Studies & Civics',
    department: 'Humanities Wing',
    qualification: 'B.A., B.Ed.',
    experience: '7 Years Teaching',
    shortProfile:
      'Teaches Indian history, geography, democratic civics, and map reading skills to senior classes.',
    displayOrder: 6,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
  {
    id: 'fac-007',
    name: 'Primary Wing Coordinator',
    designation: 'Primary Section Lead',
    subject: 'Foundational Literacy & Numeracy',
    department: 'Primary Section',
    qualification: 'B.Sc., D.El.Ed.',
    experience: '8 Years Teaching',
    shortProfile:
      'Manages foundational learning for primary classes with interactive phonics, activity charts, and numeracy games.',
    displayOrder: 7,
    isActive: true,
    isLeadership: true,
    isDemo: true,
  },
  {
    id: 'fac-008',
    name: 'Physical Education Instructor',
    designation: 'Physical Education Teacher',
    subject: 'Sports & Physical Health',
    department: 'Physical Education',
    qualification: 'B.P.Ed.',
    experience: '6 Years Experience',
    shortProfile:
      'Conducts morning yoga, assembly drills, track sports, and traditional team games like Kabaddi and Kho-Kho.',
    displayOrder: 8,
    isActive: true,
    isLeadership: false,
    isDemo: true,
  },
];

export const initialDownloads: DownloadItem[] = [
  {
    id: 'dl-001',
    title: 'School Information Brochure & Academic Overview',
    category: 'admission',
    fileName: 'Vidya_Vikas_Information_Brochure.pdf',
    fileSize: '1.2 MB',
    fileType: 'PDF Document',
    description:
      'School overview including curriculum details, class wings, admission guidelines, and office hours.',
    lastUpdated: '2026-03-01',
    downloadCount: 45,
    isDemo: true,
  },
  {
    id: 'dl-002',
    title: 'Student Admission Enquiry Form (Printable)',
    category: 'admission',
    fileName: 'Admission_Enquiry_Form_Printable.pdf',
    fileSize: '350 KB',
    fileType: 'PDF Document',
    description:
      'Printable admission enquiry form for in-person submission at the school administrative office.',
    lastUpdated: '2026-03-05',
    downloadCount: 78,
    isDemo: true,
  },
  {
    id: 'dl-003',
    title: 'Academic Year Working Days & Calendar Outline',
    category: 'calendar',
    fileName: 'Academic_Calendar_Outline.pdf',
    fileSize: '480 KB',
    fileType: 'PDF Document',
    description:
      'Term schedules, examination slots, and declared festival holidays for the current academic session.',
    lastUpdated: '2026-03-12',
    downloadCount: 62,
    isDemo: true,
  },
  {
    id: 'dl-004',
    title: 'School Uniform & Dress Code Norms',
    category: 'guideline',
    fileName: 'Uniform_and_Conduct_Guidelines.pdf',
    fileSize: '290 KB',
    fileType: 'PDF Document',
    description:
      'Guidelines for daily school uniform, Wednesday sports uniform, and campus discipline expectations.',
    lastUpdated: '2026-01-15',
    downloadCount: 39,
    isDemo: true,
  },
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-001',
    title: 'Physical Education & Outdoor Games',
    category: 'Sports & Athletics',
    description:
      'Regular physical education periods emphasizing fitness, athletics, Kho-Kho, Kabaddi, and team coordination.',
    schedule: 'Scheduled Weekly Activity Periods',
    benefits: [
      'Cardiovascular health and agility',
      'Teamwork and healthy sportsmanship',
      'Active participation in regional school games',
    ],
  },
  {
    id: 'act-002',
    title: 'Daily Morning Assembly & Yoga',
    category: 'Health & Wellness',
    description:
      'School days begin with collective assembly prayer, national anthem, pledge, and simple breathing exercises.',
    schedule: 'Every Morning (8:45 AM – 9:15 AM)',
    benefits: [
      'Promotes calm concentration before class',
      'Encourages daily posture and fitness awareness',
      'Instills mutual respect and social discipline',
    ],
  },
  {
    id: 'act-003',
    title: 'National Celebrations & Cultural Events',
    category: 'Cultural Activities',
    description:
      'Commemoration of Independence Day, Republic Day, Gandhi Jayanti, Telugu Language Day, and Teachers Day.',
    schedule: 'National Festival Observances',
    benefits: [
      'Understanding of national heritage and civic responsibility',
      'Platform for elocution, poetry recitation, and group performance',
      'Strengthening bonds between teachers, students, and parents',
    ],
  },
  {
    id: 'act-004',
    title: 'Science Demonstrations & Mathematics Practice',
    category: 'Academic Enrichment',
    description:
      'Practical demonstrations where students explore simple science apparatus, biological charts, and math puzzles.',
    schedule: 'Scheduled Activity Sessions',
    benefits: [
      'Direct hands-on understanding of scientific concepts',
      'Encourages logical curiosity and questioning',
      'Helps prepare students for school-level exhibitions',
    ],
  },
];

export const initialAdmissions: AdmissionEnquiry[] = [
  {
    id: 'adm-001',
    applicationNo: 'VV-2026-ADM-1001',
    studentName: 'B. Tarun',
    parentName: 'B. Govinda Rao',
    email: 'parent.sample@gmail.com',
    phone: '9848022334',
    gradeApplying: 'Class VI',
    previousSchool: 'Primary School, Kotauratla',
    dob: '2014-06-12',
    gender: 'Male',
    address: 'Kotauratla, Anakapalle District',
    message: 'Seeking admission in English medium for 6th class. Please share details on curriculum.',
    status: 'pending',
    createdAt: '2026-03-12T10:15:00.000Z',
    isDemo: true,
  },
  {
    id: 'adm-002',
    applicationNo: 'VV-2026-ADM-1002',
    studentName: 'K. Sneha',
    parentName: 'K. Satyanarayana',
    email: 'satya.parent@gmail.com',
    phone: '9490112233',
    gradeApplying: 'L.K.G',
    previousSchool: 'New Admission',
    dob: '2022-04-18',
    gender: 'Female',
    address: 'Kotauratla Mandal',
    message: 'Enquiry for pre-primary English medium admission.',
    status: 'contacted',
    createdAt: '2026-03-14T11:40:00.000Z',
    notes: 'Parent contacted via phone. Application form provided.',
    isDemo: true,
  },
];

export const initialContacts: ContactEnquiry[] = [
  {
    id: 'con-001',
    name: 'Parent Enquiry',
    email: 'enquiry.sample@gmail.com',
    phone: '9440556677',
    subject: 'School bus route query',
    message: 'Please provide information regarding pickup points in Kotauratla mandal.',
    status: 'read',
    createdAt: '2026-03-16T14:20:00.000Z',
    replyNotes: 'Shared office contact and vehicle timing info.',
    isDemo: true,
  },
];
