import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getClasses               from '@salesforce/apex/EnterMarksController.getClasses';
import getSubjects              from '@salesforce/apex/EnterMarksController.getSubjects';
import getExamTypes             from '@salesforce/apex/EnterMarksController.getExamTypes';
import getStudentsForMarksEntry from '@salesforce/apex/EnterMarksController.getStudentsForMarksEntry';
import saveMarks                from '@salesforce/apex/EnterMarksController.saveMarks';

export default class EnterMarks extends LightningElement {
    @api teacherId;
    @api maxMarks = 100;

    @track loading           = false;
    @track selectedClass     = '';
    @track selectedSubject   = '';
    @track selectedExam      = '';
    @track classOptions      = [];
    @track subjectOptions    = [];
    @track examOptions       = [];
    @track studentsList      = [];
    @track showStudentsList  = false;
    @track showNoDataMessage = false;
    @track noDataMessage     = '';

    allSubjects = [];

    // ─── Statistics ───────────────────────────────────────────────
    get classAverage() {
        const students = this.studentsList.filter(s => s.obtainedMarks !== '' && s.obtainedMarks !== null && !isNaN(s.obtainedMarks));
        if (!students.length) return '0%';
        const total = students.reduce((sum, s) => sum + parseFloat(s.obtainedMarks), 0);
        return ((total / students.length / this.maxMarks) * 100).toFixed(1) + '%';
    }

    get highestMarks() {
        const students = this.studentsList.filter(s => s.obtainedMarks !== '' && s.obtainedMarks !== null && !isNaN(s.obtainedMarks));
        if (!students.length) return '0/' + this.maxMarks;
        return Math.max(...students.map(s => parseFloat(s.obtainedMarks))) + '/' + this.maxMarks;
    }

    get studentsEntered() {
        const count = this.studentsList.filter(s => s.obtainedMarks !== '' && s.obtainedMarks !== null).length;
        return count + '/' + this.studentsList.length;
    }

    get isSubjectDisabled() { return !this.selectedClass; }
    get isExamDisabled()    { return !this.selectedSubject; }
    get isSaveDisabled()    { return this.loading || !this.hasValidMarks(); }

    get selectedClassLabel() {
        const o = this.classOptions.find(opt => opt.value === this.selectedClass);
        return o ? o.label : '';
    }
    get selectedSubjectLabel() {
        const o = this.subjectOptions.find(opt => opt.value === this.selectedSubject);
        return o ? o.label : '';
    }
    get selectedExamLabel() {
        const o = this.examOptions.find(opt => opt.value === this.selectedExam);
        return o ? o.label : '';
    }

    // ─── Lifecycle ────────────────────────────────────────────────
    async connectedCallback() {
        await this.loadInitialData();
    }

    // ─── Data loading ─────────────────────────────────────────────
    async loadInitialData() {
        this.loading = true;
        try {
            await Promise.all([this.loadClasses(), this.loadSubjects(), this.loadExamTypes()]);
        } catch (error) {
            this.handleError('Failed to load initial data', error);
        } finally {
            this.loading = false;
        }
    }

    async loadClasses() {
        const classes = await getClasses();
        this.classOptions = (classes || []).map(cls => ({
            label: cls.label,
            value: cls.value   // Salesforce ID of Class__c record
        }));
    }

    async loadSubjects() {
        const subjects = await getSubjects();
        this.allSubjects = subjects || [];
    }

    async loadExamTypes() {
        const exams = await getExamTypes();
        this.examOptions = (exams || []).map(exam => ({ label: exam, value: exam }));
    }

    async loadStudents() {
        if (!this.selectedClass || !this.selectedSubject || !this.selectedExam) return;

        this.loading = true;
        this.showStudentsList  = false;
        this.showNoDataMessage = false;

        try {
            // Resolve subject name from stored allSubjects list
            const selectedSubj = this.allSubjects.find(
                s => (s.id || s.Id) === this.selectedSubject
            );
            const subjectName = selectedSubj ? (selectedSubj.name || selectedSubj.Name) : '';

            console.log('loadStudents → classId:', this.selectedClass, '| subjectName:', subjectName, '| examType:', this.selectedExam);

            const students = await getStudentsForMarksEntry({
                classId:     this.selectedClass,   // Salesforce ID of Class__c
                subjectName: subjectName,
                examType:    this.selectedExam
            });

            if (students && students.length > 0) {
                this.studentsList = students.map(student => {
                    const marks = student.hasMarks ? student.obtainedMarks : '';
                    const gradeData = this.calculateGrade(marks);
                    return {
                        Id:             student.studentId,
                        Name:           student.name,
                        Roll_Number__c: student.rollNumber,
                        avatar:         this.generateAvatar(student.name),
                        obtainedMarks:  marks,
                        examId:         student.examId || null,
                        hasMarks:       student.hasMarks || false,
                        grade:          gradeData.grade,
                        gradeClass:     gradeData.gradeClass
                    };
                });
                this.showStudentsList = true;
            } else {
                this.showNoDataMessage = true;
                this.noDataMessage = 'No students found for the selected class.';
            }
        } catch (error) {
            this.handleError('Failed to load students', error);
        } finally {
            this.loading = false;
        }
    }

    // ─── Event handlers ───────────────────────────────────────────
    handleClassChange(event) {
        this.selectedClass   = event.detail.value;
        this.selectedSubject = '';
        this.selectedExam    = '';
        this.showStudentsList  = false;
        this.showNoDataMessage = false;
        this.updateSubjectOptions();
    }

    updateSubjectOptions() {
        this.subjectOptions = (this.allSubjects || []).map(subj => ({
            label: subj.name || subj.Name,
            value: subj.id   || subj.Id
        }));
    }

    handleSubjectChange(event) {
        this.selectedSubject = event.detail.value;
        this.selectedExam    = '';
        this.showStudentsList  = false;
        this.showNoDataMessage = false;
    }

    handleExamChange(event) {
        this.selectedExam = event.detail.value;
        this.showStudentsList  = false;
        this.showNoDataMessage = false;
        if (this.selectedExam && this.selectedClass && this.selectedSubject) {
            this.loadStudents();
        }
    }

    handleIncrementMarks(event) {
        this.adjustMarks(event.currentTarget.dataset.studentId, 1);
    }

    handleDecrementMarks(event) {
        this.adjustMarks(event.currentTarget.dataset.studentId, -1);
    }

    adjustMarks(studentId, delta) {
        this.studentsList = this.studentsList.map(student => {
            if (student.Id !== studentId) return student;
            let val = parseFloat(student.obtainedMarks) || 0;
            val = Math.min(Math.max(val + delta, 0), this.maxMarks);
            const gradeData = this.calculateGrade(val);
            return { ...student, obtainedMarks: val, grade: gradeData.grade, gradeClass: gradeData.gradeClass };
        });
    }

    handleMarksChange(event) {
        const studentId = event.target.dataset.studentId;
        const marks     = event.detail.value;

        if (marks !== '' && (marks < 0 || marks > this.maxMarks)) {
            this.showToast('Invalid Marks', `Marks must be between 0 and ${this.maxMarks}`, 'warning');
            return;
        }

        this.studentsList = this.studentsList.map(student => {
            if (student.Id !== studentId) return student;
            const gradeData = this.calculateGrade(marks);
            return { ...student, obtainedMarks: marks, grade: gradeData.grade, gradeClass: gradeData.gradeClass };
        });
    }

    // ─── Save marks ───────────────────────────────────────────────
    async handleSaveMarks() {
        if (!this.validateMarks()) {
            this.showToast('Validation Error', 'Please enter valid marks for at least one student', 'error');
            return;
        }

        this.loading = true;
        try {
            /*
             * ✅ CRITICAL FIX:
             *    obtainedMarks is sent as a plain INTEGER.
             *    When Apex receives Map<String,Object>, JSON integers deserialize
             *    as Long on 64-bit, which safeToDecimal() handles on the Apex side.
             *    We also guard here with Math.round() so no floats are sent.
             */
            const marksDataList = this.studentsList
                .filter(s => s.obtainedMarks !== '' && s.obtainedMarks !== null && s.obtainedMarks !== undefined)
                .map(student => ({
                    studentId:     student.Id,                            // String (ID)
                    subjectId:     this.selectedSubject,                  // String (synthetic SUBJ001 etc.)
                    obtainedMarks: Math.round(parseFloat(student.obtainedMarks)), // ✅ Integer
                    maxMarks:      Math.round(this.maxMarks),             // ✅ Integer
                    examId:        student.examId || null                 // String | null
                }));

            console.log('Saving marks:', JSON.stringify(marksDataList));

            const result = await saveMarks({
                studentMarksDataList: marksDataList,
                examType:  this.selectedExam,
                classId:   this.selectedClass,     // Salesforce ID of Class__c
                teacherId: this.teacherId || null
            });

            this.showToast('Success', result || 'Marks saved successfully!', 'success');
            await this.loadStudents(); // Refresh to show updated marks

        } catch (error) {
            this.handleError('Failed to save marks', error);
        } finally {
            this.loading = false;
        }
    }

    handleCancel() { this.resetForm(); }
    handleBack()   { this.dispatchEvent(new CustomEvent('back')); }

    // ─── Helpers ──────────────────────────────────────────────────
    calculateGrade(marks) {
        if (marks === '' || marks === null || marks === undefined) return { grade: '', gradeClass: '' };
        const pct = (parseFloat(marks) / this.maxMarks) * 100;
        if (isNaN(pct)) return { grade: '', gradeClass: '' };

        let grade, suffix;
        if      (pct >= 90) { grade = 'A+'; suffix = 'grade-a-plus'; }
        else if (pct >= 80) { grade = 'A';  suffix = 'grade-a'; }
        else if (pct >= 70) { grade = 'B';  suffix = 'grade-b'; }
        else if (pct >= 60) { grade = 'C';  suffix = 'grade-c'; }
        else if (pct >= 50) { grade = 'D';  suffix = 'grade-d'; }
        else if (pct >= 35) { grade = 'E';  suffix = 'grade-e'; }
        else                { grade = 'F';  suffix = 'grade-f'; }

        return { grade, gradeClass: 'grade-badge ' + suffix };
    }

    validateMarks() {
        const hasAny = this.studentsList.some(s => s.obtainedMarks !== '' && s.obtainedMarks !== null);
        if (!hasAny) return false;
        return this.studentsList.every(s => {
            if (s.obtainedMarks === '' || s.obtainedMarks === null) return true;
            const v = parseFloat(s.obtainedMarks);
            return !isNaN(v) && v >= 0 && v <= this.maxMarks;
        });
    }

    hasValidMarks() {
        return this.studentsList.length > 0 &&
               this.studentsList.some(s => s.obtainedMarks !== '' && s.obtainedMarks !== null);
    }

    resetForm() {
        this.selectedClass     = '';
        this.selectedSubject   = '';
        this.selectedExam      = '';
        this.subjectOptions    = [];
        this.studentsList      = [];
        this.showStudentsList  = false;
        this.showNoDataMessage = false;
    }

    generateAvatar(name) {
        if (!name) return '👤';
        return name.split(' ').filter(w => w.length > 0).map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    handleError(title, error) {
        console.error(title, error);
        const message = error.body?.message || error.message || 'An unknown error occurred';
        this.showToast(title, message, 'error');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}