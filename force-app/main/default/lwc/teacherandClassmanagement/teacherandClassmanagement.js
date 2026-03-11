import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getAcademicYears           from '@salesforce/apex/ClassManagementController.getAcademicYears';
import getAllClasses               from '@salesforce/apex/ClassManagementController.getAllClasses';
import getAllSections              from '@salesforce/apex/ClassManagementController.getAllSections';
import getAllSubjects              from '@salesforce/apex/ClassManagementController.getAllSubjects';
import getTeachersForSubject      from '@salesforce/apex/ClassManagementController.getTeachersForSubject';
import createClassSection         from '@salesforce/apex/ClassManagementController.createClassSection';
import createTeacherWithSkills    from '@salesforce/apex/ClassManagementController.createTeacherWithSkills';
import getSkillLevelOptions       from '@salesforce/apex/ClassManagementController.getSkillLevelOptions';
import checkDuplicateClassSection from '@salesforce/apex/ClassManagementController.checkDuplicateClassSection';
import getPeriodTimings           from '@salesforce/apex/ClassManagementController.getPeriodTimings';
import AVATAR_IMG from '@salesforce/resourceUrl/avatarImg';

// Workload Apex
import getWorkloadSummary      from '@salesforce/apex/ClassManagementController.getWorkloadSummary';
import getAllTeacherWorkloads   from '@salesforce/apex/ClassManagementController.getAllTeacherWorkloads';
import getAllClassWorkloads     from '@salesforce/apex/ClassManagementController.getAllClassWorkloads';
import getTeacherWorkload      from '@salesforce/apex/ClassManagementController.getTeacherWorkload';
import getClassSectionWorkload from '@salesforce/apex/ClassManagementController.getClassSectionWorkload';
import getTeachersForSubject2  from '@salesforce/apex/ClassManagementController.getTeachersForSubject';
import updateTeacherAssignment from '@salesforce/apex/ClassManagementController.updateTeacherAssignment';
import deleteTeacherAssignment from '@salesforce/apex/ClassManagementController.deleteTeacherAssignment';

import getTeacherSkills from '@salesforce/apex/ClassManagementController.getTeacherSkills';

// Period data Apex
import getPeriodsForTeacher         from '@salesforce/apex/ClassManagementController.getPeriodsForTeacher';
import getPeriodsForTeacherWithGaps from '@salesforce/apex/ClassManagementController.getPeriodsForTeacherWithGaps';
import getPeriodsForClassSection    from '@salesforce/apex/ClassManagementController.getPeriodsForClassSection';

import getLeaserPeriodsForTeacher from '@salesforce/apex/ClassManagementController.getLeaserPeriodsForTeacher';

// Timetable Apex
import getAllClassSections           from '@salesforce/apex/ClassManagementController.getAllClassSections';
import getAllTeachers                from '@salesforce/apex/ClassManagementController.getAllTeachers';
import saveTimetablePeriods         from '@salesforce/apex/ClassManagementController.saveTimetablePeriods';
import getTimetableForClass         from '@salesforce/apex/ClassManagementController.getTimetableForClass';
import getTeachersForSubjectInClass  from '@salesforce/apex/ClassManagementController.getTeachersForSubjectInClass';
import saveSubstituteForPeriod      from '@salesforce/apex/ClassManagementController.saveSubstituteForPeriod';

const MAX_PERIODS = 48;

const DEFAULT_PERIOD_TIMES = [
    { num: 1, start: '9:00 AM',  end: '10:00 AM' },
    { num: 2, start: '10:00 AM', end: '11:00 AM' },
    { num: 3, start: '11:00 AM', end: '12:00 PM' },
    { num: 4, start: '12:00 PM', end: '1:00 PM'  },
    { num: 5, start: '1:00 PM',  end: '2:00 PM'  },
    { num: 6, start: '2:00 PM',  end: '3:00 PM'  },
    { num: 7, start: '3:00 PM',  end: '4:00 PM'  },
    { num: 8, start: '4:00 PM',  end: '5:00 PM'  },
];

const SCHOOL_DAYS = [
    { day: 'Monday',    dayLabel: 'Monday',    dayShort: 'MON' },
    { day: 'Tuesday',   dayLabel: 'Tuesday',   dayShort: 'TUE' },
    { day: 'Wednesday', dayLabel: 'Wednesday', dayShort: 'WED' },
    { day: 'Thursday',  dayLabel: 'Thursday',  dayShort: 'THU' },
    { day: 'Friday',    dayLabel: 'Friday',    dayShort: 'FRI' },
    { day: 'Saturday',  dayLabel: 'Saturday',  dayShort: 'SAT' },
];

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#fd7043,#ff8a65)',
    'linear-gradient(135deg,#26c6da,#00acc1)',
];

const DAY_ORDER = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TODAY_DAY_NAME = DAY_NAMES[new Date().getDay()];

export default class ClassManagement extends LightningElement {

    @track currentStep = 0;
    @track isLoading   = false;

    _periodTimings = [];

    // ── Teacher Form ──
    @track teacherFirstName     = '';
    @track teacherLastName      = '';
    @track teacherEmail         = '';
    @track teacherPhone         = '';
    @track teacherQualification = '';
    @track teacherSkills        = [];
    @track skillLevelOptions    = [];
    @track showTeacherForm      = false;

    // ── Step 1 ──
    @track selectedAcademicYear = '';
    @track academicYearOptions  = [];
    @track selectedClassId      = '';
    @track selectedClassName    = '';
    @track classOptions         = [];
    @track selectedSectionId    = '';
    @track selectedSectionName  = '';
    @track sectionOptions       = [];
    @track classStrength        = '';
    @track showDuplicateWarning    = false;
    @track duplicateWarningMessage = '';

    // ── Step 2 ──
    @track allSubjects       = [];
    @track selectedSubjects  = new Set();
    @track subjectSearchTerm = '';

    // ── Step 3 ──
    @track teacherAssignments = [];

    // ── Success ──
    @track showSuccessModal = false;
    @track successMessage   = '';

    // ── Workload dashboard ──
    @track workloadSummary    = { totalTeachers: 0, totalClasses: 0, totalAssignments: 0, avgLoadPercent: 0 };
    @track teacherWorkloadList = [];
    @track classWorkloadList   = [];
    @track teacherSearchTerm   = '';
    @track classSearchTerm     = '';

    @track selectedTeacherId    = '';
    @track selectedTeacherDetail = null;
    @track selectedClassId2      = '';
    @track selectedClassDetail   = null;

    // ── Collapsible section states (keyed by teacherId or classSectionId) ──
    @track _weeklyScheduleExpanded = {};
    @track _todayScheduleExpanded  = {};
    @track _classTodayScheduleExpanded = {};

    // ── Reassign ──
    @track showReassignModal      = false;
    @track reassignContext        = {};
    @track reassignNewTeacherId   = '';
    @track reassignNewTeacherName = '';
    @track reassignPeriodsPerWeek = 5;
    @track reassignTeacherOptions = [];

    // ── Timetable ──
    @track isTimetableView            = false;
    @track ttSelectedClassSectionId   = '';
    @track ttSelectedClassName        = '';
    @track ttSelectedAcademicYear     = '';
    @track ttSelectedAcademicYearName = '';
    @track ttFrequency                = 'Weekly';
    @track ttStartDate                = '';
    @track ttEndDate                  = '';
    @track showTimetableGrid          = false;
    @track timetableRows              = [];
    @track classSectionOptions        = [];
    @track ttSubjectOptions           = [];
    @track ttTeacherOptions           = [];
    @track showTimetableSuccessModal  = false;
    @track timetableSuccessMessage    = '';

    // ── Substitute Assignment Modal (from timetable leave cells) ──
    @track showSubstituteModal     = false;
    @track subModalContext         = {};
    @track subModalTeacherId       = '';
    @track subModalTeacherOptions  = [];
    @track subModalLoading         = false;

    _allClassSectionRecords = [];
    _allTeacherRecords      = [];
    _subjectTeacherCache    = {};

    connectedCallback() {
        this.loadPeriodTimings();
        this.loadAcademicYears();
        this.loadClasses();
        this.loadSections();
        this.loadSubjects();
        this.loadSkillLevels();
        this.loadWorkloadDashboard();
    }

    // ── PERIOD TIMINGS ──
    async loadPeriodTimings() {
        try {
            const timings = await getPeriodTimings();
            if (timings && timings.length > 0) {
                this._periodTimings = timings.map(t => ({
                    num:       t.num,
                    start:     t.startTime,
                    end:       t.endTime,
                    timeLabel: t.timeLabel
                }));
            } else {
                this._periodTimings = DEFAULT_PERIOD_TIMES.map(t => ({
                    num:       t.num,
                    start:     t.start,
                    end:       t.end,
                    timeLabel: t.start + ' – ' + t.end
                }));
            }
        } catch (e) {
            this._periodTimings = DEFAULT_PERIOD_TIMES.map(t => ({
                num:       t.num,
                start:     t.start,
                end:       t.end,
                timeLabel: t.start + ' – ' + t.end
            }));
        }
    }

    _getPeriodTiming(periodNum) {
        const found = this._periodTimings.find(t => t.num === parseInt(periodNum));
        if (found) return found;
        const def = DEFAULT_PERIOD_TIMES.find(t => t.num === parseInt(periodNum));
        return def ? { num: def.num, start: def.start, end: def.end, timeLabel: def.start + ' – ' + def.end } : null;
    }

    // ── DATA LOADING ──
    async loadAcademicYears() {
        try {
            const years = await getAcademicYears();
            this.academicYearOptions = years.map(y => ({ label: y.Name, value: y.Id }));
            const cur = years.find(y => y.Is_Current__c);
            if (cur) {
                this.selectedAcademicYear       = cur.Id;
                this.ttSelectedAcademicYear     = cur.Id;
                this.ttSelectedAcademicYearName = cur.Name;
            }
        } catch (e) {
            this.showToast('Error', 'Failed to load academic years: ' + this.getErrorMessage(e), 'error');
        }
    }

    async loadClasses() {
        try {
            const classes = await getAllClasses();
            this._allClassRecords = classes;
            this.classOptions = classes.map(c => ({ label: c.Name, value: c.Id }));
        } catch (e) {
            this.showToast('Error', 'Failed to load classes: ' + this.getErrorMessage(e), 'error');
        }
    }

    async loadSections() {
        try {
            const sections = await getAllSections();
            this._allSectionRecords = sections;
            this.sectionOptions = sections.map(s => ({ label: s.Name, value: s.Id }));
        } catch (e) {
            this.showToast('Error', 'Failed to load sections: ' + this.getErrorMessage(e), 'error');
        }
    }

    async loadSubjects() {
        try {
            this.isLoading = true;
            const subjects = await getAllSubjects();
            this.allSubjects = subjects.map(s => ({ ...s, isSelected: false, cardClass: 'subject-card' }));
            this.ttSubjectOptions = subjects.map(s => ({ label: s.Name, value: s.Id }));
        } catch (e) {
            this.showToast('Error', 'Failed to load subjects: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async loadSkillLevels() {
        try {
            const levels = await getSkillLevelOptions();
            this.skillLevelOptions = levels.map(l => ({ label: l.label, value: l.value }));
        } catch (e) {
            this.skillLevelOptions = [
                { label: 'Beginner',     value: 'Beginner' },
                { label: 'Intermediate', value: 'Intermediate' },
                { label: 'Advanced',     value: 'Advanced' },
                { label: 'Expert',       value: 'Expert' }
            ];
        }
    }

    async loadTeachersForSubjects() {
        try {
            this.isLoading = true;
            const subjectIds = Array.from(this.selectedSubjects);
            const teachersBySubject = await getTeachersForSubject({
                subjectIds, className: this.selectedClassName
            });
            this.teacherAssignments = subjectIds.map(subjectId => {
                const subject = this.allSubjects.find(s => s.Id === subjectId);
                const teachers = teachersBySubject[subjectId] || [];
                const teacherOptions = teachers.map(t => ({
                    label: `${t.Name} (${t.Teacher_Skill__c || 'Qualified'})`,
                    value: t.Id
                }));
                return {
                    subjectId,
                    subjectName: subject?.Name || 'Unknown Subject',
                    teachers: [{ id: 1, label: 'Primary Teacher', selectedTeacherId: '', periodsPerWeek: 5, teacherOptions, isFirst: true }],
                    teacherCounter: 1,
                    hasError: false,
                    noTeachersAvailable: teacherOptions.length === 0
                };
            });
        } catch (e) {
            this.showToast('Error', 'Failed to load teachers: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // ── WORKLOAD DASHBOARD ──
    async loadWorkloadDashboard() {
        try {
            this.isLoading = true;
            const [summary, teacherData, classData] = await Promise.all([
                getWorkloadSummary({ academicYearId: null }),
                getAllTeacherWorkloads(),
                getAllClassWorkloads()
            ]);

            this.workloadSummary = {
                totalTeachers:    summary.totalTeachers      || 0,
                totalClasses:     summary.totalClassSections || 0,
                totalAssignments: summary.totalAssignments   || 0,
                avgLoadPercent:   summary.avgLoadPercent     || 0
            };

            this.teacherWorkloadList = (teacherData || []).map((t, idx) =>
                this._buildTeacherRow(t, idx)
            );

            this.classWorkloadList = (classData || []).map(c =>
                this._buildClassRow(c)
            );
        } catch (e) {
            this.teacherWorkloadList = [];
            this.classWorkloadList   = [];
        } finally {
            this.isLoading = false;
        }
    }

    _buildTeacherRow(t, idx) {
        const pct      = Math.min(t.loadPercent || 0, 100);
        const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
        const initials = this._getInitials(t.teacherName || t.name || '');
        const isActive = this.selectedTeacherId === t.teacherId;
        const color    = this._loadColor(pct);
        return {
            id:           t.teacherId,
            name:         t.teacherName || t.name || '',
            initials,
            loadPercent:  pct,
            subjectCount: t.subjectCount || 0,
            classCount:   t.classCount   || 0,
            avatarStyle:  `background: ${gradient}`,
            avatarImg:    AVATAR_IMG,
            barStyle:     `width:${pct}%; background:${color}`,
            chipStyle:    `background:${this._loadBg(pct)}; color:${color}; border:1px solid ${color}40`,
            rowClass:     isActive ? 'panel-row panel-row-active' : 'panel-row',
            isSelected:   isActive,
            _raw:         t
        };
    }

    _buildClassRow(c) {
        const pct      = Math.min(c.loadPercent || 0, 100);
        const color    = this._loadColor(pct);
        const isActive = this.selectedClassId2 === c.classSectionId;
        return {
            id:            c.classSectionId,
            name:          c.name         || '',
            academicYear:  c.academicYear || '',
            subjectCount:  c.subjectCount  || 0,
            staffedCount:  c.staffedCount  || 0,
            unstaffedCount:(c.subjectCount || 0) - (c.staffedCount || 0),
            loadPercent:   pct,
            barStyle:      `width:${pct}%; background:${color}`,
            badgeStyle:    `background:${this._loadBg(pct)}; color:${color}; border:1px solid ${color}40`,
            rowClass:      isActive ? 'panel-row panel-row-active' : 'panel-row',
            isSelected:    isActive,
            _raw:          c
        };
    }

    // ── COLLAPSIBLE SECTION HANDLERS ──
    handleToggleWeeklySchedule(e) {
        e.stopPropagation();
        const teacherId = e.currentTarget.dataset.teacherId;
        const current = this._weeklyScheduleExpanded[teacherId] !== false;
        this._weeklyScheduleExpanded = { ...this._weeklyScheduleExpanded, [teacherId]: !current };
        this._syncTeacherDetailSectionState(teacherId);
    }

    handleToggleTodaySchedule(e) {
        e.stopPropagation();
        const teacherId = e.currentTarget.dataset.teacherId;
        const current = this._todayScheduleExpanded[teacherId] !== false;
        this._todayScheduleExpanded = { ...this._todayScheduleExpanded, [teacherId]: !current };
        this._syncTeacherDetailSectionState(teacherId);
    }

    handleToggleClassTodaySchedule(e) {
        e.stopPropagation();
        const classId = e.currentTarget.dataset.classId;
        const current = this._classTodayScheduleExpanded[classId] !== false;
        this._classTodayScheduleExpanded = { ...this._classTodayScheduleExpanded, [classId]: !current };
        this._syncClassDetailSectionState(classId);
    }

    _syncTeacherDetailSectionState(teacherId) {
        if (!this.selectedTeacherDetail || this.selectedTeacherDetail.id !== teacherId) return;
        this.selectedTeacherDetail = {
            ...this.selectedTeacherDetail,
            isWeeklyExpanded: this._weeklyScheduleExpanded[teacherId] !== false,
            isTodayExpanded:  this._todayScheduleExpanded[teacherId]  !== false,
        };
    }

    _syncClassDetailSectionState(classId) {
        if (!this.selectedClassDetail || this.selectedClassDetail.id !== classId) return;
        this.selectedClassDetail = {
            ...this.selectedClassDetail,
            isTodayExpanded: this._classTodayScheduleExpanded[classId] !== false,
        };
    }

    // ── PANEL SELECTION — TEACHER ──
    async handleSelectTeacher(e) {
        const id = e.currentTarget.dataset.id;
        if (this.selectedTeacherId === id) {
            this.selectedTeacherId     = '';
            this.selectedTeacherDetail = null;
            this._refreshTeacherRows();
            return;
        }
        this.selectedTeacherDetail = null;
        this.selectedTeacherId     = id;
        this._refreshTeacherRows();

        this._weeklyScheduleExpanded = { ...this._weeklyScheduleExpanded, [id]: true };
        this._todayScheduleExpanded  = { ...this._todayScheduleExpanded,  [id]: true };

        try {
            this.isLoading = true;
            const [data, periods, leaserPeriodIds] = await Promise.all([
                getTeacherWorkload({ teacherId: id }),
                (async () => {
                    try {
                        return await getPeriodsForTeacherWithGaps({ teacherId: id });
                    } catch (e) {
                        return await getPeriodsForTeacher({ teacherId: id });
                    }
                })(),
                this._fetchLeaserPeriods(id)
            ]);
            if (this.selectedTeacherId === id) {
                this.selectedTeacherDetail = await this._buildTeacherDetail(data, id, periods, leaserPeriodIds);
            }
        } catch (err) {
            this.showToast('Error', 'Failed to load teacher detail: ' + this.getErrorMessage(err), 'error');
            this.selectedTeacherId     = '';
            this.selectedTeacherDetail = null;
            this._refreshTeacherRows();
        } finally {
            this.isLoading = false;
        }
    }

    async _fetchLeaserPeriods(teacherId) {
        try {
            const result = await getLeaserPeriodsForTeacher({ teacherId });
            return new Set(result || []);
        } catch (e) {
            return new Set();
        }
    }

    _refreshTeacherRows() {
        this.teacherWorkloadList = this.teacherWorkloadList.map((t, idx) => ({
            ...this._buildTeacherRow(t._raw, idx)
        }));
    }

    // ── BUILD TEACHER DETAIL ──
    async _buildTeacherDetail(data, teacherId, periods, leaserPeriodIds = new Set()) {
        const row = this.teacherWorkloadList.find(t => t.id === teacherId);
        const pct = row ? row.loadPercent : 0;
        const circ = 2 * Math.PI * 22;
        const offset = circ - (pct / 100) * circ;
        const color = this._loadColor(pct);

        const allSubjects = [];
        const classes = (data.classes || []).map(cls => {
            (cls.subjects || []).forEach(s => {
                allSubjects.push({
                    uniqueKey:      s.assignmentId + '_' + cls.classSectionId,
                    assignmentId:   s.assignmentId,
                    subjectId:      s.subjectId,
                    subjectName:    s.subjectName,
                    className:      cls.className,
                    classSectionId: cls.classSectionId,
                    academicYear:   cls.academicYear,
                    periodsPerWeek: s.periodsPerWeek || 0,
                    fromTimetable:  s.fromTimetable  || false,
                    periodsChipTitle: s.fromTimetable
                        ? 'Periods from timetable'
                        : 'Planned periods (no timetable yet)'
                });
            });
            return {
                classSectionId: cls.classSectionId,
                className:      cls.className,
                academicYear:   cls.academicYear,
                subjects:       cls.subjects || []
            };
        });

        let teacherSkillsList = [];
        if (allSubjects.length === 0) {
            try {
                const skills = await getTeacherSkills({ teacherId });
                teacherSkillsList = (skills || []).map(s => ({
                    id:              s.Id || s.id,
                    subjectName:     s.Subject__r ? s.Subject__r.Name : (s.subjectName || 'Unknown Subject'),
                    skillLevel:      s.Skill_Level__c || s.skillLevel || '',
                    yearsOfExperience: s.Years_of_Experience__c || s.yearsOfExperience || 0,
                    levelClass:      this._skillLevelClass(s.Skill_Level__c || s.skillLevel || '')
                }));
            } catch (e) {
                teacherSkillsList = [];
            }
        }

        const totalPeriodsFromTimetable = (periods || []).length;
        const realPct    = Math.min(Math.round((totalPeriodsFromTimetable / MAX_PERIODS) * 100), 100);
        const realColor  = this._loadColor(realPct);
        const realCirc   = 2 * Math.PI * 22;
        const realOffset = realCirc - (realPct / 100) * realCirc;

        const timetablePeriods = this._buildTeacherPeriodRows(periods || [], teacherId, leaserPeriodIds);

        const hasLeaserToday = timetablePeriods.some(dayRow =>
            dayRow.periods.some(p => p.isLeaser && !p.isFreeLeaser)
        );
        const hasFreeToday = timetablePeriods.some(dayRow =>
            dayRow.periods.some(p => p.isFreeLeaser)
        );

        const isWeeklyExpanded = this._weeklyScheduleExpanded[teacherId] !== false;
        const isTodayExpanded  = this._todayScheduleExpanded[teacherId]  !== false;

        return {
            id:               teacherId,
            name:             row ? row.name : '',
            initials:         row ? row.initials : '??',
            avatarStyle:      row ? row.avatarStyle : '',
            avatarImg:        row ? row.avatarImg : '',
            loadPercent:      totalPeriodsFromTimetable > 0 ? realPct : pct,
            totalPeriods:     totalPeriodsFromTimetable,
            totalAssignments: allSubjects.length,
            classCount:       classes.length,
            ringStyle:        totalPeriodsFromTimetable > 0
                                ? `stroke-dasharray:${realCirc}; stroke-dashoffset:${realOffset}; stroke:${realColor}`
                                : `stroke-dasharray:${circ}; stroke-dashoffset:${offset}; stroke:${color}`,
            allSubjects,
            hasNoSubjects:    allSubjects.length === 0,
            teacherSkillsList,
            hasSkills:        teacherSkillsList.length > 0,
            classes,
            timetablePeriods,
            hasTimetable:     timetablePeriods.length > 0,
            hasLeaserToday,
            hasFreeToday,
            isWeeklyExpanded,
            isTodayExpanded,
        };
    }

    _skillLevelClass(level) {
        const map = {
            'Expert':       'dd-skill-level-chip skill-level-expert',
            'Advanced':     'dd-skill-level-chip skill-level-advanced',
            'Intermediate': 'dd-skill-level-chip skill-level-intermediate',
            'Beginner':     'dd-skill-level-chip skill-level-beginner',
        };
        return map[level] || 'dd-skill-level-chip skill-level-beginner';
    }

    _buildTeacherPeriodRows(rawPeriods, teacherId, leaserPeriodIds = new Set()) {
        if (!rawPeriods || rawPeriods.length === 0) return [];

        const todayPeriods = rawPeriods.filter(p => p.day === TODAY_DAY_NAME);
        const filtered     = todayPeriods.length > 0
            ? todayPeriods
            : rawPeriods.filter(p => p.day === 'Monday');

        const dayMap = {};
        filtered.forEach(p => {
            const day = p.day || 'Unknown';
            if (!dayMap[day]) dayMap[day] = [];

            const periodNum = p.periodNumber ? parseInt(p.periodNumber) : 0;
            const timing    = this._getPeriodTiming(periodNum);
            let timeLabel   = '';
            if (p.startTime && p.endTime) {
                timeLabel = `${p.startTime} – ${p.endTime}`;
            } else if (timing) {
                timeLabel = timing.timeLabel;
            }

            const leaserByApex       = leaserPeriodIds.has(p.periodId);
            const leaserBySubstitute = p.substituteTeacherId != null && p.substituteTeacherId !== '' && p.substituteTeacherId !== teacherId;
            const leaserByFlag       = p.isLeaser === true;
            const leaserByEmpty      = p.isFreePeriod === true || ((!p.classSectionId || p.classSectionId === '') && (!p.subjectName || p.subjectName === '—' || p.subjectName === ''));

            const isLeaser = leaserByApex || leaserBySubstitute || leaserByFlag || leaserByEmpty;

            let leaserType = 'LEASER';
            if (leaserByEmpty) { leaserType = 'FREE'; }

            const leaserCardClass = isLeaser
                ? `tt-period-card tt-period-card-leaser${leaserByEmpty ? ' tt-period-card-free' : ''} tt-period-card-clickable`
                : 'tt-period-card tt-period-card-clickable';
            const leaserRibbonClass = leaserByEmpty ? 'leaser-ribbon leaser-ribbon-free' : 'leaser-ribbon';
            const leaserCardTitle   = leaserByEmpty
                ? 'Free period — no class assigned (personal work time)'
                : 'Leaser period — substitute teacher covering this class';

            dayMap[day].push({
                key:                p.periodId,
                periodNumber:       periodNum,
                subjectName:        p.subjectName    || (leaserByEmpty ? 'Free Period' : '—'),
                className:          p.className      || (leaserByEmpty ? 'No class assigned' : '—'),
                classSectionId:     p.classSectionId || '',
                academicYearId:     p.academicYearId || '',
                academicYear:       p.academicYear   || '',
                startDate:          p.startDate      || '',
                endDate:            p.endDate        || '',
                startTime:          p.startTime      || (timing ? timing.start : ''),
                endTime:            p.endTime        || (timing ? timing.end   : ''),
                frequency:          p.frequency      || '',
                timeLabel,
                isLeaser,
                leaserType,
                isFreeLeaser:       leaserByEmpty,
                leaserCardClass,
                leaserRibbonClass,
                leaserCardTitle,
                substituteTeacher:  isLeaser && !leaserByEmpty && p.substituteTeacherName
                    ? p.substituteTeacherName
                    : (isLeaser && !leaserByEmpty && p.assignedTeacherName && p.assignedTeacherName !== p.teacherName
                        ? p.assignedTeacherName
                        : null)
            });
        });

        return Object.keys(dayMap)
            .sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
            .map(day => {
                const sortedPeriods = dayMap[day].sort((a, b) => a.periodNumber - b.periodNumber);
                const leaserCount   = sortedPeriods.filter(p => p.isLeaser).length;
                const freeCount     = sortedPeriods.filter(p => p.isFreeLeaser).length;
                return {
                    day,
                    dayShort:    day.substring(0, 3).toUpperCase(),
                    periods:     sortedPeriods,
                    leaserCount: leaserCount || 0,
                    freeCount:   freeCount   || 0
                };
            });
    }

    handleClearTeacherDetail() {
        this.selectedTeacherId    = '';
        this.selectedTeacherDetail = null;
        this._refreshTeacherRows();
    }

    // ── PANEL SELECTION — CLASS ──
    async handleSelectClass(e) {
        const id = e.currentTarget.dataset.id;
        if (this.selectedClassId2 === id) {
            this.selectedClassId2    = '';
            this.selectedClassDetail = null;
            this._refreshClassRows();
            return;
        }
        this.selectedClassDetail = null;
        this.selectedClassId2    = id;
        this._refreshClassRows();

        this._classTodayScheduleExpanded = { ...this._classTodayScheduleExpanded, [id]: true };

        try {
            this.isLoading = true;
            const [data, periods] = await Promise.all([
                getClassSectionWorkload({ classSectionId: id }),
                getPeriodsForClassSection({ classSectionId: id })
            ]);
            if (this.selectedClassId2 === id) {
                this.selectedClassDetail = this._buildClassDetail(data, id, periods);
            }
        } catch (err) {
            this.showToast('Error', 'Failed to load class detail: ' + this.getErrorMessage(err), 'error');
            this.selectedClassId2    = '';
            this.selectedClassDetail = null;
            this._refreshClassRows();
        } finally {
            this.isLoading = false;
        }
    }

    _refreshClassRows() {
        this.classWorkloadList = this.classWorkloadList.map(c => ({
            ...this._buildClassRow(c._raw)
        }));
    }

    _buildClassDetail(data, classSectionId, periods) {
        const row   = this.classWorkloadList.find(c => c.id === classSectionId);
        const pct   = row ? row.loadPercent : 0;
        const circ  = 2 * Math.PI * 22;
        const offset = circ - (pct / 100) * circ;
        const color  = this._loadColor(pct);

        const subjects = (data.subjects || []).map((subj, idx) => {
            const teachers = (subj.teachers || []).map((t, ti) => {
                const tPct = Math.min(Math.round(((t.periodsPerWeek || 0) / MAX_PERIODS) * 100), 100);
                return {
                    id:              t.teacherId,
                    name:            t.teacherName,
                    initials:        this._getInitials(t.teacherName),
                    assignmentId:    t.assignmentId,
                    periodsPerWeek:  t.periodsPerWeek || 0,
                    fromTimetable:   t.fromTimetable  || false,
                    loadPercent:     tPct,
                    avatarStyle:     `background:${AVATAR_GRADIENTS[(ti) % AVATAR_GRADIENTS.length]}`,
                    periodsChipTitle: t.fromTimetable ? 'Periods from timetable' : 'Planned periods (no timetable yet)'
                };
            });
            const sMaxPct = teachers.length > 0 ? Math.max(...teachers.map(t => t.loadPercent)) : 0;
            const sColor  = this._loadColor(sMaxPct);
            return {
                subjectId:   subj.subjectId,
                subjectName: subj.subjectName,
                hasTeacher:  teachers.length > 0,
                teachers,
                loadPercent: sMaxPct,
                dotStyle:    `background:${sColor}`,
                barStyle:    `width:${sMaxPct}%; background:${sColor}`
            };
        });

        const timetablePeriods = this._buildClassPeriodRows(periods || []);
        const hasSubToday = timetablePeriods.some(dayRow =>
            dayRow.periods.some(p => p.isSubstitute)
        );

        const isTodayExpanded = this._classTodayScheduleExpanded[classSectionId] !== false;

        return {
            id:           classSectionId,
            name:         data.name         || row?.name || '',
            academicYear: data.academicYear  || row?.academicYear || '',
            subjectCount: subjects.length,
            teacherCount: data.teacherCount  || 0,
            loadPercent:  pct,
            ringStyle:    `stroke-dasharray:${circ}; stroke-dashoffset:${offset}; stroke:${color}`,
            progressStyle:`width:${pct}%; background:${color}`,
            subjects,
            timetablePeriods,
            hasTimetable: timetablePeriods.length > 0,
            hasSubToday,
            isTodayExpanded,
        };
    }

    /* ══════════════════════════════════════════════════════════════
       _buildClassPeriodRows — FIXED
       
       Reads the clean isSubstitute / substituteTeacherName /
       originalTeacherName flags now sent from the fixed Apex method.
       No more client-side re-derivation: Apex is the source of truth.
       ══════════════════════════════════════════════════════════════ */
    _buildClassPeriodRows(rawPeriods) {
        if (!rawPeriods || rawPeriods.length === 0) return [];

        // Show today's periods; fall back to Monday if today has none
        const todayPeriods = rawPeriods.filter(p => p.day === TODAY_DAY_NAME);
        const filtered     = todayPeriods.length > 0
            ? todayPeriods
            : rawPeriods.filter(p => p.day === 'Monday');

        const dayMap = {};

        filtered.forEach(p => {
            const day = p.day || 'Unknown';
            if (!dayMap[day]) dayMap[day] = [];

            const periodNum = p.periodNumber ? parseInt(p.periodNumber) : 0;
            const timing    = this._getPeriodTiming(periodNum);

            let timeLabel = '';
            if (p.startTime && p.endTime) {
                timeLabel = `${p.startTime} – ${p.endTime}`;
            } else if (timing) {
                timeLabel = timing.timeLabel;
            }

            // ── Apex already resolved these cleanly ──
            const isSubstitute      = p.isSubstitute === true || p.isLeaser === true;

            // substituteTeacher = person physically present in the room (covering)
            const substituteTeacher = isSubstitute
                ? (p.substituteTeacherName || p.teacherName || null)
                : null;

            // originalTeacher = person on leave
            const originalTeacher   = isSubstitute
                ? (p.originalTeacherName || null)
                : null;

            // What to display as the main "teacher" on the period card
            const displayTeacherName = isSubstitute
                ? (substituteTeacher || 'Sub TBD')
                : (p.teacherName || 'Unassigned');

            dayMap[day].push({
                key:              p.periodId,
                periodNumber:     periodNum,
                subjectName:      p.subjectName    || '—',
                teacherName:      displayTeacherName,
                classSectionId:   p.classSectionId || '',
                academicYearId:   p.academicYearId || '',
                academicYear:     p.academicYear   || '',
                startDate:        p.startDate      || '',
                endDate:          p.endDate        || '',
                startTime:        p.startTime      || (timing ? timing.start : ''),
                endTime:          p.endTime        || (timing ? timing.end   : ''),
                frequency:        p.frequency      || '',
                timeLabel,
                isUnassigned:     !p.teacherId && !p.substituteTeacherName,
                isSubstitute,
                substituteTeacher,
                originalTeacher
            });
        });

        return Object.keys(dayMap)
            .sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
            .map(day => {
                const sortedPeriods = dayMap[day].sort((a, b) => a.periodNumber - b.periodNumber);
                const subCount = sortedPeriods.filter(p => p.isSubstitute).length;
                return {
                    day,
                    dayShort: day.substring(0, 3).toUpperCase(),
                    periods:  sortedPeriods,
                    subCount: subCount || 0
                };
            });
    }

    handleClearClassDetail() {
        this.selectedClassId2   = '';
        this.selectedClassDetail = null;
        this._refreshClassRows();
    }

    // ── PERIOD CARD CLICK ──
    async handlePeriodCardClick(e) {
        e.stopPropagation();

        const classSectionId = e.currentTarget.dataset.classSectionId;
        const academicYearId = e.currentTarget.dataset.academicYearId;
        const startDate      = e.currentTarget.dataset.startDate;
        const endDate        = e.currentTarget.dataset.endDate || '';
        const frequency      = e.currentTarget.dataset.frequency || 'Weekly';

        if (!classSectionId) {
            this.showToast('Info', 'No class section linked to this period.', 'info');
            return;
        }

        await this.handleOpenTimetable();

        this.ttSelectedClassSectionId = classSectionId;
        const csOption = this.classSectionOptions.find(o => o.value === classSectionId);
        this.ttSelectedClassName = csOption ? csOption.label : '';

        if (academicYearId) {
            this.ttSelectedAcademicYear = academicYearId;
            const ayOption = this.academicYearOptions.find(o => o.value === academicYearId);
            this.ttSelectedAcademicYearName = ayOption ? ayOption.label : '';
        }

        this.ttFrequency = frequency || 'Weekly';

        if (startDate) { this.ttStartDate = startDate; }
        if (endDate) { this.ttEndDate = endDate; } else if (startDate) { this._recalcEndDate(); }

        if (this.ttSelectedClassSectionId && this.ttSelectedAcademicYear && this.ttStartDate) {
            await this.handleLoadTimetable();
        }
    }

    // ── PANEL SEARCH FILTERS ──
    handleTeacherSearch(e) { this.teacherSearchTerm = e.target.value; }
    handleClassSearch(e)   { this.classSearchTerm   = e.target.value; }

    get filteredTeacherWorkload() {
        if (!this.teacherSearchTerm) return this.teacherWorkloadList;
        const q = this.teacherSearchTerm.toLowerCase();
        return this.teacherWorkloadList.filter(t => t.name.toLowerCase().includes(q));
    }

    get filteredClassWorkload() {
        if (!this.classSearchTerm) return this.classWorkloadList;
        const q = this.classSearchTerm.toLowerCase();
        return this.classWorkloadList.filter(c => c.name.toLowerCase().includes(q));
    }

    get hasTeacherWorkload() { return this.teacherWorkloadList.length > 0; }
    get hasClassWorkload()   { return this.classWorkloadList.length   > 0; }

    // ── REASSIGN ──
    async handleOpenReassign(e) {
        e.stopPropagation();
        const { assignmentId, subjectId, subjectName, teacherId, teacherName } = e.currentTarget.dataset;
        this.reassignContext = {
            assignmentId,
            subjectId,
            subjectName,
            currentTeacherId:   teacherId,
            currentTeacherName: teacherName,
            currentInitials:    this._getInitials(teacherName)
        };
        this.reassignNewTeacherId   = teacherId;
        this.reassignNewTeacherName = teacherName;
        this.reassignPeriodsPerWeek = 5;
        try {
            this.isLoading = true;
            const teachersBySubject = await getTeachersForSubject2({
                subjectIds: [subjectId], className: ''
            });
            const teachers = teachersBySubject[subjectId] || [];
            this.reassignTeacherOptions = teachers.map(t => ({
                label: `${t.Name} (${t.Teacher_Skill__c || 'Qualified'})`,
                value: t.Id
            }));
        } catch (e) {
            this.reassignTeacherOptions = [];
        } finally {
            this.isLoading = false;
        }
        this.showReassignModal = true;
    }

    handleCloseReassign() { this.showReassignModal = false; this.reassignContext = {}; }

    handleReassignTeacherChange(e) {
        this.reassignNewTeacherId = e.detail.value;
        const found = this.reassignTeacherOptions.find(o => o.value === e.detail.value);
        this.reassignNewTeacherName = found ? found.label.split(' (')[0] : '';
    }

    handleReassignPeriodsChange(e) { this.reassignPeriodsPerWeek = parseInt(e.detail.value) || 0; }

    get reassignNewInitials() { return this._getInitials(this.reassignNewTeacherName); }

    async handleSaveReassign() {
        if (!this.reassignNewTeacherId) {
            this.showToast('Error', 'Please select a teacher', 'error'); return;
        }
        try {
            this.isLoading = true;
            await updateTeacherAssignment({
                assignmentId:   this.reassignContext.assignmentId,
                newTeacherId:   this.reassignNewTeacherId,
                periodsPerWeek: this.reassignPeriodsPerWeek
            });
            this.showToast('Success', 'Assignment updated successfully!', 'success');
            this.showReassignModal     = false;
            this.selectedTeacherDetail = null;
            this.selectedClassDetail   = null;
            await this.loadWorkloadDashboard();
        } catch (e) {
            this.showToast('Error', 'Failed to update: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async handleDeleteAssignment(e) {
        e.stopPropagation();
        const assignmentId = e.currentTarget.dataset.assignmentId;
        try {
            this.isLoading = true;
            await deleteTeacherAssignment({ assignmentId });
            this.showToast('Success', 'Assignment removed!', 'success');
            this.selectedTeacherDetail = null;
            this.selectedClassDetail   = null;
            await this.loadWorkloadDashboard();
        } catch (e) {
            this.showToast('Error', 'Failed to delete: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // ── STEP GETTERS ──
    get todayDayName() { return TODAY_DAY_NAME; }
    get isStep0() { return this.currentStep === 0 && !this.isTimetableView; }
    get isStep1() { return this.currentStep === 1; }
    get isStep2() { return this.currentStep === 2; }
    get isStep3() { return this.currentStep === 3; }

    // ── STEP 0 TEACHER FORM ──
    handleToggleTeacherForm() { this.showTeacherForm = !this.showTeacherForm; }

    handleTeacherFirstNameChange(e)     { this.teacherFirstName     = e.detail.value; }
    handleTeacherLastNameChange(e)      { this.teacherLastName      = e.detail.value; }
    handleTeacherEmailChange(e)         { this.teacherEmail         = e.detail.value; }
    handleTeacherPhoneChange(e)         { this.teacherPhone         = e.detail.value; }
    handleTeacherQualificationChange(e) { this.teacherQualification = e.detail.value; }

    handleAddSkill() {
        this.teacherSkills = [
            ...this.teacherSkills,
            { id: this.teacherSkills.length + 1, subjectId: '', skillLevel: '', yearsOfExperience: 0 }
        ];
    }

    handleRemoveSkill(e) {
        const id = parseInt(e.target.dataset.skillId);
        this.teacherSkills = this.teacherSkills.filter(s => s.id !== id);
    }

    handleSkillSubjectChange(e) {
        const id = parseInt(e.target.dataset.skillId);
        this.teacherSkills = this.teacherSkills.map(s => s.id === id ? { ...s, subjectId: e.detail.value } : s);
    }

    handleSkillLevelChange(e) {
        const id = parseInt(e.target.dataset.skillId);
        this.teacherSkills = this.teacherSkills.map(s => s.id === id ? { ...s, skillLevel: e.detail.value } : s);
    }

    handleSkillExperienceChange(e) {
        const id = parseInt(e.target.dataset.skillId);
        this.teacherSkills = this.teacherSkills.map(s => s.id === id ? { ...s, yearsOfExperience: parseFloat(e.detail.value) } : s);
    }

    async handleCreateTeacher() {
        if (!this.teacherFirstName || !this.teacherLastName) { this.showToast('Error', 'First & Last Name are required', 'error'); return; }
        if (!this.teacherEmail)                              { this.showToast('Error', 'Email is required', 'error'); return; }
        if (this.teacherSkills.length === 0)                 { this.showToast('Error', 'Add at least one subject skill', 'error'); return; }
        if (this.teacherSkills.find(s => !s.subjectId || !s.skillLevel)) { this.showToast('Error', 'Complete all skill details', 'error'); return; }

        try {
            this.isLoading = true;
            const result = await createTeacherWithSkills({
                firstName: this.teacherFirstName, lastName: this.teacherLastName,
                email: this.teacherEmail, phone: this.teacherPhone,
                qualification: this.teacherQualification, skills: this.teacherSkills
            });
            this.showToast('Success', `Teacher "${result.teacherName}" created with ${result.skillsCount} skill(s)!`, 'success');
            this.resetTeacherForm();
            this.showTeacherForm = false;
            await this.loadSubjects();
            await this.loadWorkloadDashboard();
        } catch (e) {
            this.showToast('Error', 'Failed to create teacher: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleSkipTeacherCreation() { this.currentStep = 1; }

    resetTeacherForm() {
        this.teacherFirstName = this.teacherLastName = this.teacherEmail =
        this.teacherPhone = this.teacherQualification = '';
        this.teacherSkills = [];
    }

    get availableSubjects() { return this.allSubjects.map(s => ({ label: s.Name, value: s.Id })); }
    get hasTeacherSkills()  { return this.teacherSkills.length > 0; }

    // ── STEP 1 ──
    handleAcademicYearChange(e) { this.selectedAcademicYear = e.detail.value; this.checkForDuplicate(); }

    handleClassChange(e) {
        this.selectedClassId = e.detail.value;
        const found = (this._allClassRecords || []).find(c => c.Id === this.selectedClassId);
        this.selectedClassName = found ? found.Name : '';
        this.checkForDuplicate();
    }

    handleSectionChange(e) {
        this.selectedSectionId = e.detail.value;
        const found = (this._allSectionRecords || []).find(s => s.Id === this.selectedSectionId);
        this.selectedSectionName = found ? found.Name : '';
        this.checkForDuplicate();
    }

    handleClassStrengthChange(e) { this.classStrength = e.detail.value; }

    async checkForDuplicate() {
        if (!this.selectedAcademicYear || !this.selectedClassId || !this.selectedSectionId) { this.showDuplicateWarning = false; return; }
        try {
            const isDuplicate = await checkDuplicateClassSection({ academicYearId: this.selectedAcademicYear, classId: this.selectedClassId, sectionId: this.selectedSectionId });
            this.showDuplicateWarning    = isDuplicate;
            this.duplicateWarningMessage = isDuplicate ? `⚠️ "${this.selectedClassName} - Section ${this.selectedSectionName}" already exists for this academic year.` : '';
        } catch (e) { this.showDuplicateWarning = false; }
    }

    async handleStep1Next() {
        if (!this.selectedAcademicYear) { this.showToast('Error', 'Select an academic year', 'error'); return; }
        if (!this.selectedClassId)      { this.showToast('Error', 'Select a class', 'error'); return; }
        if (!this.selectedSectionId)    { this.showToast('Error', 'Select a section', 'error'); return; }
        if (this.showDuplicateWarning)  { this.showToast('Duplicate', 'This combination already exists', 'error'); return; }
        this.currentStep = 2;
    }

    handleStep1Back() { this.currentStep = 0; }

    // ── STEP 2 ──
    get filteredSubjects() {
        if (!this.subjectSearchTerm) return this.allSubjects;
        const q = this.subjectSearchTerm.toLowerCase();
        return this.allSubjects.filter(s => s.Name.toLowerCase().includes(q) || (s.Subject_Code__c && s.Subject_Code__c.toLowerCase().includes(q)));
    }

    get hasSelectedSubjects()   { return this.selectedSubjects.size > 0; }
    get selectedSubjectsCount() { return this.selectedSubjects.size; }
    get selectedSubjectsList()  { return this.allSubjects.filter(s => this.selectedSubjects.has(s.Id)); }
    get noSubjectsFound()       { return this.filteredSubjects.length === 0; }
    get isStep2NextDisabled()   { return this.selectedSubjects.size === 0; }

    handleSubjectSearch(e) { this.subjectSearchTerm = e.detail.value; }

    handleSubjectToggle(e) {
        const id = e.currentTarget.dataset.id;
        if (this.selectedSubjects.has(id)) { this.selectedSubjects.delete(id); } else { this.selectedSubjects.add(id); }
        this.allSubjects = this.allSubjects.map(s => {
            if (s.Id === id) { const sel = this.selectedSubjects.has(id); return { ...s, isSelected: sel, cardClass: sel ? 'subject-card selected' : 'subject-card' }; }
            return s;
        });
    }

    handleRemoveSubject(e) {
        e.stopPropagation();
        const id = e.target.dataset.id;
        this.selectedSubjects.delete(id);
        this.allSubjects = this.allSubjects.map(s => s.Id === id ? { ...s, isSelected: false, cardClass: 'subject-card' } : s);
    }

    handleStep2Back() { this.currentStep = 1; }

    async handleStep2Next() {
        if (this.selectedSubjects.size === 0) { this.showToast('Error', 'Select at least one subject', 'error'); return; }
        await this.loadTeachersForSubjects();
        this.currentStep = 3;
    }

    // ── STEP 3 ──
    handleTeacherChange(e) {
        const subjectId    = e.target.dataset.subjectId;
        const teacherIndex = parseInt(e.target.dataset.teacherIndex);
        const selectedTeacherId = e.detail.value;
        this.teacherAssignments = this.teacherAssignments.map(a => {
            if (a.subjectId !== subjectId) return a;
            return { ...a, hasError: false, teachers: a.teachers.map(t => t.id === teacherIndex ? { ...t, selectedTeacherId } : t) };
        });
    }

    handlePeriodsChange(e) {
        const subjectId    = e.target.dataset.subjectId;
        const teacherIndex = parseInt(e.target.dataset.teacherIndex);
        const periodsPerWeek = parseInt(e.detail.value) || 0;
        this.teacherAssignments = this.teacherAssignments.map(a => {
            if (a.subjectId !== subjectId) return a;
            return { ...a, teachers: a.teachers.map(t => t.id === teacherIndex ? { ...t, periodsPerWeek } : t) };
        });
    }

    handleAddTeacher(e) {
        const subjectId = e.target.dataset.subjectId;
        this.teacherAssignments = this.teacherAssignments.map(a => {
            if (a.subjectId !== subjectId) return a;
            const newId = a.teacherCounter + 1;
            return { ...a, teacherCounter: newId, teachers: [...a.teachers, { id: newId, label: `Additional Teacher ${a.teachers.length}`, selectedTeacherId: '', periodsPerWeek: 5, teacherOptions: a.teachers[0].teacherOptions, isFirst: false }] };
        });
    }

    handleRemoveTeacher(e) {
        const subjectId    = e.target.dataset.subjectId;
        const teacherIndex = parseInt(e.target.dataset.teacherIndex);
        this.teacherAssignments = this.teacherAssignments.map(a => {
            if (a.subjectId !== subjectId) return a;
            return { ...a, teachers: a.teachers.filter(t => t.id !== teacherIndex) };
        });
    }

    handleStep3Back() { this.currentStep = 2; }

    // ── SUBMIT ──
    async handleSubmit() {
        let hasError = false;
        this.teacherAssignments = this.teacherAssignments.map(a => {
            if (!a.teachers.some(t => t.selectedTeacherId)) { hasError = true; return { ...a, hasError: true }; }
            return { ...a, hasError: false };
        });
        if (hasError) { this.showToast('Error', 'Assign at least one teacher to each subject', 'error'); return; }

        const subjectTeacherMap = {};
        const subjectPeriodsMap = {};
        this.teacherAssignments.forEach(a => {
            const assigned = a.teachers.filter(t => t.selectedTeacherId);
            subjectTeacherMap[a.subjectId] = assigned.map(t => t.selectedTeacherId);
            subjectPeriodsMap[a.subjectId] = assigned.map(t => t.periodsPerWeek || 5);
        });

        try {
            this.isLoading = true;
            const result = await createClassSection({
                academicYearId: this.selectedAcademicYear,
                classId:        this.selectedClassId,
                sectionId:      this.selectedSectionId,
                classStrength:  this.classStrength ? parseInt(this.classStrength) : null,
                subjectTeacherMap,
                subjectPeriodsMap
            });
            this.successMessage = `Created ${result.subjectCount} subject(s) with ${result.teacherAssignmentCount} teacher assignment(s)`;
            this.showSuccessModal = true;
            this.showToast('Success', 'Class Section created successfully!', 'success');
        } catch (e) {
            this.showToast('Error', 'Failed: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // ── SUCCESS MODAL ──
    handleCreateAnother() { this.resetForm(); this.showSuccessModal = false; }

    async handleDone() {
        this.showSuccessModal = false;
        this.resetForm();
        this.currentStep = 0;
        await this.loadWorkloadDashboard();
    }

    resetForm() {
        this.currentStep = 0;
        this.selectedClassId = this.selectedClassName = '';
        this.selectedSectionId = this.selectedSectionName = '';
        this.classStrength = '';
        this.selectedSubjects = new Set();
        this.subjectSearchTerm = '';
        this.teacherAssignments = [];
        this.showDuplicateWarning = false;
        this.duplicateWarningMessage = '';
        this.resetTeacherForm();
        this.allSubjects = this.allSubjects.map(s => ({ ...s, isSelected: false, cardClass: 'subject-card' }));
    }

    // ── TIMETABLE ──
    async handleOpenTimetable() {
        this.isTimetableView = true;
        this.currentStep     = 0;
        this.showTeacherForm = false;
        await this._loadClassSectionsForTimetable();
        await this._loadTeachersForTimetable();
    }

    handleCloseTimetable() {
        this.isTimetableView     = false;
        this.showTimetableGrid   = false;
        this.timetableRows       = [];
        this.ttSelectedClassSectionId = '';
        this.ttSelectedClassName = '';
    }

    async _loadClassSectionsForTimetable() {
        try {
            let sections = [];
            try { sections = await getAllClassSections(); } catch (e) { sections = this.classWorkloadList.map(c => ({ Id: c.id, Name: c.name })); }
            this._allClassSectionRecords = sections;
            this.classSectionOptions = sections.map(s => ({ label: s.Name, value: s.Id }));
        } catch (e) { this.classSectionOptions = []; }
    }

    async _loadTeachersForTimetable() {
        try {
            let teachers = [];
            try { teachers = await getAllTeachers(); } catch (e) { teachers = this.teacherWorkloadList.map(t => ({ Id: t.id, Name: t.name })); }
            this._allTeacherRecords = teachers;
            this.ttTeacherOptions = teachers.map(t => ({ label: t.Name, value: t.Id }));
        } catch (e) { this.ttTeacherOptions = []; }
    }

    handleTTClassChange(e) {
        this.ttSelectedClassSectionId = e.detail.value;
        const found = this.classSectionOptions.find(o => o.value === e.detail.value);
        this.ttSelectedClassName = found ? found.label : '';
        this.showTimetableGrid = false;
        this._subjectTeacherCache = {};
    }

    handleTTYearChange(e) {
        this.ttSelectedAcademicYear = e.detail.value;
        const found = this.academicYearOptions.find(o => o.value === e.detail.value);
        this.ttSelectedAcademicYearName = found ? found.label : '';
        this.showTimetableGrid = false;
    }

    handleTTFrequencyChange(e) {
        this.ttFrequency = e.detail.value;
        this._recalcEndDate();
        this.showTimetableGrid = false;
    }

    handleTTStartDateChange(e) {
        this.ttStartDate = e.detail.value;
        this._recalcEndDate();
        this.showTimetableGrid = false;
    }

    handleTTEndDateChange(e) { this.ttEndDate = e.detail.value; }

    _recalcEndDate() {
        if (!this.ttStartDate) return;
        const start = new Date(this.ttStartDate);
        if (this.ttFrequency === 'Weekly') {
            const end = new Date(start); end.setDate(end.getDate() + 6);
            this.ttEndDate = end.toISOString().split('T')[0];
        } else if (this.ttFrequency === 'Monthly') {
            const end = new Date(start); end.setMonth(end.getMonth() + 1); end.setDate(end.getDate() - 1);
            this.ttEndDate = end.toISOString().split('T')[0];
        } else if (this.ttFrequency === 'Yearly') {
            const end = new Date(start); end.setFullYear(end.getFullYear() + 1); end.setDate(end.getDate() - 1);
            this.ttEndDate = end.toISOString().split('T')[0];
        }
    }

    get ttEndDateDisabled() {
        return this.ttFrequency === 'Weekly' || this.ttFrequency === 'Monthly' || this.ttFrequency === 'Yearly';
    }

    get ttFrequencyOptions() {
        return [
            { label: 'Weekly',  value: 'Weekly'  },
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Yearly',  value: 'Yearly'  },
        ];
    }

    get ttDateRangeLabel() {
        if (!this.ttStartDate) return '';
        const s = this._formatDate(this.ttStartDate);
        const e = this.ttEndDate ? ' → ' + this._formatDate(this.ttEndDate) : '';
        return s + e;
    }

    _formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    async handleLoadTimetable() {
        if (!this.ttSelectedClassSectionId) { this.showToast('Error', 'Please select a class section', 'error'); return; }
        if (!this.ttSelectedAcademicYear)   { this.showToast('Error', 'Please select an academic year', 'error'); return; }
        if (!this.ttStartDate)              { this.showToast('Error', 'Please select a start date', 'error'); return; }

        if (this._periodTimings.length === 0) { await this.loadPeriodTimings(); }

        try {
            this.isLoading = true;
            let existingData = {};
            try {
                const existing = await getTimetableForClass({
                    classSectionId: this.ttSelectedClassSectionId,
                    academicYearId: this.ttSelectedAcademicYear,
                    startDate:      this.ttStartDate,
                    endDate:        this.ttEndDate || this.ttStartDate
                });
                existingData = existing || {};
            } catch (e) { /* No existing data */ }

            this._buildTimetableGrid(existingData);
            await this._prefetchTeachersForExistingData(existingData);
            this.showTimetableGrid = true;
        } catch (e) {
            this.showToast('Error', 'Failed to load timetable: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async _prefetchTeachersForExistingData(existingData) {
        const subjectIds = [...new Set(
            Object.values(existingData).map(rec => rec.subjectId).filter(id => !!id)
        )];
        if (subjectIds.length === 0) return;

        await Promise.all(subjectIds.map(async (subjectId) => {
            if (this._subjectTeacherCache[subjectId]) return;
            try {
                let teacherOptions = [];
                try {
                    const result = await getTeachersForSubjectInClass({ subjectId, classSectionId: this.ttSelectedClassSectionId });
                    teacherOptions = (result || []).map(t => ({ label: t.Name, value: t.Id }));
                } catch (_e1) {
                    try {
                        const bySubject = await getTeachersForSubject({ subjectIds: [subjectId], className: this.ttSelectedClassName || '' });
                        const teachers = bySubject[subjectId] || [];
                        teacherOptions = teachers.map(t => ({ label: t.Name || t.name || '', value: t.Id || t.id || '' }));
                    } catch (_e2) {
                        teacherOptions = this.ttTeacherOptions || [];
                    }
                }
                if (teacherOptions.length === 0) teacherOptions = this.ttTeacherOptions || [];
                this._subjectTeacherCache[subjectId] = teacherOptions;
            } catch (err) {
                this._subjectTeacherCache[subjectId] = this.ttTeacherOptions || [];
            }
        }));

        this.timetableRows = this.timetableRows.map(row => ({
            ...row,
            periods: row.periods.map(p => {
                if (!p.subjectId) return p;
                const teacherOptions = this._subjectTeacherCache[p.subjectId] || [];
                return {
                    ...p,
                    teacherId: p.teacherId,
                    teacherOptions,
                    teacherDisabled:    teacherOptions.length === 0,
                    teacherPlaceholder: teacherOptions.length > 0 ? 'Select Teacher' : 'No teachers found',
                };
            })
        }));
    }

    _buildTimetableGrid(existingData) {
        this._subjectTeacherCache = {};

        const periodTimes = this._periodTimings.length > 0
            ? this._periodTimings
            : DEFAULT_PERIOD_TIMES.map(t => ({ num: t.num, start: t.start, end: t.end, timeLabel: t.start + ' – ' + t.end }));

        this.timetableRows = SCHOOL_DAYS.map(dayInfo => {
            const periods = periodTimes.map(pt => {
                const key       = dayInfo.day + '_' + pt.num;
                const rec       = existingData[key] || {};
                const subjectId = rec.subjectId || '';
                const teacherId = rec.teacherId || '';

                // ── Leave / substitute data from Apex ──
                const isOnLeave             = rec.isOnLeave             === true;
                const onLeaveTeacherName    = rec.onLeaveTeacherName    || null;
                const substituteTeacherName = rec.substituteTeacherName || null;
                const substituteTeacherId   = rec.substituteTeacherId   || null;

                // Cell CSS class: amber highlight when teacher is on leave
                let cellClass = 'tt-grid-cell';
                if (isOnLeave && substituteTeacherId) {
                    cellClass += ' tt-grid-cell-substituted'; // orange — sub assigned
                } else if (isOnLeave) {
                    cellClass += ' tt-grid-cell-on-leave';    // red/amber — no sub yet
                }

                return {
                    key,
                    num:               pt.num,
                    subjectId,
                    teacherId,
                    periodId:          rec.periodId          || '',
                    isOnLeave,
                    onLeaveTeacherName,
                    substituteTeacherName,
                    substituteTeacherId,
                    cellClass,
                    hasSubstitute:     isOnLeave && !!substituteTeacherId,
                    needsSubstitute:   isOnLeave && !substituteTeacherId,
                    teacherOptions:    [],
                    teacherDisabled:   true,
                    teacherPlaceholder: subjectId ? 'Loading teachers…' : 'Select subject first',
                };
            });

            // Count leave cells for day badge
            const leaveCount = periods.filter(p => p.isOnLeave).length;
            return {
                day:       dayInfo.day,
                dayLabel:  dayInfo.dayLabel,
                dayShort:  dayInfo.dayShort,
                leaveCount,
                hasLeave:  leaveCount > 0,
                periods
            };
        });
    }

    get periodHeaders() {
        const timings = this._periodTimings.length > 0
            ? this._periodTimings
            : DEFAULT_PERIOD_TIMES.map(t => ({ num: t.num, start: t.start, end: t.end, timeLabel: t.start + ' – ' + t.end }));
        return timings.map(pt => ({
            num:       pt.num,
            timeLabel: pt.timeLabel || (pt.start + ' – ' + pt.end)
        }));
    }

    async handleTTSubjectChange(e) {
        const day       = e.target.dataset.day;
        const periodNum = parseInt(e.target.dataset.period);
        const subjectId = e.detail.value;

        this.timetableRows = this.timetableRows.map(row => {
            if (row.day !== day) return row;
            return {
                ...row,
                periods: row.periods.map(p => {
                    if (p.num !== periodNum) return p;
                    return {
                        ...p,
                        subjectId,
                        teacherId:          '',
                        teacherOptions:     [],
                        teacherDisabled:    true,
                        teacherPlaceholder: subjectId ? 'Loading teachers…' : 'Select subject first',
                    };
                })
            };
        });

        if (!subjectId) return;

        if (this._subjectTeacherCache[subjectId]) {
            this._applyTeacherOptionsToCell(day, periodNum, subjectId, this._subjectTeacherCache[subjectId]);
            return;
        }

        try {
            let teacherOptions = [];
            try {
                const result = await getTeachersForSubjectInClass({ subjectId, classSectionId: this.ttSelectedClassSectionId });
                teacherOptions = (result || []).map(t => ({ label: t.Name, value: t.Id }));
            } catch (apexErr) {
                try {
                    const bySubject = await getTeachersForSubject({ subjectIds: [subjectId], className: this.ttSelectedClassName || '' });
                    const teachers = bySubject[subjectId] || [];
                    teacherOptions = teachers.map(t => ({ label: t.Name || t.name || '', value: t.Id || t.id || '' }));
                } catch (fallbackErr) {
                    teacherOptions = this.ttTeacherOptions || [];
                }
            }

            if (teacherOptions.length === 0) teacherOptions = this.ttTeacherOptions || [];
            this._subjectTeacherCache[subjectId] = teacherOptions;
            this._applyTeacherOptionsToCell(day, periodNum, subjectId, teacherOptions);
        } catch (err) {
            const fallback = this.ttTeacherOptions || [];
            this._subjectTeacherCache[subjectId] = fallback;
            this._applyTeacherOptionsToCell(day, periodNum, subjectId, fallback);
        }
    }

    _applyTeacherOptionsToCell(day, periodNum, subjectId, teacherOptions) {
        this.timetableRows = this.timetableRows.map(row => {
            if (row.day !== day) return row;
            return {
                ...row,
                periods: row.periods.map(p => {
                    if (p.num !== periodNum) return p;
                    if (p.subjectId !== subjectId) return p;
                    return {
                        ...p,
                        teacherOptions,
                        teacherDisabled:    teacherOptions.length === 0,
                        teacherPlaceholder: teacherOptions.length > 0 ? 'Select Teacher' : 'No teachers found',
                    };
                })
            };
        });
    }

    handleTTTeacherChange(e) {
        const day       = e.target.dataset.day;
        const periodNum = parseInt(e.target.dataset.period);
        const value     = e.detail.value;
        this._updateTimetableCell(day, periodNum, 'teacherId', value);
    }

    _updateTimetableCell(day, periodNum, field, value) {
        this.timetableRows = this.timetableRows.map(row => {
            if (row.day !== day) return row;
            return {
                ...row,
                periods: row.periods.map(p => {
                    if (p.num !== periodNum) return p;
                    return { ...p, [field]: value };
                })
            };
        });
    }

    // ── LEAVE CELL CLICK — open substitute assignment modal ──
    async handleLeaveCellClick(e) {
        e.stopPropagation();
        const day       = e.currentTarget.dataset.day;
        const periodNum = parseInt(e.currentTarget.dataset.period);
        const periodId  = e.currentTarget.dataset.periodId;

        // Find the cell in timetableRows
        const dayRow = this.timetableRows.find(r => r.day === day);
        if (!dayRow) return;
        const cell = dayRow.periods.find(p => p.num === periodNum);
        if (!cell || !cell.isOnLeave) return;

        // Find subject name from options
        const subjectOpt = this.ttSubjectOptions.find(o => o.value === cell.subjectId);
        const subjectName = subjectOpt ? subjectOpt.label : 'Unknown Subject';

        this.subModalContext = {
            day, periodNum, periodId,
            subjectId:        cell.subjectId,
            subjectName,
            onLeaveTeacher:   cell.onLeaveTeacherName  || 'Original Teacher',
            currentSubId:     cell.substituteTeacherId || '',
            currentSubName:   cell.substituteTeacherName || '',
        };
        this.subModalTeacherId = cell.substituteTeacherId || '';
        this.subModalTeacherOptions = [];

        this.showSubstituteModal = true;
        this.subModalLoading = true;

        // Load teachers for this subject
        try {
            let options = [];
            try {
                const result = await getTeachersForSubjectInClass({
                    subjectId:      cell.subjectId,
                    classSectionId: this.ttSelectedClassSectionId
                });
                options = (result || []).map(t => ({ label: t.Name, value: t.Id }));
            } catch (_e) {
                options = this.ttTeacherOptions || [];
            }
            if (options.length === 0) options = this.ttTeacherOptions || [];
            this.subModalTeacherOptions = options;
        } catch (err) {
            this.subModalTeacherOptions = this.ttTeacherOptions || [];
        } finally {
            this.subModalLoading = false;
        }
    }

    handleSubModalTeacherChange(e) {
        this.subModalTeacherId = e.detail.value;
    }

    handleCloseSubstituteModal() {
        this.showSubstituteModal = false;
        this.subModalContext     = {};
        this.subModalTeacherId   = '';
    }

    async handleSaveSubstitute() {
        if (!this.subModalTeacherId) {
            this.showToast('Error', 'Please select a substitute teacher', 'error');
            return;
        }
        const { day, periodNum, periodId } = this.subModalContext;
        if (!periodId) {
            this.showToast('Error', 'No period ID — please save the timetable first, then assign substitute', 'warning');
            return;
        }
        try {
            this.isLoading = true;
            await saveSubstituteForPeriod({
                periodId:            periodId,
                substituteTeacherId: this.subModalTeacherId
            });

            // Find selected teacher name
            const opt = this.subModalTeacherOptions.find(o => o.value === this.subModalTeacherId);
            const subName = opt ? opt.label : '';

            // Update cell in timetableRows reactively
            this.timetableRows = this.timetableRows.map(row => {
                if (row.day !== day) return row;
                return {
                    ...row,
                    periods: row.periods.map(p => {
                        if (p.num !== periodNum) return p;
                        return {
                            ...p,
                            substituteTeacherId:   this.subModalTeacherId,
                            substituteTeacherName: subName,
                            hasSubstitute:         true,
                            needsSubstitute:       false,
                            cellClass:             'tt-grid-cell tt-grid-cell-substituted',
                        };
                    })
                };
            });

            this.showToast('Success', `Substitute "${subName}" assigned for ${this.subModalContext.subjectName} — ${day} Period ${periodNum}`, 'success');
            this.showSubstituteModal = false;
            this.subModalContext     = {};
            this.subModalTeacherId   = '';
        } catch (err) {
            this.showToast('Error', 'Failed to save substitute: ' + this.getErrorMessage(err), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async handleSaveTimetable() {
        if (!this.ttSelectedClassSectionId) { this.showToast('Error', 'No class section selected', 'error'); return; }

        const periodTimes = this._periodTimings.length > 0
            ? this._periodTimings
            : DEFAULT_PERIOD_TIMES.map(t => ({ num: t.num, start: t.start, end: t.end }));

        const periodsData = [];
        this.timetableRows.forEach(row => {
            row.periods.forEach(p => {
                if (p.subjectId || p.teacherId) {
                    const pt = periodTimes.find(t => t.num === p.num) || periodTimes[p.num - 1];
                    periodsData.push({
                        periodId:       p.periodId   || null,
                        day:            row.day,
                        periodNumber:   p.num,
                        subjectId:      p.subjectId  || null,
                        teacherId:      p.teacherId  || null,
                        startTime:      pt ? pt.start : '',
                        endTime:        pt ? pt.end   : '',
                        classSectionId: this.ttSelectedClassSectionId,
                        academicYearId: this.ttSelectedAcademicYear,
                        startDate:      this.ttStartDate  || null,
                        endDate:        this.ttEndDate    || null,
                        frequency:      this.ttFrequency
                    });
                }
            });
        });

        if (periodsData.length === 0) {
            this.showToast('Warning', 'Please fill at least one period before saving', 'warning');
            return;
        }

        try {
            this.isLoading = true;
            await saveTimetablePeriods({
                periodsData:    JSON.stringify(periodsData),
                classSectionId: this.ttSelectedClassSectionId,
                academicYearId: this.ttSelectedAcademicYear,
                startDate:      this.ttStartDate,
                endDate:        this.ttEndDate || this.ttStartDate,
                frequency:      this.ttFrequency
            });
            this.timetableSuccessMessage = `${periodsData.length} period record(s) saved for ${this.ttSelectedClassName}`;
            this.showTimetableSuccessModal = true;
        } catch (e) {
            this.showToast('Error', 'Failed to save timetable: ' + this.getErrorMessage(e), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleClearTimetable() {
        this._subjectTeacherCache = {};
        this._buildTimetableGrid({});
    }

    handleCloseTimetableSuccess() { this.showTimetableSuccessModal = false; }

    handleTimetableDone() {
        this.showTimetableSuccessModal = false;
        this.isTimetableView  = false;
        this.showTimetableGrid = false;
    }

    // ── UTILITY ──
    _getInitials(name) {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    _loadColor(pct) {
        if (pct >= 90) return '#10b981';
        return '#ef4444';
    }

    _loadBg(pct) {
        if (pct >= 90) return '#fef2f2';
        return '#ecfdf5';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    getErrorMessage(error) {
        if (error?.body?.message) return error.body.message;
        if (error?.body?.pageErrors?.[0]?.message) return error.body.pageErrors[0].message;
        return error?.message || 'Unknown error';
    }
}