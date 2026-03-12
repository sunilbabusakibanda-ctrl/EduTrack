import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getAllStaff        from '@salesforce/apex/SchoolStaffController.getAllStaff';
import getPayrollRecords  from '@salesforce/apex/SchoolStaffController.getPayrollRecords';
import upsertStaff        from '@salesforce/apex/SchoolStaffController.upsertStaff';
import deleteStaff        from '@salesforce/apex/SchoolStaffController.deleteStaff';
import paySalary          from '@salesforce/apex/SchoolStaffController.paySalary';
import processAllPayroll  from '@salesforce/apex/SchoolStaffController.processAllPayroll';

export default class SchoolStaff extends LightningElement {

    /* ── STATE ── */
    @track activeTab            = 'all';
    @track searchTerm           = '';
    @track deptFilter           = '';
    @track statusFilter         = '';
    @track showStaffModal       = false;
    @track showDetailModal      = false;
    @track isEditMode           = false;
    @track selectedStaff        = {};
    @track selectedPayrollMonth = 'Mar 2026';
    @track showToast            = false;
    @track toastMessage         = '';
    @track toastIcon            = '✅';
    @track toastClass           = 'ss-toast toast-success';
    @track isLoading            = false;

    @track formData = this._emptyForm();

    /* ── WIRED DATA ── */
    _wiredStaffResult;
    @wire(getAllStaff)
    wiredStaff(result) {
        this._wiredStaffResult = result;
        if (result.data) {
            this._rawStaffList = result.data.map(s => this._decorate(s));
        } else if (result.error) {
            this._showPlatformToast('error', 'Error', result.error.body?.message || 'Failed to load staff.');
        }
    }

    _wiredPayrollResult;
    @wire(getPayrollRecords, { invoiceMonth: '$selectedPayrollMonth' })
    wiredPayroll(result) {
        this._wiredPayrollResult = result;
        if (result.data) {
            this._rawPayrollList = result.data.map(r => this._decoratePayroll(r));
        } else if (result.error) {
            this._showPlatformToast('error', 'Error', result.error.body?.message || 'Failed to load payroll.');
        }
    }

    _rawStaffList  = [];
    _rawPayrollList = [];

    /* ══════════════════════════════════════════
       GETTERS – TABS & VIEWS
    ══════════════════════════════════════════ */
    get allTabClass()         { return `tab ${this.activeTab === 'all'          ? 'active' : ''}`; }
    get teachingTabClass()    { return `tab ${this.activeTab === 'teaching'     ? 'active' : ''}`; }
    get nonTeachingTabClass() { return `tab ${this.activeTab === 'non-teaching' ? 'active' : ''}`; }
    get salaryTabClass()      { return `tab ${this.activeTab === 'salary'       ? 'active' : ''}`; }

    get isStaffListView() { return this.activeTab !== 'salary'; }
    get isSalaryView()    { return this.activeTab === 'salary'; }
    get isTeachingType()  { return this.formData.staffType === 'Teaching'; }

    get teachingToggleClass()    { return `ss-toggle-btn ${this.formData.staffType === 'Teaching'     ? 'ss-toggle-active' : ''}`; }
    get nonTeachingToggleClass() { return `ss-toggle-btn ${this.formData.staffType === 'Non-Teaching' ? 'ss-toggle-active' : ''}`; }

    get modalTitle()      { return this.isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'; }
    get saveButtonLabel() { return this.isEditMode ? '💾 Update Staff' : '✅ Save Staff'; }

    /* ══════════════════════════════════════════
       GETTERS – COUNTS & TOTALS
    ══════════════════════════════════════════ */
    get totalStaffCount()  { return this._rawStaffList.length; }
    get teachingCount()    { return this._rawStaffList.filter(s => s.StaffType === 'Teaching').length; }
    get nonTeachingCount() { return this._rawStaffList.filter(s => s.StaffType === 'Non-Teaching').length; }
    get paidCount()        { return this._rawPayrollList.filter(r => r.salaryStatus === 'Paid').length; }
    get pendingCount()     { return this._rawPayrollList.filter(r => r.salaryStatus !== 'Paid').length; }

    get totalMonthlySalary() {
        const t = this._rawStaffList.reduce((s, m) =>
            s + Number(m.BasicSalary) + Number(m.Hra) + Number(m.Da) - Number(m.Pf), 0);
        return t >= 100000 ? `₹${(t / 100000).toFixed(1)}L` : `₹${t.toLocaleString('en-IN')}`;
    }
    get totalAnnualSalary() {
        const t = this._rawStaffList.reduce((s, m) =>
            s + Number(m.BasicSalary) + Number(m.Hra) + Number(m.Da) - Number(m.Pf), 0) * 12;
        return t >= 100000 ? `₹${(t / 100000).toFixed(1)}L` : `₹${t.toLocaleString('en-IN')}`;
    }

    get totalAllowances() {
        const val = (n) => { const num = Number(n); return isNaN(num) ? 0 : num; };
        return (val(this.formData.hra) + val(this.formData.da)).toLocaleString('en-IN');
    }
    get computedNetSalary() {
        const val = (n) => { const num = Number(n); return isNaN(num) ? 0 : num; };
        const n = val(this.formData.basicSalary)
                + val(this.formData.hra)
                + val(this.formData.da)
                - val(this.formData.pf);
        return n.toLocaleString('en-IN');
    }

    /* ══════════════════════════════════════════
       GETTERS – FILTERED LISTS
    ══════════════════════════════════════════ */
    get filteredStaff() {
        let list = this._rawStaffList.map(s => ({
            ...s,
            netSalaryFmt: `₹${(Number(s.BasicSalary) + Number(s.Hra) + Number(s.Da) - Number(s.Pf)).toLocaleString('en-IN')}`
        }));
        if (this.activeTab === 'teaching')     list = list.filter(s => s.StaffType === 'Teaching');
        if (this.activeTab === 'non-teaching') list = list.filter(s => s.StaffType === 'Non-Teaching');
        if (this.searchTerm) {
            const t = this.searchTerm.toLowerCase();
            list = list.filter(s =>
                s.Name.toLowerCase().includes(t) ||
                (s.EmployeeId && s.EmployeeId.toLowerCase().includes(t)) ||
                (s.Subject && s.Subject.toLowerCase().includes(t)) ||
                (s.Designation && s.Designation.toLowerCase().includes(t))
            );
        }
        if (this.deptFilter)   list = list.filter(s => s.Department === this.deptFilter);
        if (this.statusFilter) list = list.filter(s => s.Status === this.statusFilter);
        return list;
    }
    get hasFilteredStaff() { return this.filteredStaff.length > 0; }

    get salaryRecords() { return this._rawPayrollList; }

    /* ══════════════════════════════════════════
       HANDLERS – TABS / FILTERS
    ══════════════════════════════════════════ */
    handleTabChange(e)    { this.activeTab    = e.currentTarget.dataset.tab; }
    handleSearchChange(e) { this.searchTerm   = e.target.value; }
    handleDeptFilter(e)   { this.deptFilter   = e.target.value; }
    handleStatusFilter(e) { this.statusFilter = e.target.value; }
    handleMonthChange(e)  { this.selectedPayrollMonth = e.target.value; }

    /* ══════════════════════════════════════════
       HANDLERS – ADD / EDIT / DELETE
    ══════════════════════════════════════════ */
    handleAddStaff() {
        this.isEditMode  = false;
        this.formData    = { ...this._emptyForm() };
        this.showStaffModal = true;
    }

    handleStaffCardClick(e) {
        const id = e.currentTarget.dataset.id;
        const r = this._rawStaffList.find(x => x.id === e.currentTarget.dataset.id);
        if (r) {
            this.selectedStaff = { ...r };
            
            // Map the parsed properties back into the camelCase formData payload object
            this.formData = {
                id            : r.id,
                employeeId    : r.EmployeeId,
                firstName     : r.FirstName,
                lastName      : r.LastName,
                gender        : r.Gender,
                dob           : r.Dob,
                email         : r.Email,
                phone         : r.Phone,
                address       : r.Address,
                designation   : r.Designation,
                department    : r.Department,
                staffType     : r.StaffType,
                subject       : r.Subject,
                qualification : r.Qualification,
                joiningDate   : r.JoiningDate,
                status        : r.Status,
                basicSalary   : r.BasicSalary,
                hra           : r.Hra,
                da            : r.Da,
                pf            : r.Pf,
                accountNumber : r.AccountNumber,
                ifsc          : r.Ifsc
            };

            this.isEditMode      = true;
            this.showStaffModal  = true;
        }
    }

    handleEditFromDetail() {
        this.showDetailModal = false;
        this.isEditMode      = true;
        this.formData        = { ...this.selectedStaff };
        this.showStaffModal  = true;
    }

    async handleDeleteStaff() {
        try {
            this.isLoading = true;
            await deleteStaff({ staffId: this.selectedStaff.id });
            await refreshApex(this._wiredStaffResult);
            this.showDetailModal = false;
            this._showToastMsg('✅', `${this.selectedStaff.name} removed successfully.`, 'success');
        } catch (err) {
            this._showToastMsg('❌', err.body?.message || 'Delete failed.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleCloseModal()        { this.showStaffModal   = false; }
    handleCloseDetail()       { this.showDetailModal  = false; }
    handleModalOverlayClick() { this.showStaffModal   = false; }
    stopPropagation(e)        { e.stopPropagation(); }

    handleStaffTypeChange(e) {
        e.stopPropagation();
        this.formData = { ...this.formData, staffType: e.currentTarget.dataset.type, designation: '', department: '' };
    }

    // Handles BOTH <input oninput> and <select onchange> — reads value from the event target
    handleFormInput(e) {
        const field = e.currentTarget.dataset.field || e.target.dataset.field;
        const value = e.target.value;
        if (field) {
            this.formData = { ...this.formData, [field]: value };
        }
    }

    async handleSaveStaff() {
        // Read values directly from DOM to bypass any LWC binding cache issues
        const allInputs = this.template.querySelectorAll('[data-field]');
        const liveFormData = { ...this.formData };
        allInputs.forEach(el => {
            const field = el.dataset.field;
            if (field && el.value !== undefined && el.value !== null && !el.readOnly) {
                liveFormData[field] = el.value;
            }
        });
        this.formData = { ...liveFormData };

        const { firstName, lastName, email, phone, basicSalary } = this.formData;

        if (!firstName || !firstName.trim()) {
            this._showToastMsg('⚠️', 'First Name is required.', 'warning'); return;
        }
        if (!lastName || !lastName.trim()) {
            this._showToastMsg('⚠️', 'Last Name is required.', 'warning'); return;
        }
        if (!email || !email.trim()) {
            this._showToastMsg('⚠️', 'Email is required.', 'warning'); return;
        }
        if (!phone || !phone.trim()) {
            this._showToastMsg('⚠️', 'Phone is required.', 'warning'); return;
        }
        if (!basicSalary || Number(basicSalary) <= 0) {
            this._showToastMsg('⚠️', 'Please enter a valid basic salary.', 'warning'); return;
        }

        // Build a clean plain object — avoids Apex receiving Proxy wrapper
        const payload = {
            id            : this.formData.id            || null,
            EmployeeId    : this.formData.employeeId    || '',
            FirstName     : (this.formData.firstName    || '').trim(),
            LastName      : (this.formData.lastName     || '').trim(),
            Gender        : this.formData.gender        || '',
            Dob           : this.formData.dob           || '',
            Email         : (this.formData.email        || '').trim(),
            Phone         : (this.formData.phone        || '').trim(),
            Address       : this.formData.address       || '',
            StaffType     : this.formData.staffType     || 'Teaching',
            Designation   : this.formData.designation   || '',
            Department    : this.formData.department    || '',
            Subject       : this.formData.subject       || '',
            Qualification : this.formData.qualification || '',
            JoiningDate   : this.formData.joiningDate   || '',
            Status        : this.formData.status        || 'Active',
            BasicSalary   : Number(this.formData.basicSalary) || 0,
            Hra           : Number(this.formData.hra)          || 0,
            Da            : Number(this.formData.da)           || 0,
            Pf            : Number(this.formData.pf)           || 0,
            AccountNumber : this.formData.accountNumber || '',
            Ifsc          : this.formData.ifsc          || ''
        };

        try {
            this.isLoading = true;
            console.log('Upserting staff with payload:', JSON.stringify(payload));
            await upsertStaff({ jsonData: JSON.stringify(payload) });
            await refreshApex(this._wiredStaffResult);
            this.showStaffModal = false;
            const msg = this.isEditMode
                ? `${payload.firstName} ${payload.lastName} updated successfully!`
                : `${payload.firstName} ${payload.lastName} added to staff directory!`;
            this._showToastMsg('✅', msg, 'success');
        } catch (err) {
            console.error('Error in upsertStaff:', err);
            const errMsg = err.body?.message || err.message || 'Save failed. Please try again.';
            this._showToastMsg('❌', errMsg, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /* ══════════════════════════════════════════
       HANDLERS – PAYROLL
    ══════════════════════════════════════════ */
    async handlePaySalary(e) {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const rec = this._rawPayrollList.find(x => x.staffId === id);
        if (!rec) return;

        if (rec.salaryStatus === 'Paid') {
            this._showToastMsg('📄', `Payslip downloaded for ${rec.staffName}.`, 'success');
            return;
        }

        try {
            this.isLoading = true;
            await paySalary({ staffId: id, invoiceMonth: this.selectedPayrollMonth });
            await refreshApex(this._wiredPayrollResult);
            this._showToastMsg('💳', `Salary paid to ${rec.staffName} for ${this.selectedPayrollMonth}.`, 'success');
        } catch (err) {
            this._showToastMsg('❌', err.body?.message || 'Payment failed.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async handleProcessPayroll() {
        try {
            this.isLoading = true;
            await processAllPayroll({ invoiceMonth: this.selectedPayrollMonth });
            await refreshApex(this._wiredPayrollResult);
            this._showToastMsg('⚡', `All salaries processed for ${this.selectedPayrollMonth}!`, 'success');
        } catch (err) {
            this._showToastMsg('❌', err.body?.message || 'Payroll processing failed.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleGeneratePayslips() {
        this._showToastMsg('📄', `Payslips generated for ${this.selectedPayrollMonth}!`, 'success');
    }

    handleExportStaff() {
        this._showToastMsg('📤', 'Staff data exported successfully!', 'success');
    }

    /* ══════════════════════════════════════════
       PRIVATE HELPERS
    ══════════════════════════════════════════ */
    _emptyForm() {
        return {
            id: null,
            employeeId: '', firstName: '', lastName: '', gender: '', dob: '',
            email: '', phone: '', address: '',
            designation: '', department: '', staffType: 'Teaching',
            subject: '', qualification: '', joiningDate: '', status: 'Active',
            basicSalary: 0, hra: 0, da: 0, pf: 0,
            accountNumber: '', ifsc: ''
        };
    }

    _colorVariants = [
        { av: 'ss-avatar av-blue',   band: 'scard-band band-blue' },
        { av: 'ss-avatar av-purple', band: 'scard-band band-purple' },
        { av: 'ss-avatar av-green',  band: 'scard-band band-green' },
        { av: 'ss-avatar av-orange', band: 'scard-band band-orange' }
    ];

    _decorate(s, idx) {
        const v = this._colorVariants[(idx || 0) % this._colorVariants.length];
        const isTeaching = s.StaffType === 'Teaching';
        const statusMap  = {
            'Active'   : { badge: 'badge-status badge-active',  dot: 'ss-status-dot dot-active' },
            'On Leave' : { badge: 'badge-status badge-pending', dot: 'ss-status-dot dot-leave' },
            'Inactive' : { badge: 'badge-status badge-inactive',dot: 'ss-status-dot dot-inactive' }
        };
        const sm = statusMap[s.Status] || statusMap['Active'];
        const fi = (s.FirstName || '').charAt(0).toUpperCase();
        const li = (s.LastName  || '').charAt(0).toUpperCase();
        return {
            ...s,
            
            // Re-mapping important lowercase wrapper fields for the HTML template view
            employeeId     : s.EmployeeId,
            name           : s.Name || `${s.FirstName} ${s.LastName}`,
            designation    : s.Designation,
            department     : s.Department,
            email          : s.Email,
            phone          : s.Phone,
            subject        : s.Subject,
            joiningDate    : s.JoiningDate,
            staffType      : s.StaffType,
            status         : s.Status,

            initials       : fi + li,
            avatarClass    : v.av,
            cardBandClass  : v.band,
            typeBadgeClass : isTeaching ? 'badge-status badge-active' : 'badge-status badge-inactive',
            statusBadgeClass: sm.badge,
            statusDotClass : sm.dot,
            netSalaryFmt   : `₹${(Number(s.BasicSalary)+Number(s.Hra)+Number(s.Da)-Number(s.Pf)).toLocaleString('en-IN')}`
        };
    }

    _decoratePayroll(r) {
        const isTeaching = r.staffType === 'Teaching';
        const paid       = r.salaryStatus === 'Paid';
        const fi = (r.staffName || '').split(' ')[0]?.charAt(0).toUpperCase() || '';
        const li = (r.staffName || '').split(' ')[1]?.charAt(0).toUpperCase() || '';
        const v  = this._colorVariants[0];  // default; pass index if needed
        return {
            ...r,
            id             : r.staffId,    // for data-id binding on Pay button
            initials       : fi + li,
            avatarClass    : v.av,
            typeBadgeClass : isTeaching ? 'badge-status badge-active' : 'badge-status badge-inactive',
            basicSalary    : `₹${Number(r.basicSalary).toLocaleString('en-IN')}`,
            allowances     : `₹${Number(r.allowances).toLocaleString('en-IN')}`,
            deductions     : `₹${Number(r.deductions).toLocaleString('en-IN')}`,
            netSalary      : `₹${Number(r.netSalary).toLocaleString('en-IN')}`,
            salaryStatusClass: paid ? 'badge-status badge-paid' : 'badge-status badge-pending',
            actionLabel    : paid ? '📄 Payslip' : '💳 Pay Now',
            actionBtnClass : paid ? 'ss-action-btn btn-slip' : 'ss-action-btn btn-pay'
        };
    }

    _showToastMsg(icon, msg, type) {
        this.toastIcon    = icon;
        this.toastMessage = msg;
        this.toastClass   = `ss-toast toast-${type}`;
        this.showToast    = true;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => { this.showToast = false; }, 3500);
    }

    _showPlatformToast(variant, title, message) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}