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
            // Get subjects from Account picklist field (as per your data model)
            Schema.DescribeFieldResult fieldResult = Account.Subject__c.getDescribe();
            List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
            
            Integer counter = 1;
            for (Schema.PicklistEntry entry : picklistValues) {
                if (entry.isActive()) {
                    subjectWrappers.add(new SubjectWrapper(
                        'SUBJ' + String.valueOf(counter).leftPad(3, '0'),
                        entry.getValue(),
                        100 // Default max marks
                    ));
                    counter++;
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
            // Get Exam Type from Exam object's Exam_Type__c field (picklist)
            Schema.DescribeFieldResult fieldResult = Exam__c.Exam_Type__c.getDescribe();
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
        System.debug('Class ID: ' + classId);
        System.debug('Subject Name: ' + subjectName);
        System.debug('Exam Type: ' + examType);
        
        // Get Class details
        Class__c classRecord = [
            SELECT Id, Name, Class__c, Section__c 
            FROM Class__c 
            WHERE Id = :classId 
            LIMIT 1
        ];
        
        System.debug('Class Record Name: ' + classRecord.Name);
        System.debug('Class__c field value: [' + classRecord.Class__c + ']');
        System.debug('Section__c field value: [' + classRecord.Section__c + ']');

        // ✅ FIX 1: Remove PersonAccount filter — students are Business Accounts with Type='Student'
        // ✅ FIX 2: Match using Class__c = classRecord.Name (e.g. 'Class-7')
        //           because Account.Class__c stores 'Class-7' not just '7'
        List<Account> students = [
            SELECT Id, Name, Roll_No__c, Class__c, Section__c, Type
            FROM Account
            WHERE Type = 'Student'
              AND Class__c = :classRecord.Name   // ✅ Use .Name not .Class__c
            ORDER BY Name
            LIMIT 50000
        ];

        System.debug('Students found: ' + students.size());
        
        if (students.isEmpty()) {
            // ✅ Extra debug: show what Class__c values exist on accounts
            List<Account> debugSample = [
                SELECT Id, Name, Class__c, Section__c, Type 
                FROM Account 
                WHERE Type = 'Student' 
                LIMIT 5
            ];
            for (Account a : debugSample) {
                System.debug('Sample Account → Name:' + a.Name + 
                    ' Class__c:[' + a.Class__c + ']' + 
                    ' Section__c:[' + a.Section__c + ']');
            }
            return result;
        }

        Set<Id> studentIds = new Set<Id>();
        for (Account s : students) {
            studentIds.add(s.Id);
        }

        // Check for existing Exam records
        Map<Id, Exam__c> examMarksMap = new Map<Id, Exam__c>();
        String subjectFieldName = subjectName.replace(' ', '_') + '__c';
        
        // Setup namespace aware check
        String ns = EnterMarksController.class.getName().contains('.') ? EnterMarksController.class.getName().substringBefore('.') : '';
        String prefix = String.isNotBlank(ns) ? ns + '__' : '';
        Map<String, Schema.SObjectField> examFields = Schema.SObjectType.Exam__c.fields.getMap();
        
        if (!examFields.containsKey(subjectFieldName.toLowerCase()) && examFields.containsKey((prefix + subjectFieldName).toLowerCase())) {
            subjectFieldName = prefix + subjectFieldName;
        }

        try {
            String query = 'SELECT Id, Student__c, Exam_Type__c, ' + subjectFieldName + 
                          ' FROM Exam__c ' +
                          'WHERE Student__c IN :studentIds ' +
                          'AND Exam_Type__c = :examType';
            
            List<Exam__c> existingExams = Database.query(query);
            for (Exam__c exam : existingExams) {
                examMarksMap.put(exam.Student__c, exam);
            }
            System.debug('Existing exam records found: ' + examMarksMap.size());
            
        } catch (Exception e) {
            System.debug('Warning: Could not query subject field ' + subjectFieldName + ': ' + e.getMessage());
        }

        // Build Response
        for (Account student : students) {
            Map<String, Object> row = new Map<String, Object>();
            row.put('studentId', student.Id);
            row.put('name', student.Name);
            row.put('rollNumber', student.Roll_No__c);

            if (examMarksMap.containsKey(student.Id)) {
                Exam__c exam = examMarksMap.get(student.Id);
                row.put('hasMarks', true);
                Object marksValue = exam.get(subjectFieldName);
                row.put('obtainedMarks', marksValue != null ? marksValue : 0);
                row.put('maxMarks', 100);
                row.put('examId', exam.Id);
            } else {
                row.put('hasMarks', false);
                row.put('obtainedMarks', null);
            }
            result.add(row);
        }

        System.debug('✅ Result size: ' + result.size());
        return result;

    } catch (Exception e) {
        System.debug('❌ Error: ' + e.getMessage());
        System.debug('Stack: ' + e.getStackTraceString());
        throw new AuraHandledException('Error loading students: ' + e.getMessage());
    }
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

        // ✅ Build field API name
        String subjectField = subjectName.replace(' ', '_') + '__c';

        // Setup namespace aware check
        String ns = EnterMarksController.class.getName().contains('.') ? EnterMarksController.class.getName().substringBefore('.') : '';
        String prefix = String.isNotBlank(ns) ? ns + '__' : '';

        // ✅ Validate field exists on Exam__c
        Map<String, Schema.SObjectField> examFields = Schema.SObjectType.Exam__c.fields.getMap();
        Boolean hasField = examFields.containsKey(subjectField.toLowerCase());
        Boolean hasNsField = examFields.containsKey((prefix + subjectField).toLowerCase());

        if (!hasField && hasNsField) {
            subjectField = prefix + subjectField;
            hasField = true; 
        }

        if (!hasField) {
            throw new AuraHandledException(
                'Subject field "' + subjectField + '" does not exist on Exam__c. ' +
                'Available fields: ' + String.join(new List<String>(examFields.keySet()), ', ')
            );
        }

        // ✅ Detect the actual field type to avoid "Illegal assignment from Decimal to String"
        Schema.DisplayType fieldType = examFields.get(subjectField.toLowerCase())
                                                  .getDescribe()
                                                  .getType();
        Boolean isTextField = (fieldType == Schema.DisplayType.STRING  ||
                               fieldType == Schema.DisplayType.TEXTAREA ||
                               fieldType == Schema.DisplayType.PICKLIST);

        System.debug('Subject field: ' + subjectField + ' | Type: ' + fieldType + ' | isTextField: ' + isTextField);

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
        for (Exam__c ex : [
            SELECT Id, Student__c, Exam_Type__c, Class__c, Section__c
            FROM Exam__c
            WHERE Student__c IN :studentIds
              AND Exam_Type__c = :examType
        ]) {
            examByStudent.put(ex.Student__c, ex);
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
                exam.Student__c   = studentId;
                exam.Exam_Type__c = examType;
                exam.Class__c     = classRec.Id;
                exam.Section__c   = classRec.Section__c;

                Account stu = studentMap.get(studentId);
                exam.Name = (stu != null ? stu.Name : studentId) 
                            + ' - ' + subjectName 
                            + ' - ' + examType;
            }

            // ✅ THE FIX: assign correct type based on field definition
            if (isTextField) {
                exam.put(subjectField, String.valueOf(marks.intValue())); // store as String
            } else {
                exam.put(subjectField, marks); // store as Decimal/Number
            }

            examsToUpsert.add(exam);
        }

        /* =========================
           7. Save
           ========================= */
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
    // Helper method to get subject name from ID
    private static String getSubjectNameById(String subjectId) {
        List<SubjectWrapper> subjects = getSubjects();
        for (SubjectWrapper subj : subjects) {
            if (subj.id == subjectId) {
                return subj.name;
            }
        }
        return null;
    }

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