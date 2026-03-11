import { LightningElement, track } from 'lwc';

export default class Schoolstaff extends LightningElement {

    @track activeTab = 'all';
    @track searchTerm = '';
    @track deptFilter = '';
    @track statusFilter = '';
    @track showStaffModal = false;
    @track showDetailModal = false;
    @track isEditMode = false;
    @track selectedStaff = {};
    @track selectedPayrollMonth = 'Mar 2026';
    @track showToast = false;
    @track toastMessage = '';
    @track toastClass = 'v3-toast toast-success';

    @track formData = this.emptyForm();

    @track staffList = [
        {
            id: 'STF-001', employeeId: 'STF-001',
            firstName: 'Ramesh', lastName: 'Kumar', name: 'Ramesh Kumar', initials: 'RK',
            gender: 'Male', dob: '1985-06-15',
            email: 'ramesh.kumar@school.com', phone: '+91 98765 43210',
            address: '12 MG Road, Kurnool, AP',
            designation: 'Senior Teacher', department: 'Mathematics',
            staffType: 'Teaching', subject: 'Mathematics', qualification: 'M.Sc, B.Ed',
            joiningDate: '2015-07-01', status: 'Active',
            basicSalary: 40000, hra: 8000, da: 4000, pf: 3000,
            accountNumber: '1234567890', ifsc: 'SBI0001234', salaryStatus: 'Paid',
            tabClass: 'rc-tab tab-forest',
            monogramClass: 'v3-monogram mono-forest',
            typeLabelClass: 'v3-label label-teaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active'
        },
        {
            id: 'STF-002', employeeId: 'STF-002',
            firstName: 'Priya', lastName: 'Sharma', name: 'Priya Sharma', initials: 'PS',
            gender: 'Female', dob: '1990-03-22',
            email: 'priya.sharma@school.com', phone: '+91 87654 32109',
            address: '45 Nehru Nagar, Kurnool, AP',
            designation: 'Teacher', department: 'Science',
            staffType: 'Teaching', subject: 'Physics', qualification: 'B.Sc, B.Ed',
            joiningDate: '2018-06-15', status: 'Active',
            basicSalary: 32000, hra: 6000, da: 3000, pf: 2400,
            accountNumber: '9876543210', ifsc: 'HDFC0002345', salaryStatus: 'Pending',
            tabClass: 'rc-tab tab-gold',
            monogramClass: 'v3-monogram mono-gold',
            typeLabelClass: 'v3-label label-teaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active'
        },
        {
            id: 'STF-003', employeeId: 'STF-003',
            firstName: 'Suresh', lastName: 'Babu', name: 'Suresh Babu', initials: 'SB',
            gender: 'Male', dob: '1978-11-10',
            email: 'suresh.babu@school.com', phone: '+91 76543 21098',
            address: '8 Gandhi Colony, Kurnool, AP',
            designation: 'Accountant', department: 'Finance',
            staffType: 'Non-Teaching', subject: '', qualification: 'B.Com',
            joiningDate: '2012-01-10', status: 'Active',
            basicSalary: 25000, hra: 4000, da: 2000, pf: 1800,
            accountNumber: '5678901234', ifsc: 'ICIC0003456', salaryStatus: 'Paid',
            tabClass: 'rc-tab tab-clay',
            monogramClass: 'v3-monogram mono-clay',
            typeLabelClass: 'v3-label label-nonteaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active'
        },
        {
            id: 'STF-004', employeeId: 'STF-004',
            firstName: 'Lakshmi', lastName: 'Devi', name: 'Lakshmi Devi', initials: 'LD',
            gender: 'Female', dob: '1992-08-05',
            email: 'lakshmi.devi@school.com', phone: '+91 65432 10987',
            address: '23 Srinagar Colony, Kurnool, AP',
            designation: 'Teacher', department: 'English',
            staffType: 'Teaching', subject: 'English', qualification: 'M.A, B.Ed',
            joiningDate: '2020-07-20', status: 'On Leave',
            basicSalary: 30000, hra: 5500, da: 2500, pf: 2200,
            accountNumber: '3456789012', ifsc: 'AXIS0004567', salaryStatus: 'Pending',
            tabClass: 'rc-tab tab-rust',
            monogramClass: 'v3-monogram mono-rust',
            typeLabelClass: 'v3-label label-teaching',
            statusDotClass: 'v3-dot dot-leave',
            statusLabelClass: 'v3-label label-leave'
        },
        {
            id: 'STF-005', employeeId: 'STF-005',
            firstName: 'Raju', lastName: 'Patel', name: 'Raju Patel', initials: 'RP',
            gender: 'Male', dob: '1980-02-28',
            email: 'raju.patel@school.com', phone: '+91 54321 09876',
            address: '67 Sundaraiah Nagar, Kurnool, AP',
            designation: 'Security Guard', department: 'Security',
            staffType: 'Non-Teaching', subject: '', qualification: '10th Pass',
            joiningDate: '2016-03-01', status: 'Active',
            basicSalary: 15000, hra: 2000, da: 1000, pf: 900,
            accountNumber: '7890123456', ifsc: 'PNB0005678', salaryStatus: 'Paid',
            tabClass: 'rc-tab tab-forest',
            monogramClass: 'v3-monogram mono-forest',
            typeLabelClass: 'v3-label label-nonteaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active'
        },
        {
            id: 'STF-006', employeeId: 'STF-006',
            firstName: 'Anjali', lastName: 'Rao', name: 'Anjali Rao', initials: 'AR',
            gender: 'Female', dob: '1988-12-01',
            email: 'anjali.rao@school.com', phone: '+91 43210 98765',
            address: '34 Laxmi Nagar, Kurnool, AP',
            designation: 'Teacher', department: 'Social Studies',
            staffType: 'Teaching', subject: 'Social Studies', qualification: 'M.A, B.Ed',
            joiningDate: '2019-06-01', status: 'Active',
            basicSalary: 28000, hra: 5000, da: 2000, pf: 2000,
            accountNumber: '2345678901', ifsc: 'BOI0006789', salaryStatus: 'Paid',
            tabClass: 'rc-tab tab-gold',
            monogramClass: 'v3-monogram mono-gold',
            typeLabelClass: 'v3-label label-teaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active'
        }
    ];

    emptyForm() {
        return {
            employeeId: '', firstName: '', lastName: '', gender: '', dob: '',
            email: '', phone: '', address: '',
            designation: '', department: '', staffType: 'Teaching',
            subject: '', qualification: '', joiningDate: '',
            basicSalary: 0, hra: 0, da: 0, pf: 0,
            accountNumber: '', ifsc: ''
        };
    }

    // ── COMPUTED WIDTHS FOR SCOREBAND BARS ──
    get teachingBarStyle() {
        const pct = this.staffList.length ? Math.round((this.teachingCount / this.staffList.length) * 100) : 0;
        return `width:${pct}%;background:var(--gold)`;
    }
    get nonTeachingBarStyle() {
        const pct = this.staffList.length ? Math.round((this.nonTeachingCount / this.staffList.length) * 100) : 0;
        return `width:${pct}%;background:var(--clay)`;
    }
    get paidBarStyle() {
        const pct = this.staffList.length ? Math.round((this.paidCount / this.staffList.length) * 100) : 0;
        return `width:${pct}%;background:var(--forest)`;
    }
    get pendingBarStyle() {
        const pct = this.staffList.length ? Math.round((this.pendingCount / this.staffList.length) * 100) : 0;
        return `width:${pct}%;background:var(--rust)`;
    }

    // ── TAB CLASSES ──
    get allSegClass()          { return `seg-btn ${this.activeTab === 'all' ? 'seg-active' : ''}`; }
    get teachingSegClass()     { return `seg-btn ${this.activeTab === 'teaching' ? 'seg-active' : ''}`; }
    get nonTeachingSegClass()  { return `seg-btn ${this.activeTab === 'non-teaching' ? 'seg-active' : ''}`; }
    get salarySegClass()       { return `seg-btn ${this.activeTab === 'salary' ? 'seg-active' : ''}`; }

    get isStaffListView() { return this.activeTab !== 'salary'; }
    get isSalaryView()    { return this.activeTab === 'salary'; }
    get isTeachingType()  { return this.formData.staffType === 'Teaching'; }

    get teachingToggleClass()    { return `v3-toggle-btn ${this.formData.staffType === 'Teaching' ? 'vtb-active' : ''}`; }
    get nonTeachingToggleClass() { return `v3-toggle-btn ${this.formData.staffType === 'Non-Teaching' ? 'vtb-active' : ''}`; }

    get modalTitle()     { return this.isEditMode ? 'Edit Staff Member' : 'New Staff Member'; }
    get modalEyebrow()   { return this.isEditMode ? 'EDITING RECORD' : 'NEW RECORD'; }
    get saveButtonLabel(){ return this.isEditMode ? 'Update Record' : 'Save Member'; }

    // ── COUNTS ──
    get totalStaffCount()  { return this.staffList.length; }
    get teachingCount()    { return this.staffList.filter(s => s.staffType === 'Teaching').length; }
    get nonTeachingCount() { return this.staffList.filter(s => s.staffType === 'Non-Teaching').length; }
    get paidCount()        { return this.staffList.filter(s => s.salaryStatus === 'Paid').length; }
    get pendingCount()     { return this.staffList.filter(s => s.salaryStatus !== 'Paid').length; }

    get totalMonthlySalary() {
        const t = this.staffList.reduce((s, m) =>
            s + Number(m.basicSalary) + Number(m.hra) + Number(m.da) - Number(m.pf), 0);
        return t >= 100000 ? `₹${(t / 100000).toFixed(1)}L` : `₹${t.toLocaleString()}`;
    }

    get computedNetSalary() {
        const n = Number(this.formData.basicSalary || 0)
            + Number(this.formData.hra || 0)
            + Number(this.formData.da || 0)
            - Number(this.formData.pf || 0);
        return n.toLocaleString();
    }

    // ── FILTERED LIST ──
    get filteredStaff() {
        let list = this.staffList.map(s => ({
            ...s,
            netSalaryFmt: `₹${(Number(s.basicSalary) + Number(s.hra) + Number(s.da) - Number(s.pf)).toLocaleString()}`
        }));
        if (this.activeTab === 'teaching')     list = list.filter(s => s.staffType === 'Teaching');
        if (this.activeTab === 'non-teaching') list = list.filter(s => s.staffType === 'Non-Teaching');
        if (this.searchTerm) {
            const t = this.searchTerm.toLowerCase();
            list = list.filter(s =>
                s.name.toLowerCase().includes(t) ||
                s.employeeId.toLowerCase().includes(t) ||
                (s.subject && s.subject.toLowerCase().includes(t)) ||
                s.designation.toLowerCase().includes(t)
            );
        }
        if (this.deptFilter)   list = list.filter(s => s.department === this.deptFilter);
        if (this.statusFilter) list = list.filter(s => s.status === this.statusFilter);
        return list;
    }
    get hasFilteredStaff() { return this.filteredStaff.length > 0; }

    // ── SALARY RECORDS ──
    get salaryRecords() {
        return this.staffList.map(s => {
            const net = Number(s.basicSalary) + Number(s.hra) + Number(s.da) - Number(s.pf);
            const paid = s.salaryStatus === 'Paid';
            return {
                id: s.id, name: s.name, initials: s.initials,
                designation: s.designation, staffType: s.staffType,
                monogramClass: s.monogramClass,
                typeLabelClass: s.typeLabelClass,
                basicSalary:  `₹${Number(s.basicSalary).toLocaleString()}`,
                allowances:   `₹${(Number(s.hra) + Number(s.da)).toLocaleString()}`,
                deductions:   `₹${Number(s.pf).toLocaleString()}`,
                netSalary:    `₹${net.toLocaleString()}`,
                salaryStatus: s.salaryStatus || 'Pending',
                salaryStatusClass: paid ? 'v3-label label-paid' : 'v3-label label-pending',
                actionLabel:  paid ? 'Download Slip' : 'Pay Salary',
                actionBtnClass: paid ? 'ledger-action-btn btn-slip' : 'ledger-action-btn btn-pay'
            };
        });
    }

    // ── HANDLERS ──
    handleTabChange(e)      { this.activeTab = e.currentTarget.dataset.tab; }
    handleSearchChange(e)   { this.searchTerm = e.target.value; }
    handleDeptFilter(e)     { this.deptFilter = e.target.value; }
    handleStatusFilter(e)   { this.statusFilter = e.target.value; }
    handleMonthChange(e)    { this.selectedPayrollMonth = e.target.value; }

    handleAddStaff() {
        this.isEditMode = false;
        this.formData = { ...this.emptyForm(), employeeId: this.genId() };
        this.showStaffModal = true;
    }

    handleStaffCardClick(e) {
        const id = e.currentTarget.dataset.id;
        const s = this.staffList.find(x => x.id === id);
        if (!s) return;
        this.selectedStaff = {
            ...s,
            basicSalaryFmt:  `₹${Number(s.basicSalary).toLocaleString()}`,
            allowancesFmt:   `₹${(Number(s.hra) + Number(s.da)).toLocaleString()}`,
            deductionsFmt:   `₹${Number(s.pf).toLocaleString()}`,
            netSalaryFmt:    `₹${(Number(s.basicSalary)+Number(s.hra)+Number(s.da)-Number(s.pf)).toLocaleString()}`
        };
        this.showDetailModal = true;
    }

    handleEditFromDetail() {
        this.showDetailModal = false;
        this.isEditMode = true;
        this.formData = { ...this.selectedStaff };
        this.showStaffModal = true;
    }

    handleDeleteStaff() {
        this.staffList = this.staffList.filter(s => s.id !== this.selectedStaff.id);
        this.showDetailModal = false;
        this.toast(`${this.selectedStaff.name} has been removed.`, 'success');
    }

    handleCloseModal()        { this.showStaffModal = false; }
    handleCloseDetail()       { this.showDetailModal = false; }
    handleModalOverlayClick() { this.showStaffModal = false; }
    stopPropagation(e)        { e.stopPropagation(); }

    handleStaffTypeChange(e) {
        e.stopPropagation();
        this.formData = { ...this.formData, staffType: e.currentTarget.dataset.type, designation: '', department: '' };
    }

    handleFormInput(e) {
        this.formData = { ...this.formData, [e.currentTarget.dataset.field]: e.target.value };
    }

    handleSaveStaff() {
        const { firstName, lastName, email, phone, basicSalary } = this.formData;
        if (!firstName || !lastName || !email || !phone) {
            this.toast('Please fill all required fields.', 'warning'); return;
        }
        if (!basicSalary || Number(basicSalary) <= 0) {
            this.toast('Please enter a valid basic salary.', 'warning'); return;
        }

        const fullName = `${firstName} ${lastName}`;
        const initials = (firstName[0] + lastName[0]).toUpperCase();
        const palettes = [
            { tab: 'rc-tab tab-forest', mono: 'v3-monogram mono-forest' },
            { tab: 'rc-tab tab-gold',   mono: 'v3-monogram mono-gold' },
            { tab: 'rc-tab tab-clay',   mono: 'v3-monogram mono-clay' },
            { tab: 'rc-tab tab-rust',   mono: 'v3-monogram mono-rust' },
        ];
        const p = palettes[this.staffList.length % palettes.length];
        const isT = this.formData.staffType === 'Teaching';

        const rec = {
            ...this.formData,
            id: this.isEditMode ? this.formData.id : this.formData.employeeId,
            name: fullName, initials,
            tabClass: p.tab,
            monogramClass: p.mono,
            typeLabelClass: isT ? 'v3-label label-teaching' : 'v3-label label-nonteaching',
            statusDotClass: 'v3-dot dot-active',
            statusLabelClass: 'v3-label label-active',
            status: 'Active', salaryStatus: 'Pending'
        };

        if (this.isEditMode) {
            this.staffList = this.staffList.map(s => s.id === rec.id ? rec : s);
            this.toast(`${fullName}'s record has been updated.`, 'success');
        } else {
            this.staffList = [...this.staffList, rec];
            this.toast(`${fullName} added to staff directory.`, 'success');
        }
        this.showStaffModal = false;
    }

    handlePaySalary(e) {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const s = this.staffList.find(x => x.id === id);
        if (!s) return;
        if (s.salaryStatus === 'Paid') {
            this.toast(`Payslip for ${s.name} downloaded.`, 'success'); return;
        }
        this.staffList = this.staffList.map(x => x.id === id ? { ...x, salaryStatus: 'Paid' } : x);
        this.toast(`Salary disbursed to ${s.name}.`, 'success');
    }

    handleProcessPayroll() {
        this.staffList = this.staffList.map(s => ({ ...s, salaryStatus: 'Paid' }));
        this.toast(`All salaries processed for ${this.selectedPayrollMonth}.`, 'success');
    }

    handleGeneratePayslips() {
        this.toast(`Payslips generated for ${this.selectedPayrollMonth}.`, 'success');
    }

    handleExportStaff() {
        this.toast('Staff directory exported successfully.', 'success');
    }

    genId() {
        return `STF-${String(this.staffList.length + 1).padStart(3, '0')}`;
    }

    toast(msg, type) {
        this.toastMessage = msg;
        this.toastClass = `v3-toast toast-${type}`;
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 3800);
    }
}