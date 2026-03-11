const pptxgen = require('pptxgenjs');

// Initialize
let pres = new pptxgen();
pres.author = 'Antigravity / Vikas School';
pres.company = 'Vikas School Management';
pres.revision = '1';

// Standard Slide Master - Blue Tech Presentation Style
pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: '133C55' }, // Deep Blue Gradient Base
    objects: [
        // Subtle left bar accent
        { rect: { x: 0, y: 1.0, w: 0.15, h: 0.6, fill: { color: '3A6B88' } } },

        // --- Tech Watermark Rings (Right Side) ---
        // Outer faint ring
        { shape: pres.ShapeType.donut, options: { x: 8.5, y: -1.0, w: 4, h: 4, fill: { type: 'solid', color: 'FFFFFF', alpha: 3 } } },
        { shape: pres.ShapeType.donut, options: { x: 8.75, y: -0.75, w: 3.5, h: 3.5, fill: { type: 'solid', color: 'FFFFFF', alpha: 3 } } },
        // Arc accents
        { shape: pres.ShapeType.arc, options: { x: 8.2, y: -0.8, w: 4.6, h: 4.6, line: { color: 'FFFFFF', width: 0.5, transparency: 85 } } },
        { shape: pres.ShapeType.arc, options: { x: 8.0, y: -0.6, w: 5.0, h: 5.0, line: { color: 'FFFFFF', width: 1.0, dashType: 'dash', transparency: 85 } } },

        // --- Tech Watermark Rings (Bottom Right) ---
        { shape: pres.ShapeType.donut, options: { x: 8.0, y: 4.0, w: 2.5, h: 2.5, fill: { type: 'solid', color: 'FFFFFF', alpha: 3 } } },
        { shape: pres.ShapeType.donut, options: { x: 8.25, y: 4.25, w: 2.0, h: 2.0, line: { color: 'FFFFFF', width: 0.5, dashType: 'dash', transparency: 80 } } },

        // --- Tech Watermark Rings (Bottom Left) ---
        { shape: pres.ShapeType.arc, options: { x: -0.5, y: 4.5, w: 1.5, h: 1.5, line: { color: 'FFFFFF', width: 1, transparency: 80 } } },

        // Footer Customization
        { text: { text: 'VIKAS SCHOOL MANAGEMENT SYSTEM', options: { x: 0.5, y: 5.2, w: 4, h: 0.3, fontFace: 'Segoe UI', fontSize: 10, color: '8AABC1', bold: true } } },
        { text: { text: '© 2026 Vikas Education', options: { x: 6.5, y: 5.2, w: 2, h: 0.3, align: 'right', fontFace: 'Segoe UI', fontSize: 10, color: '8AABC1' } } }
    ],
    slideNumber: { x: 9.2, y: 5.2, fontFace: 'Segoe UI', fontSize: 10, color: '8AABC1', bold: true }
});

// Title Slide - High Impact Corporate Look
let slideHeader = pres.addSlide(); // Blank master for full bleed
// Background is dark blue with gold text
slideHeader.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '133C55' } });

// Decorative tech rings on title slide
slideHeader.addShape(pres.ShapeType.donut, { x: 7.5, y: -1.5, w: 5, h: 5, fill: { type: 'solid', color: 'FFFFFF', alpha: 4 } });
slideHeader.addShape(pres.ShapeType.arc, { x: 7.0, y: -1.0, w: 6, h: 6, line: { color: 'FFFFFF', width: 1, dashType: 'dash', transparency: 80 } });

slideHeader.addText('VIKAS SCHOOL', { x: 0.5, y: 1.8, w: 8.5, h: 0.8, fontFace: 'Segoe UI Black', fontSize: 52, color: 'F2A961', charSpacing: 2 });
slideHeader.addText('SYSTEM PRESENTATION', { x: 0.5, y: 2.6, w: 8.5, h: 0.5, fontFace: 'Segoe UI', fontSize: 24, color: 'FFFFFF', bold: true, letterSpacing: 4 });
slideHeader.addText('Comprehensive Overview of Architecture, Modules, and Workflows', { x: 0.5, y: 3.4, w: 8.5, h: 0.5, fontFace: 'Segoe UI', fontSize: 16, color: 'E0E6ED' });


// Function to create a standard content + image slide
function addComponentSlide(title, descriptionArr, imgPath) {
    let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });

    // Header Title (Orange Gold Color from reference matching 'VIKAS SCHOOL ATTENDANCE TRACKER')
    slide.addText(title.toUpperCase(), { x: 0.5, y: 0.6, w: 8.5, h: 0.5, fontFace: 'Segoe UI Black', fontSize: 20, bold: true, color: 'F2A961', valign: 'middle' });

    // Description bullets - White text on blue background
    let yPos = 1.3;
    let bulletOptions = { x: 0.3, y: yPos, w: 4.8, h: 3.5, fontFace: 'Segoe UI', fontSize: 16, color: 'FFFFFF', bullet: { type: 'bullet', characterCode: '25AA' }, valign: 'top', lineSpacing: 24 };
    slide.addText(descriptionArr, bulletOptions);

    // Screenshot - Wrapped in a sleek tech-border/shadow
    if (imgPath) {
        // Drop shadow backdrop for image
        slide.addShape(pres.ShapeType.rect, { x: 5.38, y: 1.28, w: 4.24, h: 3.44, fill: { color: '1E3A8A' }, shadow: { type: 'outer', color: '000000', opacity: 0.3, blur: 10, offset: 4 } });
        // The image itself
        slide.addImage({ path: imgPath, x: 5.4, y: 1.3, w: 4.2, h: 3.4, sizing: { type: 'contain' } });
    }
}

// Function to create a full text slide (for missing components)
function addTextSlide(title, descriptionArr) {
    let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });

    // Header Title (Orange Gold Color)
    slide.addText(title.toUpperCase(), { x: 0.5, y: 0.6, w: 8.5, h: 0.5, fontFace: 'Segoe UI Black', fontSize: 20, bold: true, color: 'F2A961', valign: 'middle' });

    // Description bullets - Wide layout (White text)
    let bulletOptions = { x: 0.5, y: 1.5, w: 9.0, h: 3.5, fontFace: 'Segoe UI', fontSize: 18, color: 'FFFFFF', bullet: false, valign: 'top', lineSpacing: 32 };
    slide.addText(descriptionArr, bulletOptions);
}

// 1. Dashboard
addComponentSlide('1. Administrator Dashboard (eduProDashboard)', [
    { text: 'What is it?' },
    { text: 'The central hub for all school administrators. Hosted in the Vikas School Lightning App.' },
    { text: 'Features:' },
    { text: '  - Navigation Sidebar: Quick access to Admissions, Financials, and Academics.' },
    { text: '  - KPI Metrics: Dynamic cards showing Total Students, Revenue, and Pending Collections.' },
    { text: '  - Quick Actions: Buttons for New Admission and Payment processing.' },
    { text: 'How to use:' },
    { text: '  - Review metrics upon login. Click links in the left sidebar to navigate to other modules.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\dashboard_overview_1772428510823.png');

// 2. Admission Manager - Step 1
addComponentSlide('2.1 Admission Manager - Step 1: Personal Info', [
    { text: 'Step 1 of 4: Personal & Address Information' },
    { text: 'Features:' },
    { text: '  - Collects detailed demographic data including Names, DOB, and Contacts.' },
    { text: '  - Captures full residential address (Village/City, State, Country).' },
    { text: '  - Built-in validation ensures all mandatory fields are filled before proceeding.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\admission_manager_1772385586795.png');

// 2. Admission Manager - Step 2
addComponentSlide('2.2 Admission Manager - Step 2: Academic Details', [
    { text: 'Step 2 of 4: Class and Year Selection' },
    { text: 'Features:' },
    { text: '  - Dynamic Picklists: Administrator selects the target Academic Year, Class, and Section.' },
    { text: '  - Real-time querying against the database to fetch active Academic Years.' },
    { text: '  - This mapping is crucial as it determines which Fee Pricebook the student is linked to.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\admission_step_2_1772431247882.png');

// 2. Admission Manager - Step 3
addComponentSlide('2.3 Admission Manager - Step 3: Fee Structure', [
    { text: 'Step 3 of 4: Choose Applicable Fee Items' },
    { text: 'Features:' },
    { text: '  - Based on the Class and Year selected in Step 2, the system fetches matching Active Products (Pricing).' },
    { text: '  - Administrator selects which fees apply (e.g., Tuition, Uniform, Transport).' },
    { text: '  - Real-time calculation: Allows inputting a Concession Amount to instantly calculate Net Fee.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\admission_step_3_1772431354954.png');

// 2. Admission Manager - Step 4
addComponentSlide('2.4 Admission Manager - Step 4: Review & Submit', [
    { text: 'Step 4 of 4: Verify and Confirm Admission' },
    { text: 'Features:' },
    { text: '  - Final review of the collected data.' },
    { text: '  - The "Confirm Admission" action fires an Apex process.' },
    { text: '  - Automations Triggered:' },
    { text: '      1. Creates a Person Account for the Student.' },
    { text: '      2. Creates an Opportunity (Admission Record).' },
    { text: '      3. Generates OpportunityLineItems.' },
    { text: '  - On success, prompts to "Pay Now" transitioning to Fee Management.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\admission_step_4_1772431412295.png');

// 3. Student Directory
addComponentSlide('3. Student Directory & Search', [
    { text: 'What is it?' },
    { text: 'A dynamic, searchable list of all enrolled students.' },
    { text: 'Features:' },
    { text: '  - Search Bar: Instantly find students by Name, ID, or Phone Number.' },
    { text: '  - Filters: Narrow down lists by Academic Year, Class, and Section.' },
    { text: 'How to use:' },
    { text: '  - Set the filters, search a name, and click the student name to drill down into their 360° Record.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_directory_filters_1772432466700.png');

// 4.1 Student Record - Address & Attendance
addComponentSlide('4.1 Student Record: Address & Attendance', [
    { text: 'Address Information:' },
    { text: '  - Comprehensive view of Guardian Names, Contacts, and Physical Address.' },
    { text: 'Attendance Report Component:' },
    { text: '  - Native LWC tracking Working Days, Days Present, Absent, and Attendance Percentage.' },
    { text: '  - Live calculation based on institutional calendar data.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_record_address_attendance_1772432504124.png');

// 4.2 Fee Information
addComponentSlide('4.2 Student Record: Fee Information', [
    { text: 'Financial Status Component:' },
    { text: '  - Displays high-level allocations: Total Allocated Amount, Total Paid, and Pending Balance.' },
    { text: 'Current Academic Year Fees:' },
    { text: '  - A detailed list view breaking down specific fee line-items.' },
    { text: '  - Allows cashiers to instantly see what is owed directly from the profile.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_record_fee_info_1772432520686.png');

// 4.3 Grades & Performance
addComponentSlide('4.3 Student Record: Grades & Performance', [
    { text: 'Academic Tracking:' },
    { text: '  - Progress Card: Highlights overall average performance and year completion.' },
    { text: '  - Performance Report: Detailed breakdown of Unit Tests, Quarterly, and Final exams.' },
    { text: '  - Enables teachers and administrators to assess academic standing immediately.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_record_performance_1772432562214.png');

// 4.4 Student Behavior
addComponentSlide('4.4 Student Record: Student Behavior', [
    { text: 'Discipline & Behavior Tracking:' },
    { text: '  - Overview of total behavioral cases logged against the student.' },
    { text: '  - Categorized into Active, Positive, and Negative incidents.' },
    { text: '  - Provides a holistic view of the student beyond just academics.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_record_behavior_1772432595830.png');

// 6. Fee Management
addComponentSlide('6. Fee Management & Billing (payTheBill)', [
    { text: 'What is it?' },
    { text: 'The dedicated console for cashiers to process payments and view ledgers.' },
    { text: 'Features:' },
    { text: '  - Quick Student Search loads the specific financial ledger for an academic year.' },
    { text: '  - Breaks down fees into line items (Tuition, Uniforms, Books).' },
    { text: '  - Tracks Total Amount, Discounts applied, and Real-time Balance.' },
    { text: 'How to use:' },
    { text: '  - Search a student, enter payment amounts against specific particulars, and click process.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\fee_management_aanya_bose_1772428584644.png');

// 6.1 Fee Management - Payment & Receipt Options
addComponentSlide('6.1 Fee Management: Payment & Receipt Options', [
    { text: 'Payment Selection:' },
    { text: '  - Multiple channels supported including PhonePe, Google Pay, Net Banking, and Cash.' },
    { text: 'Receipt & Export Features:' },
    { text: '  - Instantly Preview Receipt before or after transaction.' },
    { text: '  - Finalize Payment records the transaction against the student ledger.' },
    { text: '  - Transaction History table allows for post-payment Preview, Download, and PDF generation.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\media__1772504778891.png');


// 7. Marks & Grades
addComponentSlide('7. Grades & Marks Entry (enterMarks)', [
    { text: 'What is it?' },
    { text: 'Academic module for entering and tracking student performance.' },
    { text: 'Features:' },
    { text: '  - Select a Class, Section, and Exam type to load a bulk-entry grid.' },
    { text: '  - Fast data entry format so teachers can update multiple students simultaneously.' },
    { text: 'How to use:' },
    { text: '  - Open "Grades", select the parameters, input the scores, and click Save bulk records.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\grades_marks_overview_1772428634325.png');

// 8.1 Attendance Report - Slide 1: Title & Introduction
addTextSlide('8.1 Attendance Intelligence & Forecasting System', [
    { text: 'From Data Collection to Strategic Analytics.' },
    { text: 'Vision:' },
    { text: '  - A unified reporting engine that transforms thousands of attendance records into intuitive visual stories.' },
    { text: 'Presenter Note:' },
    { text: '  - Emphasize that this is the "Brain" of the attendance system, where teachers and management see the results of daily tracking.' }
]);

// 8.2 Attendance Report - Slide 2: Daily View - Institutional Snapshot
addComponentSlide('8.2 Operational Control Center', [
    { text: 'Executive Banner:' },
    { text: '  - High-visibility stats for "Total Students", "Present Count", and "Absent Count" across the entire institution.' },
    { text: 'Date Navigation:' },
    { text: '  - Dynamic calendar picker and directional controls to review any past or future working day instantly.' },
    { text: 'Status Badging:' },
    { text: '  - Quick visual indicators for "Attendance Submitted" vs "Not Submitted" classes.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\attendance_daily_1772472646150.png');

// 8.3 Attendance Report - Slide 3: Daily View - Class Detail Intelligence
addComponentSlide('8.3 Granular Class-Level Monitoring', [
    { text: 'Interactive Cards:' },
    { text: '  - Each Class/Section is represented by a theme-coded card (Themes 1-5) for rapid visual identification.' },
    { text: 'Absentee Tooltips:' },
    { text: '  - Proprietary hover technology that displays the specific names of absent students without leaving the dashboard.' },
    { text: 'Real-Time Rates:' },
    { text: '  - Calculated attendance percentage for every class, updated instantly as data is fetched.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\media__1772526106015.png');

// 8.4 Attendance Report - Slide 4: Weekly View - The 6-Day Cycle
addComponentSlide('8.4 Analyzing Mid-Week Performance', [
    { text: 'Class Drilldown:' },
    { text: '  - Dedicated view focusing on a specific Class/Section\'s performance from Monday to Saturday.' },
    { text: 'Weekly Rate Badge:' },
    { text: '  - A dedicated analytics badge showing the overall success rate for the 6-day period.' },
    { text: 'Day-by-Day Grid:' },
    { text: '  - Explicit "Present" and "Absent" counts for every working day, allowing coordinators to spot "Absentee Wednesdays" or "Friday Slumps."' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\media__1772526025418.png');

// 8.5 Attendance Report - Slide 5: Monthly View - The Visual Heatmap
addComponentSlide('8.5 Aggregate Monthly Health', [
    { text: 'Full Calendar Layout:' },
    { text: '  - A responsive grid showing every day of the month.' },
    { text: 'Color-Coded Statuses:' },
    { text: '  - Emerald (90%+): Exceptional Performance.' },
    { text: '  - Amber (75-90%): Maintenance Required.' },
    { text: '  - Crimson (<75%): Critical Intervention Needed.' },
    { text: 'Working Day Exclusion:' },
    { text: '  - Automatically filters out Sundays and Session-less days from calculations.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\attendance_monthly_1772472692417.png');

// 8.6 Attendance Report - Slide 6: Monthly View - Student-Wise Deep Dive
addComponentSlide('8.6 Individual Student Heatmaps', [
    { text: 'Dynamic Search:' },
    { text: '  - Searching for a student transforms the class heatmap into a personal attendance diary.' },
    { text: 'Visual Checkmarks:' },
    { text: '  - ✅ (Present) or ❌ (Absent) markers displayed on individual calendar cells for a specific student.' },
    { text: 'Personal Stats:' },
    { text: '  - Dedicated counts for "Student Present" vs "Student Absent" for the chosen month.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\media__1772526181907.png');

// 8.7 Attendance Report - Slide 7: Yearly View - The Academic Journey
addComponentSlide('8.7 Macro-Level Institutional Trends', [
    { text: '12-Month Summary:' },
    { text: '  - A high-level overview of the entire academic year on a single screen.' },
    { text: 'Month-by-Month Comparisons:' },
    { text: '  - Side-by-side stats showing which months had the highest/lowest engagement levels.' },
    { text: 'Working Day Totals:' },
    { text: '  - Cumulative count of all sessions held throughout the year for precise auditing.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\attendance_yearly_1772472766490.png');

// 8.8 Attendance Report - Slide 8: Yearly View - Serial Student Analytics
addComponentSlide('8.8 Mapping Individual Success over Time', [
    { text: 'Annual Profile:' },
    { text: '  - A dedicated student profile view covering the entire year\'s journey.' },
    { text: 'Trend Identification:' },
    { text: '  - Identify long-term patterns, such as a student\'s attendance declining in winter months or improving in the final term.' },
    { text: 'Profile Card:' },
    { text: '  - Displays Student Name, Roll No, Avatar, and the critical Yearly Attendance Rate.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\144ad61a-7fda-4cd2-8ff8-f10d38ede20b\\media__1772526217664.png');

// 8.9 Attendance Report - Slide 9: The Analytics Modal
addTextSlide('8.9 Precision Micro-Data', [
    { text: 'Universal Detail View:' },
    { text: '  - A pop-up interface accessible from any view for instant student-level checks.' },
    { text: 'Checkbox Summary:' },
    { text: '  - "Present Today", "Absent Today", and "Holiday" statuses with modern checkmark indicators.' },
    { text: 'Quick Contact:' },
    { text: '  - Displays student metadata (Roll No/Class) for immediate outreach if a student is marked absent.' }
]);

// 8.10 Attendance Report - Slide 10: Intelligent Global Filters
addTextSlide('8.10 Search, Sort, and Filter', [
    { text: 'Cross-View Search:' },
    { text: '  - Powerful search box that works across Daily, Weekly, Monthly, and Yearly contexts.' },
    { text: 'Dropdown Control:' },
    { text: '  - Precision filtering by Class and Section with automatic "All Classes" global aggregation.' },
    { text: 'Automatic Reset:' },
    { text: '  - Intuitive "Clear Filters" functionality to return to the global view instantly.' }
]);

// 8.11 Attendance Report - Slide 11: Conclusion
addTextSlide('8.11 Data-Driven Education Management', [
    { text: 'Improved Retention:' },
    { text: '  - Identify and council students with low attendance BEFORE they fall behind.' },
    { text: 'Teacher Accountability:' },
    { text: '  - Monitor attendance submission rates across sections in real-time.' },
    { text: 'Operational Excellence:' },
    { text: '  - Eliminate manual spreadsheets with a single, high-performance digital source of truth.' }
]);

// 9. Student Promotion
addComponentSlide('9. Student Promotion (studentPromotion)', [
    { text: 'What is it?' },
    { text: 'End-of-year bulk student transfer tool.' },
    { text: 'Features:' },
    { text: '  - Select Source Class and Destination Class.' },
    { text: '  - Bulk select students to promote.' },
    { text: '  - Automatically closes current Admission Opportunity and opens a new one for the next Academic Year.' },
    { text: '  - Auto-carriers outstanding financial dues.' },
    { text: 'How to use:' },
    { text: '  - Choose source/target criteria, vet the student list, and click "Promote Selected".' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\student_promotion_top_1772385618177.png');


// MISSING COMPONENTS SECTION DIVIDER
let slideDivider = pres.addSlide(); // Blank master
slideDivider.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '635BFF' } }); // Sapphire Background
slideDivider.addText('ARCHITECTURE & CONFIGURATION', { x: 0.5, y: 2.0, w: 9, h: 1, fontFace: 'Segoe UI', fontSize: 36, bold: true, color: 'FFFFFF', align: 'center', letterSpacing: 2 });
slideDivider.addText('Core Frameworks and Setup Modules', { x: 0.5, y: 3.0, w: 9, h: 0.5, fontFace: 'Segoe UI', fontSize: 18, color: 'E2E8F0', align: 'center' });

// 10. Teacher & Class Management
// 10. Teacher & Class Management
addComponentSlide('10. Teacher & Class Management', [
    { text: 'Component: teacherandClassmanagement / assignedClasses' },
    { text: '' },
    { text: 'What is it?' },
    { text: 'A structural setup module used by administrators at the start of an academic year.' },
    { text: 'Features:' },
    { text: '  - Teacher Association: Links faculty members to specific subjects.' },
    { text: '  - Class/Section Assignment: Assigns a class teacher to a specific section.' },
    { text: '  - Workload Overview: Provides clear visibility into workloads across different teachers and classes.' },
    { text: 'How to use:' },
    { text: '  - From the admin pane, link teachers to their respective classes. This updates the global structural hierarchy securely.' }
], 'C:\\Users\\sunil\\.gemini\\antigravity\\brain\\26abe6dc-61bb-48bc-863c-e61684fc21f6\\teacher_class_management_1772444303387.png');

// 11. Faculty Portal
addTextSlide('11. Faculty Portal', [
    { text: 'Component: facultyPortal' },
    { text: '' },
    { text: 'What is it?' },
    { text: 'A personalized frontend for teaching staff.' },
    { text: 'Features:' },
    { text: '  - Teacher-Specific Views: Only shows data for classes assigned to the logged-in teacher.' },
    { text: '  - Quick Action Integration: Shortcuts to mark daily attendance for their section.' },
    { text: '  - Grading Shortcuts: Direct links to enter marks for their assigned subjects.' },
    { text: 'How to use:' },
    { text: '  - Teachers log in and are presented with their tailored portal, bypassing the main admin dashboard for a focused experience.' }
]);

// 12. Pricebook Setup
addTextSlide('12. Pricebook Setup', [
    { text: 'Component: priceBookSetup' },
    { text: '' },
    { text: 'What is it?' },
    { text: 'The financial engine configuration tool.' },
    { text: 'Features:' },
    { text: '  - Class-Specific Architectures: Associates fee structures (Pricebooks) directly to specific classes and academic years.' },
    { text: '  - Product linking: Manages tuition, transport, uniforms, and sports fees.' },
    { text: '  - Dynamic rendering: Feeds the Admission Manager to automatically invoice new students based on these rules.' },
    { text: 'How to use:' },
    { text: '  - Admins configure the fee amounts here before admissions open to ensure automated billing accuracy.' }
]);

// 13. Vikas School Welcome
addTextSlide('13. Welcome Wizard', [
    { text: 'Component: vikasSchoolWelcome' },
    { text: '' },
    { text: 'What is it?' },
    { text: 'The initial onboarding component for administrators and new staff.' },
    { text: 'Features:' },
    { text: '  - Orientation: Provides quick links to training and structural setup (like adding terms/years).' },
    { text: '  - Navigation Guidance: Acts as a splash page before diving into the core Dashboard.' },
    { text: 'How to use:' },
    { text: '  - Accessed from the app launcher homepage to guide users on their first day of system usage.' }
]);

// Final Slide - Impactful Closing
let slideEnd = pres.addSlide();
slideEnd.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '0A2540' } }); // Solid Dark Navy
slideEnd.addText('THANK YOU', { x: 1, y: 2.0, w: 8, h: 1, fontFace: 'Segoe UI', fontSize: 56, bold: true, color: '635BFF', align: 'center', charSpacing: 4 });
slideEnd.addText('VIKAS SCHOOL MANAGEMENT SYSTEM', { x: 1, y: 3.2, w: 8, h: 0.5, fontFace: 'Segoe UI', fontSize: 16, color: 'FFFFFF', align: 'center', letterSpacing: 6 });

// Save
pres.writeFile({ fileName: 'VIKAS_School_System_Presentation_v12.pptx' }).then(fileName => {
    console.log(`created file: ${fileName}`);
});
