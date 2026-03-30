public with sharing class GradesController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getInitialData() {
        try {
            Map<String, Object> result = new Map<String, Object>();
            
            // 1. Fetch Exam Type picklist values from Exam__c
            List<String> testTypes = new List<String>();
            Schema.DescribeFieldResult testField = Exam__c.Exam_Type__c.getDescribe();
            for (Schema.PicklistEntry entry : testField.getPicklistValues()) {
                if (entry.isActive()) testTypes.add(entry.getLabel());
            }
            result.put('testTypes', testTypes);
            
            // 2. Fetch Class picklist values from Account
            List<Map<String, String>> classOptions = new List<Map<String, String>>();
            Schema.DescribeFieldResult classField = Account.Class__c.getDescribe();
            for (Schema.PicklistEntry entry : classField.getPicklistValues()) {
                if (entry.isActive()) {
                    classOptions.add(new Map<String, String>{'label' => entry.getLabel(), 'value' => entry.getValue()});
                }
            }
            result.put('classOptions', classOptions);
            
            // 3. Fetch Section picklist values from Account
            List<Map<String, String>> sectionOptions = new List<Map<String, String>>();
            Schema.DescribeFieldResult sectionField = Account.Section__c.getDescribe();
            for (Schema.PicklistEntry entry : sectionField.getPicklistValues()) {
                if (entry.isActive()) {
                    sectionOptions.add(new Map<String, String>{'label' => entry.getLabel(), 'value' => entry.getValue()});
                }
            }
            result.put('sectionOptions', sectionOptions);
            
            // 4. Identify Subject Fields dynamically
            List<Map<String, String>> subjectMeta = new List<Map<String, String>>();
            Map<String, Schema.SObjectField> fields = Schema.SObjectType.Exam__c.fields.getMap();
            Set<String> excluded = new Set<String>{'Exam_Type__c', 'Roll_Number__c', 'Section__c', 'Class__c', 'Student__c', 'Name', 'Id', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp'};
            
            for (String fieldName : fields.keySet()) {
                Schema.DescribeFieldResult dfr = fields.get(fieldName).getDescribe();
                if (dfr.isCustom() && !excluded.contains(dfr.getName()) && !excluded.contains(dfr.getLocalName())) {
                    Schema.DisplayType dt = dfr.getType();
                    if (dt == Schema.DisplayType.Double || dt == Schema.DisplayType.Integer || dt == Schema.DisplayType.Percent || dt == Schema.DisplayType.String) {
                        subjectMeta.add(new Map<String, String>{
                            'label' => dfr.getLabel(), 
                            'field' => dfr.getLocalName()
                        }); 
                    }
                }
            }
            result.put('subjects', subjectMeta);
            
            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error initializing data: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getGradesData(String className, String sectionName, String examType, String searchTerm) {
        // 1. Identify Subject Fields dynamically
        List<String> subjectFields = new List<String>();
        Map<String, String> fieldToLocalMap = new Map<String, String>();
        Map<String, Schema.SObjectField> fields = Schema.SObjectType.Exam__c.fields.getMap();
        Set<String> excluded = new Set<String>{'Exam_Type__c', 'Roll_No__c', 'Roll_Number__c', 'Section__c', 'Class__c', 'Student__c', 'Name', 'Id', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp'};
        
        for (String fieldName : fields.keySet()) {
            Schema.DescribeFieldResult dfr = fields.get(fieldName).getDescribe();
            if (dfr.isCustom() && !excluded.contains(dfr.getName()) && !excluded.contains(dfr.getLocalName())) {
                Schema.DisplayType dt = dfr.getType();
                if (dt == Schema.DisplayType.Double || dt == Schema.DisplayType.Integer || dt == Schema.DisplayType.Percent || dt == Schema.DisplayType.String) {
                    subjectFields.add(dfr.getName());
                    fieldToLocalMap.put(dfr.getName(), dfr.getLocalName());
                }
            }
        }
        
        // 2. Build Query on Account (All Students)
        String examSelect = String.join(subjectFields, ', ');
        String subQuery = '(SELECT Id, Exam_Type__c, ' + examSelect + ' FROM Exams__r';
        if (String.isNotBlank(examType)) {
            subQuery += ' WHERE Exam_Type__c = \'' + String.escapeSingleQuotes(examType) + '\'';
        }
        subQuery += ' ORDER BY CreatedDate DESC)';
        
        String query = 'SELECT Id, Name, Roll_No__c, Class__c, Section__c, ' + subQuery + 
                       ' FROM Account WHERE Type = \'Student\'';
        
        if (String.isNotBlank(className)) {
            query += ' AND Class__c INCLUDES (:className)';
        }
        
        if (String.isNotBlank(sectionName)) {
            query += ' AND Section__c = :sectionName';
        }
        
        if (String.isNotBlank(searchTerm)) {
            String searchPattern = '%' + searchTerm + '%';
            query += ' AND (Name LIKE :searchPattern OR Roll_No__c LIKE :searchPattern)';
        }
        
        query += ' ORDER BY Name';
        
        try {
            List<Account> students = Database.query(query);
            List<Map<String, Object>> results = new List<Map<String, Object>>();
            
            for (Account s : students) {
                Map<String, Object> row = new Map<String, Object>();
                row.put('Id', s.Id);
                row.put('StudentId', s.Id);
                row.put('Name', s.Name);
                row.put('Roll_No__c', s.Roll_No__c);
                row.put('Class__c', s.Class__c);
                row.put('Section__c', s.Section__c);
                
                // Find matching exam for the selected type
                Exam__c matchingExam = null;
                if (s.Exams__r != null && !s.Exams__r.isEmpty()) {
                    // If examType is specified, take the first matching one. 
                    // If examType is null (All Tests), take the most recent one.
                    matchingExam = s.Exams__r[0];
                }
                
                row.put('Exam_Type__c', matchingExam != null ? matchingExam.Exam_Type__c : (String.isNotBlank(examType) ? examType : 'All Tests'));
                
                for (String f : subjectFields) {
                    Object val = (matchingExam != null) ? matchingExam.get(f) : null;
                    String localFieldName = fieldToLocalMap.get(f);
                    
                    if (val == null) {
                        row.put(localFieldName, 0); 
                    } else if (val instanceof String) {
                        try { 
                            row.put(localFieldName, Decimal.valueOf((String)val)); 
                        } catch (Exception ex) { 
                            row.put(localFieldName, 0); 
                        }
                    } else {
                        row.put(localFieldName, val);
                    }
                }
                results.add(row);
            }
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching grades: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getStudentExams(String studentId) {
        try {
            List<String> subjectFields = new List<String>();
            Map<String, Schema.SObjectField> fields = Schema.SObjectType.Exam__c.fields.getMap();
            Set<String> excluded = new Set<String>{'Exam_Type__c', 'Roll_No__c', 'Roll_Number__c', 'Section__c', 'Class__c', 'Student__c', 'Name', 'Id'};
            
            for (String fieldName : fields.keySet()) {
                Schema.DescribeFieldResult dfr = fields.get(fieldName).getDescribe();
                if (dfr.isCustom() && !excluded.contains(dfr.getName())) {
                    Schema.DisplayType dt = dfr.getType();
                    if (dt == Schema.DisplayType.Double || dt == Schema.DisplayType.Integer || dt == Schema.DisplayType.Percent || dt == Schema.DisplayType.String) {
                        subjectFields.add(dfr.getName());
                    }
                }
            }

            String examSelect = String.join(subjectFields, ', ');
            String query = 'SELECT Id, Exam_Type__c, Class__c, Class__r.Name, Section__c, ' + examSelect + 
                           ' FROM Exam__c WHERE Student__c = :studentId ORDER BY CreatedDate DESC';
            
            List<Exam__c> exams = Database.query(query);
            List<Map<String, Object>> results = new List<Map<String, Object>>();
            
            for (Exam__c e : exams) {
                Map<String, Object> row = new Map<String, Object>();
                row.put('Id', e.Id);
                row.put('Exam_Type__c', e.Exam_Type__c);
                row.put('Class__c', String.isNotBlank(e.Class__r.Name) ? e.Class__r.Name : '');
                row.put('Section__c', e.Section__c);
                for (String f : subjectFields) {
                    Object val = e.get(f);
                    if (val instanceof String) {
                        try { row.put(f, Decimal.valueOf((String)val)); } catch (Exception ex) { row.put(f, 0); }
                    } else {
                        row.put(f, val);
                    }
                }
                results.add(row);
            }
            return results;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching student exams: ' + e.getMessage());
        }
    }
}