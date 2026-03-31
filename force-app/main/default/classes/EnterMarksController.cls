public class EnterMarksController {

   @AuraEnabled(cacheable=true)
public static List<Map<String, Object>> getClasses() {
    List<Map<String, Object>> classList = new List<Map<String, Object>>();
    
    try {
        System.debug('=== GETTING CLASSES ===');
        
        // Query all classes
        List<Class__c> classes = [
            SELECT Id, Name, Class__c, Section__c
            FROM Class__c 
            ORDER BY Name
        ];
        
        System.debug('Classes found: ' + classes.size());
        
        // Add each class to the list
        for (Class__c cls : classes) {
            Map<String, Object> classMap = new Map<String, Object>();
            classMap.put('value', cls.Id);  // This must be the Salesforce ID
            classMap.put('label', cls.Name);
            classMap.put('displayName', cls.Name);
            classMap.put('Name', cls.Name);
            classMap.put('Id', cls.Id);
            classMap.put('Class__c', cls.Class__c);      // Actual class value
            classMap.put('Section__c', cls.Section__c);  // Actual section value
            
            classList.add(classMap);
            System.debug('Added class: ' + cls.Name + ' (ID: ' + cls.Id + ')');
        }
        
        System.debug('✅ Total classes returned: ' + classList.size());
        return classList;
        
    } catch (Exception e) {
        System.debug('❌ Error in getClasses: ' + e.getMessage());
        System.debug('Stack trace: ' + e.getStackTraceString());
        throw new AuraHandledException('Failed to load classes: ' + e.getMessage());
    }
}
    @AuraEnabled(cacheable=true)
    public static List<SubjectWrapper> getSubjects() {
        List<SubjectWrapper> subjectWrappers = new List<SubjectWrapper>();

        try {
            System.debug('=== FETCHING SUBJECTS ===');
            
            // 1. Try to fetch from Subject__c object (dynamic for namespace)
            String subjObjName = 'Subject__c';
            Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
            if(!gd.containsKey(subjObjName)) subjObjName = 'EduTrack__Subject__c';
            
            if(gd.containsKey(subjObjName)) {
                String subjQuery = 'SELECT Id, Name FROM ' + subjObjName + ' WHERE Is_Active__c = true ORDER BY Name';
                List<SObject> subjects = Database.query(subjQuery);
                for (SObject s : subjects) {
                    subjectWrappers.add(new SubjectWrapper((String)s.get('Id'), (String)s.get('Name'), 100));
                }
            }
            
            // 2. Fallback: If still empty, use fields from Exam__c (DevOrg1 style)
            if (subjectWrappers.isEmpty()) {
                Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Exam__c.fields.getMap();
                for (String apiName : fieldMap.keySet()) {
                    if (apiName.endsWith('__c') && !apiName.contains('Class') && !apiName.contains('Type') && !apiName.contains('Student') && !apiName.contains('Teacher')) {
                        Schema.DescribeFieldResult dfr = fieldMap.get(apiName).getDescribe();
                        if (dfr.getType() == Schema.DisplayType.DOUBLE || dfr.getType() == Schema.DisplayType.INTEGER || dfr.getType() == Schema.DisplayType.CURRENCY) {
                            subjectWrappers.add(new SubjectWrapper(apiName, dfr.getLabel(), 100));
                        }
                    }
                }
            }
            
            System.debug('✅ Subjects returned: ' + subjectWrappers.size());
            return subjectWrappers;
            
        } catch (Exception e) {
            System.debug('❌ Error in getSubjects: ' + e.getMessage());
            throw new AuraHandledException('Error fetching subjects: ' + e.getMessage());
        }
    }
 
    @AuraEnabled(cacheable=true)
    public static List<String> getExamTypes() {
        try {
            // ✅ Dynamic resolver for namespaced Exam Type field
            Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Exam__c.fields.getMap();
            String examTypeField = fieldMap.containsKey('edutrack__exam_type__c') ? 'EduTrack__Exam_Type__c' : 'Exam_Type__c';
            
            Schema.DescribeFieldResult fieldResult = fieldMap.get(examTypeField.toLowerCase()).getDescribe();
            List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
            List<String> examTypes = new List<String>();
            
            for (Schema.PicklistEntry entry : picklistValues) {
                if (entry.isActive()) {
                    examTypes.add(entry.getValue());
                }
            }
            
            System.debug('✅ Exam Types: ' + examTypes);
            return examTypes;
            
        } catch (Exception e) {
            System.debug('❌ Error in getExamTypes: ' + e.getMessage());
            throw new AuraHandledException('Error fetching exam types: ' + e.getMessage());
        }
    }
 
  @AuraEnabled
public static List<Map<String, Object>> getStudentsForMarksEntry(
    Id classId,
    String subjectName,
    String examType
) {
    List<Map<String, Object>> result = new List<Map<String, Object>>();

    try {
        System.debug('=== GET STUDENTS FOR MARKS ENTRY ===');
        System.debug('Class ID: ' + classId + ' | Subject: ' + subjectName + ' | Exam: ' + examType);
        
        // Resolve Field Name Dynamically
        String subjectFieldName = findSubjectField(subjectName);
        System.debug('Resolved field name: ' + subjectFieldName);

        // Resolve Account field names defensively
        Map<String, Schema.SObjectField> accFields = Schema.SObjectType.Account.fields.getMap();
        String accClassField   = accFields.containsKey('edutrack__class__c') ? 'EduTrack__Class__c' : 'Class__c';
        String accSectionField = accFields.containsKey('edutrack__section__c') ? 'EduTrack__Section__c' : 'Section__c';
        String accRollField    = accFields.containsKey('edutrack__roll_no__c') ? 'EduTrack__Roll_No__c' : 'Roll_No__c';
        
        // Resolve Class specifics defensively
        Map<String, Schema.SObjectField> clsFields = Schema.SObjectType.Class__c.fields.getMap();
        String clsValField = clsFields.containsKey('edutrack__class__c') ? 'EduTrack__Class__c' : 'Class__c';
        String clsSecField = clsFields.containsKey('edutrack__section__c') ? 'EduTrack__Section__c' : 'Section__c';
        
        // Fetch the Class and Section values from the Class__c record
        String clsQuery = 'SELECT Id, Name, ' + clsValField + ', ' + clsSecField + ' FROM Class__c WHERE Id = :classId LIMIT 1';
        SObject classRecord = Database.query(clsQuery);
        String classLabel   = (String)classRecord.get(clsValField);
        String sectionLabel = (String)classRecord.get(clsSecField);

        // ✅ FINAL FIX: Resolve Picklist API Names from Labels
        String classApiValue   = getPicklistApiValue(accClassField, classLabel);
        String sectionApiValue = getPicklistApiValue(accSectionField, sectionLabel);

        String studentQuery = 'SELECT Id, Name, ' + accRollField + ', ' + accClassField + ', ' + accSectionField + ', Type ' +
                             'FROM Account ' +
                             'WHERE Type = \'Student\' ' +
                             'AND ' + accClassField + ' = :classApiValue ' +
                             'AND ' + accSectionField + ' = :sectionApiValue ' +
                             'ORDER BY Name ' +
                             'LIMIT 50000';
                             
        List<Account> students = Database.query(studentQuery);

        if (students.isEmpty()) return result;

        Set<Id> studentIds = new Set<Id>();
        for (Account s : students) studentIds.add(s.Id);

        // Check for existing Exam records
        Map<Id, Exam__c> examMarksMap = new Map<Id, Exam__c>();
        try {
            // ✅ Resolve all fields dynamically to handle namespaces
            String examStudentField = Exam__c.Student__c.getDescribe().getName();
            String examTypeField = Exam__c.Exam_Type__c.getDescribe().getName();
            String extraMarksField = findSubjectField('Extra Marks'); // Resolve Extra_Marks__c
            
            String query = 'SELECT Id, ' + examStudentField + ', ' + examTypeField;
            if (subjectFieldName != null) query += ', ' + subjectFieldName;
            if (extraMarksField != null) query += ', ' + extraMarksField;
            
            query += ' FROM Exam__c ' +
                     'WHERE ' + examStudentField + ' IN :studentIds ' +
                     'AND ' + examTypeField + ' = :examType';
            
            for (Exam__c exam : Database.query(query)) {
                Id studentId = (Id)exam.get(examStudentField);
                examMarksMap.put(studentId, exam);
            }
        } catch (Exception e) {
            System.debug('Query failed: ' + e.getMessage());
        }

        for (Account student : students) {
            Map<String, Object> row = new Map<String, Object>();
            row.put('studentId', student.Id);
            row.put('name', student.Name);
            row.put('rollNumber', student.Roll_No__c);

            if (examMarksMap.containsKey(student.Id)) {
                Exam__c exam = examMarksMap.get(student.Id);
                row.put('hasMarks', true);
                row.put('examId', exam.Id);
                
                Object marksValue = null;
                if (subjectFieldName != null) {
                    marksValue = exam.get(subjectFieldName);
                } else {
                    // ✅ Dynamic Fallback: Check JSON for overflow subjects
                    String extraMarksField = findSubjectField('Extra Marks');
                    String jsonStr = (String) exam.get(extraMarksField);
                    if (String.isNotBlank(jsonStr)) {
                        try {
                            Map<String, Object> extraMarks = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
                            marksValue = extraMarks.get(subjectName);
                        } catch (Exception e) {
                            System.debug('JSON parse error: ' + e.getMessage());
                        }
                    }
                }
                
                row.put('obtainedMarks', marksValue != null ? marksValue : 0);
                row.put('maxMarks', 100);
            } else {
                row.put('hasMarks', false);
                row.put('obtainedMarks', null);
            }
            result.add(row);
        }
        return result;

    } catch (Exception e) {
        System.debug('❌ Error: ' + e.getMessage());
        throw new AuraHandledException(e.getMessage());
    }
}

/**
 * Robustly finds the correct field API name for a subject, handling namespaces and variations.
 */
@AuraEnabled
public static String findSubjectField(String subjectName) {
    if (String.isBlank(subjectName)) return null;
    
    String normalizedSearch = subjectName.toLowerCase().replace(' ', '').replace('_', '');
    Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Exam__c.fields.getMap();
    
    // Improved Prefix Detection
    String ns = EnterMarksController.class.getName().contains('.') 
                ? EnterMarksController.class.getName().substringBefore('.') + '__' 
                : '';
    if(String.isBlank(ns)){
        // Fallback to checking the object itself
        String objName = Exam__c.SObjectType.getDescribe().getName();
        if(objName.contains('__') && objName.indexOf('__') != objName.lastIndexOf('__')){
            ns = objName.substringBefore('__') + '__';
        }
    }

    String bestMatch = null;
    for (String apiName : fieldMap.keySet()) {
        String baseName = apiName.toLowerCase();
        if (ns != '' && baseName.startsWith(ns.toLowerCase())) {
            baseName = baseName.substring(ns.length());
        }
        
        String normalizedField = baseName.replace('__c', '').replace('_', '');
        
        if (normalizedField == normalizedSearch) {
            return apiName;
        }
        
        if (normalizedField.startsWith(normalizedSearch)) {
            bestMatch = apiName;
        }
    }
    
    return bestMatch;
}
@AuraEnabled
public static String saveMarks(
    List<Map<String, Object>> studentMarksDataList,
    String examType,
    Id classId,
    Id teacherId
) {
    Savepoint sp = Database.setSavepoint();

    try {
        if (studentMarksDataList == null || studentMarksDataList.isEmpty()) {
            throw new AuraHandledException('No marks data provided');
        }

        /* =========================
           1. Get Class record
           ========================= */
        Class__c classRec = [
            SELECT Id, Name, Section__c
            FROM Class__c
            WHERE Id = :classId
            LIMIT 1
        ];

        /* =========================
           2. Subject handling
           ========================= */
        String subjectId   = (String) studentMarksDataList[0].get('subjectId');
        String subjectName = getSubjectNameById(subjectId);

        if (String.isBlank(subjectName)) {
            throw new AuraHandledException('Could not resolve subject name for ID: ' + subjectId);
        }

        // ✅ Build field API name dynamically
        String subjectField = findSubjectField(subjectName);
        String extraMarksField = findSubjectField('Extra Marks'); // Resolve Extra_Marks__c

        Boolean isOverflow = (subjectField == null);
        Boolean isTextField = false;

        if (!isOverflow) {
            // ✅ Detect the actual field type
            Map<String, Schema.SObjectField> examFields = Schema.SObjectType.Exam__c.fields.getMap();
            Schema.DisplayType fieldType = examFields.get(subjectField.toLowerCase()).getDescribe().getType();
            isTextField = (fieldType == Schema.DisplayType.STRING  ||
                           fieldType == Schema.DisplayType.TEXTAREA ||
                           fieldType == Schema.DisplayType.PICKLIST);
        }

        System.debug('Subject: ' + subjectName + ' | field: ' + subjectField + ' | isOverflow: ' + isOverflow);

        /* =========================
           3. Collect Student IDs
           ========================= */
        Set<Id> studentIds = new Set<Id>();
        for (Map<String, Object> row : studentMarksDataList) {
            studentIds.add((Id) row.get('studentId'));
        }

        /* =========================
           4. Student Map
           ========================= */
        Map<Id, Account> studentMap = new Map<Id, Account>([
            SELECT Id, Name
            FROM Account
            WHERE Id IN :studentIds
        ]);

        /* =========================
           5. Existing Exam records
           ========================= */
        Map<Id, Exam__c> examByStudent = new Map<Id, Exam__c>();
        
        // Resolve Fields Dynamically
        String examStudentField = Exam__c.Student__c.getDescribe().getName();
        String examTypeField = Exam__c.Exam_Type__c.getDescribe().getName();
        String examClassField = Exam__c.Class__c.getDescribe().getName();
        String examSectionField = Exam__c.Section__c.getDescribe().getName();
        
        String query = 'SELECT Id, ' + examStudentField + ', ' + examTypeField + ', ' + examClassField + ', ' + examSectionField;
        if (extraMarksField != null) query += ', ' + extraMarksField;
        
        query += ' FROM Exam__c ' +
                 'WHERE ' + examStudentField + ' IN :studentIds ' +
                 'AND ' + examTypeField + ' = :examType';

        for (Exam__c ex : Database.query(query)) {
            Id sId = (Id)ex.get(examStudentField);
            examByStudent.put(sId, ex);
        }

        /* =========================
           6. Prepare Exam records
           ========================= */
        List<Exam__c> examsToUpsert = new List<Exam__c>();

        for (Map<String, Object> row : studentMarksDataList) {

            Id      studentId = (Id) row.get('studentId');
            Decimal marks     = Decimal.valueOf(String.valueOf(row.get('obtainedMarks')));

            Exam__c exam;
            if (examByStudent.containsKey(studentId)) {
                exam = examByStudent.get(studentId);
            } else {
                exam = new Exam__c();
                // Resolve and set fields
                examStudentField = Exam__c.Student__c.getDescribe().getName();
                examTypeField = Exam__c.Exam_Type__c.getDescribe().getName();
                examClassField = Exam__c.Class__c.getDescribe().getName();
                examSectionField = Exam__c.Section__c.getDescribe().getName();
                
                exam.put(examStudentField, studentId);
                exam.put(examTypeField,    examType);
                exam.put(examClassField,   classRec.Id);
                exam.put(examSectionField, classRec.Section__c);

                Account stu = studentMap.get(studentId);
                exam.Name = (stu != null ? stu.Name : studentId) 
                            + ' - ' + subjectName 
                            + ' - ' + examType;
            }

            // ✅ THE FIX: assign correct type based on field definition
            if (isOverflow) {
                // ✅ Overflow handling: Store in JSON
                if (extraMarksField != null) {
                    Map<String, Object> extraMarks = new Map<String, Object>();
                    String existingJson = (String) exam.get(extraMarksField);
                    if (String.isNotBlank(existingJson)) {
                        extraMarks = (Map<String, Object>) JSON.deserializeUntyped(existingJson);
                    }
                    extraMarks.put(subjectName, marks);
                    exam.put(extraMarksField, JSON.serialize(extraMarks));
                }
            } else {
                if (isTextField) {
                    exam.put(subjectField, String.valueOf(marks.intValue())); // store as String
                } else {
                    exam.put(subjectField, marks); // store as Decimal/Number
                }
            }

            examsToUpsert.add(exam);
        }

        /* =========================
           7. Save
           ========================= */
        System.debug('Upserting ' + examsToUpsert.size() + ' exam records.');
        upsert examsToUpsert;

        return 'Successfully saved marks for ' + examsToUpsert.size() + ' students';

    } catch (AuraHandledException ahe) {
        Database.rollback(sp);
        throw ahe;
    } catch (Exception e) {
        Database.rollback(sp);
        System.debug('❌ saveMarks error: ' + e.getMessage());
        System.debug('Stack: ' + e.getStackTraceString());
        throw new AuraHandledException('Error saving marks: ' + e.getMessage());
    }
}
    // Helper method to get subject name from Salesforce ID
    private static String getSubjectNameById(String subjectId) {
        if (String.isBlank(subjectId)) return null;
        try {
            List<Subject__c> subjects = [
                SELECT Id, Name FROM Subject__c WHERE Id = :subjectId LIMIT 1
            ];
            if (!subjects.isEmpty()) return subjects[0].Name;
        } catch (Exception e) {
            System.debug('getSubjectNameById error: ' + e.getMessage());
        }
        return null;
    }

    /**
     * Resolves the API Name of a picklist value from its Label.
     */
    private static String getPicklistApiValue(String fieldName, String label) {
        if (String.isBlank(label)) return label;
        
        try {
            Map<String, Schema.SObjectField> fields = Schema.SObjectType.Account.fields.getMap();
            if (!fields.containsKey(fieldName.toLowerCase())) return label;
            
            Schema.DescribeFieldResult dfr = fields.get(fieldName.toLowerCase()).getDescribe();
            if (dfr.getType() != Schema.DisplayType.PICKLIST) return label;
            
            for (Schema.PicklistEntry ple : dfr.getPicklistValues()) {
                if (ple.getLabel().equalsIgnoreCase(label) || ple.getValue().equalsIgnoreCase(label)) {
                    return ple.getValue();
                }
            }
        } catch (Exception e) {
            System.debug('Picklist resolve error: ' + e.getMessage());
        }
        return label;
    }

    /* - `[x]` Refactor EnterMarksController.cls for Dynamic Metadata
    - `[x]` Update getSubjects with Exam field fallback
    - `[x]` Update getExamTypes for namespace-safety
    - `[/]` Deploy Updated Controller to SunilDev
    - `[ ]` Run Live Diagnostic in SunilDev
    - `[ ]` Sync Final Verified Code to GitHub main branch */

    // Wrapper class for subjects
    public class SubjectWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public Decimal maxMarks { get; set; }
        @AuraEnabled public String icon { get; set; }
        
        public SubjectWrapper(String id, String name, Decimal maxMarks) {
            this.id = id;
            this.name = name;
            this.maxMarks = maxMarks;
            this.icon = name.substring(0, 1).toUpperCase();
        }
    }
}