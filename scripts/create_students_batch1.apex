Id rtId = '012f6000000zlGXAAY'; // True Person Account RecordType
Id ayId = [SELECT Id, Name FROM Academic_Year__c WHERE Name LIKE '%2025%' LIMIT 1].Id;
String ayName = [SELECT Name FROM Academic_Year__c WHERE Id = :ayId LIMIT 1].Name;

List<String> classes = new List<String>{'LKG', 'UKG', 'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5'};
List<String> sections = new List<String>{'A', 'B', 'C', 'D', 'E'};

List<String> firstNames = new List<String>{
    'Aarav', 'Advik', 'Akash', 'Ananya', 'Arjun', 'Avni', 'Bhavya', 'Chaitanya', 'Ishaan', 'Kavya',
    'Kiara', 'Mansi', 'Myra', 'Nikhil', 'Pari', 'Pranav', 'Riya', 'Saanvi', 'Shaurya', 'Vihaan',
    'Zoya', 'Aditya', 'Aanya', 'Aryan', 'Diya', 'Eshan', 'Hiba', 'Kabir', 'Meher', 'Reyansh'
};

List<String> lastNames = new List<String>{
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Mehta', 'Kumar', 'Kapoor', 'Iyer',
    'Khan', 'Das', 'Joshi', 'Dubey', 'Trivedi', 'Naidu', 'Choudhary', 'Rao', 'Bose', 'Malik'
};

List<String> fatherNames = new List<String>{
    'Rajesh', 'Suresh', 'Amit', 'Vikram', 'Anil', 'Sanjay', 'Manoj', 'Ravi', 'Deepak', 'Arun'
};

List<String> motherNames = new List<String>{
    'Sunita', 'Anita', 'Meena', 'Kavita', 'Pooja', 'Ritu', 'Seema', 'Geeta', 'Neelam', 'Rekha'
};

List<Account> newStudents = new List<Account>();
List<Opportunity> newAdmissions = new List<Opportunity>();
List<OpportunityLineItem> newFees = new List<OpportunityLineItem>();
Integer globalRollCount = 1;

// Fetch Pricebooks and create a map: ClassName -> Pricebook2Id
Map<String, Id> pbMap = new Map<String, Id>();
for (Pricebook2 pb : [SELECT Id, Name FROM Pricebook2 WHERE IsActive = true AND Name LIKE '%2025%']) {
    for (String c : classes) {
        String pbSearchName = c.replace('-', ' ') + ' -';
        if (pb.Name.startsWith(pbSearchName)) {
            pbMap.put(c, pb.Id);
        }
    }
}

// Fetch PricebookEntries
Map<Id, List<PricebookEntry>> pbeMap = new Map<Id, List<PricebookEntry>>();
for (PricebookEntry pbe : [SELECT Id, Pricebook2Id, UnitPrice FROM PricebookEntry WHERE IsActive = true AND Pricebook2Id IN :pbMap.values()]) {
    if (!pbeMap.containsKey(pbe.Pricebook2Id)) {
        pbeMap.put(pbe.Pricebook2Id, new List<PricebookEntry>());
    }
    pbeMap.get(pbe.Pricebook2Id).add(pbe);
}

for (String cls : classes) {
    Id pbId = pbMap.get(cls);
    
    for (String sec : sections) {
        for (Integer i = 1; i <= 30; i++) {
            String fn = firstNames[Math.mod(globalRollCount, firstNames.size())];
            String ln = lastNames[Math.mod(globalRollCount, lastNames.size())];
            String father = fatherNames[Math.mod(globalRollCount, fatherNames.size())];
            String mother = motherNames[Math.mod(globalRollCount, motherNames.size())];
            
            Account a = new Account(
                RecordTypeId = rtId,
                FirstName = fn,
                LastName = ln,
                Father_Name__c = father + ' ' + ln,
                Mother_Name__c = mother + ' ' + ln,
                PersonMobilePhone = '9' + (String.valueOf(globalRollCount).leftpad(9,'0')).substring(0, 9),
                PersonBirthdate = Date.newInstance(2015 + classes.indexOf(cls), Math.mod(i, 11) + 1, Math.mod(i, 27) + 1),
                Class__c = cls,
                Section__c = sec,
                Roll_No__c = cls.replace('-', '').replace(' ', '') + '-' + sec + '-' + (i < 10 ? '0' + i : String.valueOf(i)),
                Type = 'Student',
                PersonEmail = fn.toLowerCase() + globalRollCount + '@example.com',
                BillingStreet = 'Street ' + i + ', Block ' + sec,
                BillingCity = 'Hyderabad',
                BillingState = 'Telangana',
                BillingPostalCode = '500001',
                BillingCountry = 'India'
            );
            newStudents.add(a);
            
            globalRollCount++;
        }
    }
}

insert newStudents;
System.debug('Inserted ' + newStudents.size() + ' Accounts');

for (Account acc : newStudents) {
    String oppName = acc.FirstName + ' ' + acc.LastName + ' - Admission ' + ayName + ' (' + acc.Class__c + ')';
    Id pbId = pbMap.get(acc.Class__c);
    
    Opportunity opp = new Opportunity(
        Name = oppName.left(120),
        AccountId = acc.Id,
        StageName = 'Closed Won',
        CloseDate = Date.today().addDays(30),
        Class__c = acc.Class__c,
        Section__c = acc.Section__c,
        Academic_Year__c = ayId,
        Pricebook2Id = pbId
    );
    newAdmissions.add(opp);
}

insert newAdmissions;
System.debug('Inserted ' + newAdmissions.size() + ' Opportunities');

for (Opportunity opp : newAdmissions) {
    if (opp.Pricebook2Id != null && pbeMap.containsKey(opp.Pricebook2Id)) {
        for (PricebookEntry pbe : pbeMap.get(opp.Pricebook2Id)) {
            newFees.add(new OpportunityLineItem(
                OpportunityId = opp.Id,
                PricebookEntryId = pbe.Id,
                Quantity = 1,
                UnitPrice = pbe.UnitPrice
            ));
        }
    }
}

insert newFees;
System.debug('Inserted ' + newFees.size() + ' OpportunityLineItems');
